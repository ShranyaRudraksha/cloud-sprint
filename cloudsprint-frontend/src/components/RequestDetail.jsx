// src/components/ResourceDetail.jsx
import { FaCopy } from "react-icons/fa";

const LABELS = {
  ec2_public_ip: "Public IP",
  ec2_instance_id: "Instance ID",
  s3_bucket_name: "Bucket Name",
  iam_user_name: "IAM User",
  iam_user_arn: "User ARN",
};

function CopyRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-key">{label}</span>
      <span className="detail-val">
        {value}
        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(value)} title="Copy">
          <FaCopy />
        </button>
      </span>
    </div>
  );
}

export default function ResourceDetail({ request }) {
  const details = request.resource_details || {};
  const entries = Object.entries(details).filter(([k]) => LABELS[k]);

  if (request.status !== "active" || entries.length === 0) {
    return (
      <div className="detail-panel">
        <div className="detail-row">
          <span className="detail-key">
            {request.status === "provisioning" ? "Provisioning in progress — details will appear once complete." :
             request.status === "pending" ? "Awaiting approval — nothing provisioned yet." :
             "No live resource details for this request."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-panel">
      {entries.map(([key, val]) => (
        <CopyRow key={key} label={LABELS[key]} value={val} />
      ))}
      {request.resource_type === "ec2" && details.ec2_public_ip && (
        <CopyRow label="SSH Command" value={`ssh -i your-key.pem ec2-user@${details.ec2_public_ip}`} />
      )}
    </div>
  );
}