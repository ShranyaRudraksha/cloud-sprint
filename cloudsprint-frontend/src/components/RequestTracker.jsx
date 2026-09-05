import { FaClipboardList, FaUserCheck, FaCogs, FaCheckCircle, FaTimes, FaExclamationTriangle, FaTrashAlt, FaHeadset } from "react-icons/fa";
import { formatDateTime } from "../utils/formatDate";

const STEPS = [
  { label: "Requested", icon: FaClipboardList },
  { label: "Approved", icon: FaUserCheck },
  { label: "Provisioning", icon: FaCogs },
  { label: "Live", icon: FaCheckCircle },
];

// Each status maps to a state per step: "done" | "current" | "pending" | "error"
const STEP_STATES = {
  pending:         ["done", "current", "pending", "pending"],
  rejected:        ["done", "error",   "pending", "pending"],
  provisioning:    ["done", "done",    "current", "pending"],
  failed:          ["done", "done",    "error",   "pending"],
  active:          ["done", "done",    "done",    "done"],
  destroying:      ["done", "done",    "done",    "done"],
  destroyed:       ["done", "done",    "done",    "done"],
  teardown_failed: ["done", "done",    "done",    "done"],
};

function Dot({ state, Icon }) {
  return (
    <div className={`tracker-dot tracker-dot-${state}`}>
      {state === "error" ? <FaTimes /> : <Icon />}
    </div>
  );
}

export default function RequestTracker({ request, orgAdmins }) {
  const states = STEP_STATES[request.status] || ["done", "pending", "pending", "pending"];

  const contactLine = orgAdmins?.length > 0 && (
    <div className="tracker-contact">
      <FaHeadset />
      <span>
        Contact {orgAdmins.map((a, i) => (
          <span key={a.email}>
            <strong>{a.name}</strong> ({a.email}){i < orgAdmins.length - 1 ? ", " : ""}
          </span>
        ))} to move this forward.
      </span>
    </div>
  );

  return (
    <div className="tracker-wrap">
      <div className="tracker">
        {STEPS.map((step, i) => (
          <div className="tracker-step" key={step.label}>
            <Dot state={states[i]} Icon={step.icon} />
            <div className="tracker-label">{step.label}</div>
            {i < STEPS.length - 1 && <div className={`tracker-line ${states[i] === "done" ? "tracker-line-done" : ""}`} />}
          </div>
        ))}
      </div>

      {request.status === "pending" && (
        <div className="tracker-banner tracker-banner-info">
          <FaExclamationTriangle />
          <span>Awaiting admin approval — nothing has been provisioned yet.</span>
        </div>
      )}
      {request.status === "pending" && contactLine}

      {request.status === "rejected" && (
        <div className="tracker-banner tracker-banner-error">
          <FaTimes />
          <span>Rejected{request.approval_approver ? ` by ${request.approval_approver}` : ""}: {request.approval_remarks || "No reason given."}</span>
        </div>
      )}
      {request.status === "rejected" && contactLine}

      {request.status === "failed" && (
        <div className="tracker-banner tracker-banner-error">
          <FaExclamationTriangle />
          <span>Provisioning failed. Check the console below for the Terraform error.</span>
        </div>
      )}
      {request.status === "failed" && contactLine}

      {request.status === "teardown_failed" && (
        <div className="tracker-banner tracker-banner-error">
          <FaExclamationTriangle />
          <span>Teardown failed — the resource may still exist in AWS. Check the console below.</span>
        </div>
      )}
      {request.status === "teardown_failed" && contactLine}

      {request.status === "destroying" && (
        <div className="tracker-banner tracker-banner-info">
          <FaTrashAlt />
          <span>Tearing down this resource...</span>
        </div>
      )}
      {request.status === "destroyed" && (
        <div className="tracker-banner tracker-banner-muted">
          <FaTrashAlt />
          <span>This resource was decommissioned on {formatDateTime(request.updated_at)}.</span>
        </div>
      )}
      {request.status === "active" && (
        <div className="tracker-banner tracker-banner-success">
          <FaCheckCircle />
          <span>Live since {formatDateTime(request.updated_at)}.</span>
        </div>
      )}
    </div>
  );
}
