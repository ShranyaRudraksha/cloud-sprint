import { FaClipboardList, FaHourglassHalf, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function StatsBar({ requests }) {
  const total = requests.length;
  const pending = requests.filter(r => r.status === "pending").length;
  const active = requests.filter(r => r.status === "active").length;
  const failed = requests.filter(r => ["failed", "rejected", "teardown_failed"].includes(r.status)).length;

  const stats = [
    { label: "Total Requests", value: total, icon: FaClipboardList, bg: "var(--blue-light)", fg: "var(--blue)" },
    { label: "Pending Approval", value: pending, icon: FaHourglassHalf, bg: "var(--amber-light)", fg: "var(--amber)" },
    { label: "Active Resources", value: active, icon: FaCheckCircle, bg: "var(--green-light)", fg: "var(--green)" },
    { label: "Failed / Rejected", value: failed, icon: FaExclamationTriangle, bg: "var(--red-light)", fg: "var(--red)" },
  ];

  return (
    <div className="stats-row">
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg, color: s.fg }}><Icon /></div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}