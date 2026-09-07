// src/components/Sidebar.jsx
import { FaBolt, FaListUl, FaPlusCircle, FaUserShield, FaUser, FaBoxOpen } from "react-icons/fa";

export default function Sidebar({ view, setView, isAdmin }) {
  const items = [
    { key: "requests", label: isAdmin ? "All Requests" : "My Requests", icon: FaListUl },
    { key: "resources", label: "My Resources", icon: FaBoxOpen },
    { key: "new", label: "New Request", icon: FaPlusCircle },
  ];
  return (
    <div className={`sidebar ${isAdmin ? "sidebar-admin" : "sidebar-requester"}`}>
      <div className="brand">
        <div className="brand-icon"><FaBolt /></div>
        <h1>InfraOnDemand</h1>
      </div>
      <div className={`role-tag ${isAdmin ? "role-tag-admin" : "role-tag-requester"}`}>
        {isAdmin ? <FaUserShield /> : <FaUser />} {isAdmin ? "Admin Panel" : "Requester Panel"}
      </div>
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