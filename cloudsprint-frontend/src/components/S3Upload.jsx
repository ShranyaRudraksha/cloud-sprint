import { useState } from "react";
import { FaUpload, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { getUploadUrl } from "../api/s3";

export default function S3Upload({ bucketName }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setMessage("");
    try {
      const uploadUrl = await getUploadUrl(bucketName, file.name, file.type || "application/octet-stream");
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!res.ok) throw new Error(`S3 rejected the upload (HTTP ${res.status})`);
      setStatus("success");
      setMessage(`${file.name} uploaded.`);
      setFile(null);
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.error || err.message || "Upload failed");
    }
  };

  return (
    <div className="s3-upload">
      <input
        type="file"
        className="s3-upload-input"
        onChange={e => { setFile(e.target.files[0] || null); setStatus("idle"); setMessage(""); }}
      />
      <button className="btn btn-teardown" onClick={handleUpload} disabled={!file || status === "uploading"}>
        <FaUpload /> {status === "uploading" ? "Uploading..." : "Upload"}
      </button>
      {status === "success" && <div className="s3-upload-msg s3-upload-success"><FaCheckCircle /> {message}</div>}
      {status === "error" && <div className="s3-upload-msg s3-upload-error"><FaExclamationCircle /> {message}</div>}
    </div>
  );
}
