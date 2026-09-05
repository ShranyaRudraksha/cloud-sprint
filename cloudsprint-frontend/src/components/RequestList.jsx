import { FaServer, FaBoxOpen, FaUserShield, FaCheck, FaTimes, FaTrashAlt, FaInbox } from "react-icons/fa";
import { decideRequest, teardownRequest } from "../api/requests";
import StatusBadge from "./StatusBadge";

const TYPE_ICON = { ec2: FaServer, s3: FaBoxOpen, iam: FaUserShield };

export default function RequestList({ requests, onChanged, isAdmin, currentUser }) {
  const approve = async (id) => { await decideRequest(id, "approved", currentUser.name); onChanged(); };
  const reject = async (id) => { await decideRequest(id, "rejected", currentUser.name, "Rejected via dashboard"); onChanged(); };
  const teardown = async (id) => { await teardownRequest(id, currentUser.name); onChanged(); };

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
            return (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>{r.requester_name}</td>
                <td>
                  <span className="resource-tag">
                    <span className="r-icon"><Icon /></span> {r.resource_type.toUpperCase()}
                  </span>
                </td>
                <td><StatusBadge status={r.status} /></td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
                <td>
                  {r.status === "pending" && isAdmin &&(
                    <>
                      <button className="btn btn-approve" onClick={() => approve(r.id)}><FaCheck /> Approve</button>
                      <button className="btn btn-reject" onClick={() => reject(r.id)}><FaTimes /> Reject</button>
                    </>
                  )}
                  {r.status === "active" && (isAdmin || r.user_id === currentUser.id) && (
                    <button className="btn btn-teardown" onClick={() => teardown(r.id)}><FaTrashAlt /> Teardown</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}