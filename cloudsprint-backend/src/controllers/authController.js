const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

async function register(req, res) {
  const { name, email, password, organization_name } = req.body;
  if (!name || !email || !password || !organization_name) {
    return res.status(400).json({ error: "name, email, password, organization_name are required" });
  }

  try {
    const existing = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    // Find or create the organization
    let orgResult = await pool.query(`SELECT id FROM organizations WHERE name = $1`, [organization_name]);
    let orgId;
    let isFirstUserInOrg = false;
    if (orgResult.rows.length === 0) {
      const newOrg = await pool.query(`INSERT INTO organizations (name) VALUES ($1) RETURNING id`, [organization_name]);
      orgId = newOrg.rows[0].id;
      isFirstUserInOrg = true; // first user to create an org becomes its admin
    } else {
      orgId = orgResult.rows[0].id;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = isFirstUserInOrg ? "admin" : "requester";

    const result = await pool.query(
      `INSERT INTO users (org_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, org_id`,
      [orgId, name, email, passwordHash, role]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, org_id: user.org_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });

  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.org_id, o.name AS org_name
       FROM users u JOIN organizations o ON u.org_id = o.id
       WHERE u.email = $1`,
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, org_id: user.org_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    delete user.password_hash;

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
}

module.exports = { register, login };