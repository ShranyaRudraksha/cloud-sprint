import { FaHourglassHalf, FaSpinner, FaCheckCircle, FaTimesCircle, FaTrashAlt } from "react-icons/fa";

const CONFIG = {
  pending:         { bg: "var(--amber-dim)", fg: "var(--amber)", icon: FaHourglassHalf },
  provisioning:    { bg: "var(--blue-dim)",  fg: "var(--blue)",  icon: FaSpinner, spin: true },
  active:          { bg: "var(--green-dim)", fg: "var(--green)", icon: FaCheckCircle },
  rejected:        { bg: "var(--red-dim)",   fg: "var(--red)",   icon: FaTimesCircle },
  failed:          { bg: "var(--red-dim)",   fg: "var(--red)",   icon: FaTimesCircle },
  destroying:      { bg: "var(--grey-dim)",  fg: "var(--grey)",  icon: FaSpinner, spin: true },
  destroyed:       { bg: "var(--grey-dim)",  fg: "var(--grey)",  icon: FaTrashAlt },
  teardown_failed: { bg: "var(--red-dim)",   fg: "var(--red)",   icon: FaTimesCircle },
};

export default function StatusBadge({ status }) {
  const c = CONFIG[status] || CONFIG.destroyed;
  const Icon = c.icon;
  return (
    <span className={`badge ${c.spin ? "spin" : ""}`} style={{ background: c.bg, color: c.fg }}>
      <Icon /> {status}
    </span>
  );
}