// In-memory console output per request. Cleared and rebuilt each time a
// request is (re-)provisioned or torn down. Lost on server restart — that's
// fine, it's a live-progress view, not an audit trail (the audit_log table
// already covers that).
const logs = new Map();

function clear(requestId) {
  logs.set(requestId, []);
}

function append(requestId, line) {
  if (!logs.has(requestId)) logs.set(requestId, []);
  logs.get(requestId).push(line);
}

function get(requestId) {
  return logs.get(requestId) || [];
}

module.exports = { clear, append, get };
