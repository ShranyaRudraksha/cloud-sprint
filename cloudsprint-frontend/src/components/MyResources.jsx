// src/components/MyResources.jsx
import { useEffect, useState } from "react";
import { FaServer, FaBoxOpen, FaUserShield, FaNetworkWired, FaCopy, FaExternalLinkAlt } from "react-icons/fa";
import { getMyResources } from "../api/requests";
import S3Upload from "./S3Upload";

const ICONS = { ec2: FaServer, s3: FaBoxOpen, iam: FaUserShield, vpc: FaNetworkWired };
const LABELS = { ec2: "EC2 Instances", s3: "S3 Buckets", iam: "IAM Users", vpc: "VPC Networks" };
const AWS_REGION = "ap-south-1";

function CopyRow({ k, v }) {
  return (
    <div className="detail-row">
      <span className="detail-key">{k}</span>
      <span className="detail-val">{v} <FaCopy className="copy-btn" onClick={() => navigator.clipboard.writeText(v)} title="Copy" /></span>
    </div>
  );
}

export default function MyResources() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    getMyResources().then(setResources).catch(console.error);
  }, []);

  const grouped = { ec2: [], s3: [], iam: [], vpc: [] };
  resources.forEach(r => grouped[r.resource_type]?.push(r));

  return (
    <div>
      {Object.entries(grouped).map(([type, items]) => {
        if (items.length === 0) return null;
        const Icon = ICONS[type];
        return (
          <div key={type} style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 14, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {LABELS[type]} ({items.length})
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {items.map(r => {
                const details = r.resource_details || {};
                return (
                  <div className="card" key={r.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div className="stat-icon" style={{ background: "var(--green-dim)", color: "var(--green)" }}><Icon /></div>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.resource_id}</div>
                    </div>

                    {Object.entries(details).map(([k, v]) => <CopyRow key={k} k={k} v={v} />)}

                    {type === "ec2" && details.ec2_instance_id && (
                      <a
                        className="btn btn-teardown"
                        style={{ marginTop: 12, width: "100%", justifyContent: "center" }}
                        href={`https://${AWS_REGION}.console.aws.amazon.com/ec2/home?region=${AWS_REGION}#ConnectToInstance:instanceId=${details.ec2_instance_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaExternalLinkAlt /> Open Console (Connect)
                      </a>
                    )}

                    {type === "s3" && <S3Upload bucketName={r.resource_id} />}
                  </div>
                );
              })}
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
