// src/components/MyResources.jsx
import { useEffect, useState } from "react";
import { FaServer, FaBoxOpen, FaUserShield, FaCopy } from "react-icons/fa";
import axios from "axios";

const ICONS = { ec2: FaServer, s3: FaBoxOpen, iam: FaUserShield };

export default function MyResources() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
    const token = localStorage.getItem("token");
    api.get("/requests/my-resources", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setResources(res.data));
  }, []);

  const grouped = { ec2: [], s3: [], iam: [] };
  resources.forEach(r => grouped[r.resource_type]?.push(r));

  return (
    <div>
      {Object.entries(grouped).map(([type, items]) => {
        if (items.length === 0) return null;
        const Icon = ICONS[type];
        return (
          <div key={type} style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 14, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {type === "ec2" ? "EC2 Instances" : type === "s3" ? "S3 Buckets" : "IAM Users"} ({items.length})
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {items.map(r => (
                <div className="card" key={r.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div className="stat-icon" style={{ background: "var(--green-dim)", color: "var(--green)" }}><Icon /></div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.resource_id}</div>
                  </div>
                  {Object.entries(r.resource_details || {}).map(([k, v]) => (
                    <div className="detail-row" key={k}>
                      <span className="detail-key">{k}</span>
                      <span className="detail-val">{v} <FaCopy className="copy-btn" onClick={() => navigator.clipboard.writeText(v)} /></span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {resources.length === 0 && (
        <div className="card"><div className="empty-state">You don't have any active resources yet.</div></div>
      )}
    </div>
  );
}