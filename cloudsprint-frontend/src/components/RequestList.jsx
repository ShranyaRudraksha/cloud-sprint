import { Fragment, useEffect, useState } from "react";
import { FaServer, FaBoxOpen, FaUserShield, FaNetworkWired, FaCheck, FaTimes, FaTrashAlt, FaInbox, FaTerminal, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { decideRequest, teardownRequest, getOrgAdmins } from "../api/requests";
import StatusBadge from "./StatusBadge";
import RequestConsole from "./RequestConsole";
import RequestTracker from "./RequestTracker";
import RejectModal from "./RejectModal";
import { formatDateTime } from "../utils/formatDate";

const TYPE_ICON = { ec2: FaServer, s3: FaBoxOpen, iam: FaUserShield, vpc: FaNetworkWired };
const HAS_CONSOLE_OUTPUT = ["provisioning", "active", "failed", "destroying", "destroyed", "teardown_failed"];

export default function RequestList({ requests, onChanged, isAdmin, currentUser }) {
  const [expanded, setExpanded] = useState(new Set());
  const [orgAdmins, setOrgAdmins] = useState([]);
  const [rejectTarget, setRejectTarget] = useState(null);

  useEffect(() => { getOrgAdmins().then(setOrgAdmins).catch(() => {}); }, []);

  const approve = async (id) => { await decideRequest(id, "approved", currentUser.name); onChanged(); };
  const confirmReject = async (reason) => {
    await decideRequest(rejectTarget.id, "rejected", currentUser.name, reason);
    setRejectTarget(null);
    onChanged();
  };
  const teardown = async (id) => { await teardownRequest(id, currentUser.name); onChanged(); };
  const toggleConsole = (id) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  if (requests.length === 0) {
    return (
      <div className="card">  
        <div className="empty-state">
          <div className="e-icon"><FaInbox /></div>
          <div>No requests yet — submit one from "New Request"</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Requester</th><th>Resource</th><th>Status</th><th>Created</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => {
            const Icon = TYPE_ICON[r.resource_type] || FaServer;
            const isOwnerOrAdmin = isAdmin || r.user_id === currentUser.id;
            const showConsole = HAS_CONSOLE_OUTPUT.includes(r.status) && isOwnerOrAdmin;
            const isOpen = expanded.has(r.id);
            return (
              <Fragment key={r.id}>
                <tr className={isOpen ? "expanded" : ""}>
                  <td>
                    {isOwnerOrAdmin && (
                      <span className="row-toggle" onClick={() => toggleConsole(r.id)} style={{ marginRight: 6 }}>
                        {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                      </span>
                    )}
                    #{r.id}
                  </td>
                  <td>{r.requester_name}</td>
                  <td>
                    <span className="resource-tag">
                      <span className="r-icon"><Icon /></span> {r.resource_type.toUpperCase()}
                    </span>
                  </td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{formatDateTime(r.created_at)}</td>
                  <td>
                    {r.status === "pending" && isAdmin &&(
                      <>
                        <button className="btn btn-approve" onClick={() => approve(r.id)}><FaCheck /> Approve</button>
                        <button className="btn btn-reject" onClick={() => setRejectTarget(r)}><FaTimes /> Reject</button>
                      </>
                    )}
                    {r.status === "active" && (isAdmin || r.user_id === currentUser.id) && (
                      <button className="btn btn-teardown" onClick={() => teardown(r.id)}><FaTrashAlt /> Teardown</button>
                    )}
                    {isOwnerOrAdmin && (
                      <button className="btn btn-teardown" onClick={() => toggleConsole(r.id)}><FaTerminal /> Track</button>
                    )}
                  </td>
                </tr>
                {isOpen && (
                  <tr key={`${r.id}-console`}>
                    <td colSpan={6} style={{ padding: "0 12px 14px" }}>
                      <RequestTracker request={r} orgAdmins={orgAdmins} />
                      {showConsole && <RequestConsole requestId={r.id} status={r.status} />}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>

      <RejectModal
        open={rejectTarget !== null}
        requestLabel={rejectTarget ? `#${rejectTarget.id} · ${rejectTarget.resource_type.toUpperCase()} · ${rejectTarget.requester_name}` : ""}
        onCancel={() => setRejectTarget(null)}
        onConfirm={confirmReject}
      />
    </div>
  );
}