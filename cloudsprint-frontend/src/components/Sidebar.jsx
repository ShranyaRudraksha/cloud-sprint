// src/components/Sidebar.jsx
import { FaBolt, FaListUl, FaPlusCircle } from "react-icons/fa";

export default function Sidebar({ view, setView }) {
  const items = [
    { key: "requests", label: "Requests", icon: FaListUl },
    { key: "new", label: "New Request", icon: FaPlusCircle },
  ];
  return (
    <div className="sidebar">
      <div className="brand">
        <div className="brand-icon"><FaBolt /></div>
        <h1>InfraOnDemand</h1>
      </div>
      <div className="brand-tag">Self-Service Provisioning</div>
      {items.map(i => {
        const Icon = i.icon;
        return (
          <div key={i.key} className={`nav-item ${view === i.key ? "active" : ""}`} onClick={() => setView(i.key)}>
            <Icon /> {i.label}
          </div>
        );
      })}
    </div>
  );
}