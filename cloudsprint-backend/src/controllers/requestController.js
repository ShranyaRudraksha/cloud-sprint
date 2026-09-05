const pool = require("../config/db");
const { provisionResource, destroyResource, logStore } = require("../services/terraformService");
const { requireAuth, requireAdmin } = require("../middleware/auth");
// Create a new request (status: pending)
async function createRequest(req, res) {
  const { resource_type, parameters } = req.body;
  const { id: user_id, org_id } = req.user;

  if (!resource_type || !parameters) {
    return res.status(400).json({
      error: "resource_type and parameters are required"
    });
  }

  try {
    // Get requester name from authenticated user
    const userResult = await pool.query(
      `SELECT name FROM users WHERE id = $1`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    const requester_name = userResult.rows[0].name;

    // Make S3 bucket name unique
    if (resource_type === "s3" && parameters.bucket_name) {
      const suffix = Date.now().toString(36);
      parameters.bucket_name =
        `${parameters.bucket_name}-${suffix}`.toLowerCase();
    }

    // Insert request
    const result = await pool.query(
      `INSERT INTO requests
       (requester_name, resource_type, parameters, status, user_id, org_id)
       VALUES ($1, $2, $3, 'pending', $4, $5)
       RETURNING *`,
      [
        requester_name,
        resource_type,
        parameters,
        user_id,
        org_id
      ]
    );

    const request = result.rows[0];

    // Insert audit log
    await pool.query(
      `INSERT INTO audit_log
       (request_id, action, actor, details)
       VALUES ($1, $2, $3, $4)`,
      [
        request.id,
        "created",
        requester_name,
        `Requested ${resource_type}`
      ]
    );

    res.status(201).json(request);

  } catch (err) {
    console.error("Create request error:", err);

    res.status(500).json({
      error: "Failed to create request"
    });
  }
}

// List all requests
// src/controllers/requestController.js — replace getRequests
async function getRequests(req, res) {
  try {
    const isAdmin = req.user.role === "admin";
    const result = await pool.query(
      `SELECT r.*, i.resource_id, i.resource_details, i.status AS inventory_status,
              la.approver_name AS approval_approver, la.decision AS approval_decision, la.remarks AS approval_remarks
       FROM requests r
       LEFT JOIN inventory i ON i.request_id = r.id
       LEFT JOIN LATERAL (
         SELECT approver_name, decision, remarks
         FROM approvals ap
         WHERE ap.request_id = r.id
         ORDER BY decided_at DESC
         LIMIT 1
       ) la ON true
       WHERE r.org_id = $1 AND ($2 OR r.user_id = $3)
       ORDER BY r.created_at DESC`,
      [req.user.org_id, isAdmin, req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
}

// Approve or reject a request
async function decideRequest(req, res) {
  const { id } = req.params;
  const { decision, approver_name, remarks } = req.body; // decision: 'approved' | 'rejected'

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "decision must be 'approved' or 'rejected'" });
  }

  try {
    const requestResult = await pool.query(`SELECT * FROM requests WHERE id = $1`, [id]);
    const request = requestResult.rows[0];
    if (!request) return res.status(404).json({ error: "Request not found" });

    await pool.query(
      `INSERT INTO approvals (request_id, approver_name, decision, remarks) VALUES ($1, $2, $3, $4)`,
      [id, approver_name, decision, remarks || null]
    );

    const newStatus = decision === "approved" ? "provisioning" : "rejected";
    await pool.query(`UPDATE requests SET status = $1, updated_at = NOW() WHERE id = $2`, [newStatus, id]);

    await pool.query(
      `INSERT INTO audit_log (request_id, action, actor, details) VALUES ($1, $2, $3, $4)`,
      [id, decision, approver_name, remarks || ""]
    );

    res.json({ message: `Request ${decision}`, request_id: id });

    // If approved, kick off provisioning asynchronously — don't make the caller wait
    if (decision === "approved") {
      provisionResource(request)
        .then(async (result) => {
          await pool.query(`UPDATE requests SET status = 'active', updated_at = NOW() WHERE id = $1`, [id]);
          await pool.query(
            `INSERT INTO inventory (request_id, resource_id, resource_details) VALUES ($1, $2, $3)`,
            [id, result.resource_id, result.resource_details]
          );
          await pool.query(
            `INSERT INTO audit_log (request_id, action, actor, details) VALUES ($1, 'provisioned', 'system', $2)`,
            [id, JSON.stringify(result)]
          );
        })
        .catch(async (err) => {
          console.error("Provisioning failed:", err);
          await pool.query(`UPDATE requests SET status = 'failed', updated_at = NOW() WHERE id = $1`, [id]);
        });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process decision" });
  }
}

// Add to src/controllers/requestController.js


// (update the import line above to include destroyResource)

async function teardownRequest(req, res) {
  const { id } = req.params;
  const { actor } = req.body; // who's tearing it down

  try {
    const requestResult = await pool.query(`SELECT * FROM requests WHERE id = $1`, [id]);
    const request = requestResult.rows[0];
    if (!request) return res.status(404).json({ error: "Request not found" });

    if (request.org_id !== req.user.org_id) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (req.user.role !== "admin" && request.user_id !== req.user.id) {
      return res.status(403).json({ error: "You can only teardown your own resources" });
    }

    if (request.status !== "active") {
      return res.status(400).json({ error: `Cannot teardown a request with status '${request.status}'` });
    }

    await pool.query(`UPDATE requests SET status = 'destroying', updated_at = NOW() WHERE id = $1`, [id]);
    res.json({ message: "Teardown started", request_id: id });

    // Run destroy asynchronously — don't make the caller wait
    destroyResource(request)
      .then(async () => {
        await pool.query(`UPDATE requests SET status = 'destroyed', updated_at = NOW() WHERE id = $1`, [id]);
        await pool.query(`UPDATE inventory SET status = 'destroyed' WHERE request_id = $1`, [id]);
        await pool.query(
          `INSERT INTO audit_log (request_id, action, actor, details) VALUES ($1, 'destroyed', $2, 'Resource torn down')`,
          [id, actor || "system"]
        );
      })
      .catch(async (err) => {
        console.error("Teardown failed:", err);
        await pool.query(`UPDATE requests SET status = 'teardown_failed', updated_at = NOW() WHERE id = $1`, [id]);
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process teardown" });
  }
}


// src/controllers/requestController.js — add this function
async function getMyResources(req, res) {
  try {
    const result = await pool.query(
      `SELECT r.id, r.resource_type, r.status, r.created_at, i.resource_id, i.resource_details
       FROM requests r
       JOIN inventory i ON i.request_id = r.id
       WHERE r.user_id = $1 AND i.status = 'active'
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
}

async function getRequestLogs(req, res) {
  const { id } = req.params;

  try {
    const requestResult = await pool.query(`SELECT * FROM requests WHERE id = $1`, [id]);
    const request = requestResult.rows[0];
    if (!request) return res.status(404).json({ error: "Request not found" });

    if (request.org_id !== req.user.org_id) {
      return res.status(404).json({ error: "Request not found" });
    }
    if (req.user.role !== "admin" && request.user_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to view these logs" });
    }

    res.json({ logs: logStore.get(request.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
}

async function getOrgAdmins(req, res) {
  try {
    const result = await pool.query(
      `SELECT name, email FROM users WHERE org_id = $1 AND role = 'admin' ORDER BY name`,
      [req.user.org_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch organization admins" });
  }
}

module.exports = { createRequest, getRequests, decideRequest, teardownRequest, getMyResources, getRequestLogs, getOrgAdmins };




