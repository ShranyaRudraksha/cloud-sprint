// src/components/RequestForm.jsx
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { FaServer, FaBoxOpen, FaUserShield, FaPaperPlane, FaUser, FaInfoCircle, FaNetworkWired } from "react-icons/fa";
import { createRequest } from "../api/requests";

const TYPES = [
  { key: "ec2", label: "EC2 Instance", icon: FaServer, eta: "~60-90 sec", note: "A live server you can SSH into." },
  { key: "s3", label: "S3 Bucket", icon: FaBoxOpen, eta: "~10-20 sec", note: "Versioned, private by default." },
  { key: "iam", label: "IAM User", icon: FaUserShield, eta: "~5-10 sec", note: "Scoped access, no console login." },
  { key: "vpc", label: "VPC Network", icon: FaNetworkWired, eta: "~30-45 sec", note: "Isolated network with a public subnet." },
];

// t3.micro only: AWS narrowed Free Tier EC2 eligibility by account age/region,
// and t2.micro isn't eligible on this account (confirmed via a real
// InvalidParameterCombination error from RunInstances) — t3.micro is.
const INSTANCE_TYPES = [
  { value: "t3.micro", label: "t3.micro — 2 vCPU, 1 GiB RAM (Free tier eligible)" },
];

const IAM_POLICIES = [
  { value: "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess", label: "AmazonS3ReadOnlyAccess" },
  { value: "arn:aws:iam::aws:policy/AmazonS3FullAccess", label: "AmazonS3FullAccess" },
  { value: "arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess", label: "AmazonEC2ReadOnlyAccess" },
  { value: "arn:aws:iam::aws:policy/ReadOnlyAccess", label: "ReadOnlyAccess — all services" },
  { value: "arn:aws:iam::aws:policy/PowerUserAccess", label: "PowerUserAccess" },
];

const AVAILABILITY_ZONES = [
  { value: "ap-south-1a", label: "ap-south-1a" },
  { value: "ap-south-1b", label: "ap-south-1b" },
  { value: "ap-south-1c", label: "ap-south-1c" },
];

const FIELDS = {
  ec2: [{ key: "instance_type", label: "Instance Type", type: "select", options: INSTANCE_TYPES, default: "t3.micro" }],
  s3: [{ key: "bucket_name", label: "Bucket Name", default: "" }],
  iam: [
    { key: "iam_user_name", label: "IAM User Name", default: "" },
    { key: "iam_policy_arn", label: "Policy ARN", type: "select", options: IAM_POLICIES, default: "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess" },
  ],
  vpc: [
    { key: "vpc_cidr", label: "VPC CIDR", default: "10.0.0.0/16" },
    { key: "subnet_cidr", label: "Subnet CIDR", default: "10.0.1.0/24" },
    { key: "availability_zone", label: "Availability Zone", type: "select", options: AVAILABILITY_ZONES, default: "ap-south-1a" },
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
            {f.type === "select" ? (
              <select value={params[f.key] || ""} onChange={e => setParams({ ...params, [f.key]: e.target.value })} required>
                {f.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            ) : (
              <input value={params[f.key] || ""} onChange={e => setParams({ ...params, [f.key]: e.target.value })} required />
            )}
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
        {FIELDS[resourceType].map(f => {
          const rawValue = params[f.key] || "—";
          const displayValue = f.type === "select"
            ? f.options.find(opt => opt.value === params[f.key])?.label || rawValue
            : rawValue;
          return (
            <div className="preview-row" key={f.key}>
              <span className="k">{f.label}</span><span className="v">{displayValue}</span>
            </div>
          );
        })}
        <div className="preview-row"><span className="k">Est. provisioning time</span><span className="v">{activeType.eta}</span></div>
        <div className="preview-row"><span className="k">Approval required</span><span className="v">Yes</span></div>

        <div className="preview-note">
          <FaInfoCircle /> Nothing is created in AWS until an admin approves this request.
        </div>
      </div>
    </div>
  );
}