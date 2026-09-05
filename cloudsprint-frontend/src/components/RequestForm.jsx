// src/components/RequestForm.jsx
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { FaServer, FaBoxOpen, FaUserShield, FaPaperPlane, FaUser, FaInfoCircle } from "react-icons/fa";
import { createRequest } from "../api/requests";

const TYPES = [
  { key: "ec2", label: "EC2 Instance", icon: FaServer, eta: "~60-90 sec", note: "A live server you can SSH into." },
  { key: "s3", label: "S3 Bucket", icon: FaBoxOpen, eta: "~10-20 sec", note: "Versioned, private by default." },
  { key: "iam", label: "IAM User", icon: FaUserShield, eta: "~5-10 sec", note: "Scoped access, no console login." },
];

const FIELDS = {
  ec2: [{ key: "instance_type", label: "Instance Type", default: "t3.micro" }],
  s3: [{ key: "bucket_name", label: "Bucket Name", default: "" }],
  iam: [
    { key: "iam_user_name", label: "IAM User Name", default: "" },
    { key: "iam_policy_arn", label: "Policy ARN", default: "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess" },
  ],
};

export default function RequestForm({ onCreated }) {
  const [resourceType, setResourceType] = useState("ec2");
  const [params, setParams] = useState({ instance_type: "t3.micro" });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  
  

  const activeType = TYPES.find(t => t.key === resourceType);

  const handleTypeChange = (type) => {
    setResourceType(type);
    const defaults = {};
    FIELDS[type].forEach(f => defaults[f.key] = f.default);
    setParams(defaults);
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createRequest({ resource_type: resourceType, parameters: params }); // no requester_name — backend reads it from the JWT
      onCreated();
    } catch (err) {
      alert("Failed to create request: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

    return (
    <div className="request-layout">
      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Requesting As</label>
          <div className="readonly-field">{user.name} · {user.org_name}</div>
        </div>

        <div className="form-group">
          <label>Resource Type</label>
          <div className="type-picker">
            {TYPES.map(t => {
              const Icon = t.icon;
              return (
                <div key={t.key} className={`type-card ${resourceType === t.key ? "selected" : ""}`} onClick={() => handleTypeChange(t.key)}>
                  <div className="t-icon"><Icon /></div>
                  <div className="t-label">{t.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {FIELDS[resourceType].map(f => (
          <div className="form-group" key={f.key}>
            <label>{f.label}</label>
            <input value={params[f.key] || ""} onChange={e => setParams({ ...params, [f.key]: e.target.value })} required />
          </div>
        ))}
        <div className="form-hint">Your request will be held for admin approval before anything is provisioned.</div>

        <button className="btn btn-primary" type="submit" disabled={submitting} style={{ marginTop: 14 }}>
          <FaPaperPlane /> {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      <div className="preview-card">
        <div className="preview-header">
          <div className="preview-icon"><activeType.icon /></div>
          <div>
            <div className="preview-title">{activeType.label}</div>
            <div className="preview-sub">{activeType.note}</div>
          </div>
        </div>

        <div className="preview-row"><span className="k">Requester</span><span className="v">{user.name || "—"}</span></div>
        {FIELDS[resourceType].map(f => (
          <div className="preview-row" key={f.key}>
            <span className="k">{f.label}</span><span className="v">{params[f.key] || "—"}</span>
          </div>
        ))}
        <div className="preview-row"><span className="k">Est. provisioning time</span><span className="v">{activeType.eta}</span></div>
        <div className="preview-row"><span className="k">Approval required</span><span className="v">Yes</span></div>

        <div className="preview-note">
          <FaInfoCircle /> Nothing is created in AWS until an admin approves this request.
        </div>
      </div>
    </div>
  );
}