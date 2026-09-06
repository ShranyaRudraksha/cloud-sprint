import { useEffect, useRef, useState } from "react";
import { FaTimes, FaBan } from "react-icons/fa";

export default function RejectModal({ open, requestLabel, onCancel, onConfirm }) {
  const [reason, setReason] = useState("");

  // The parent re-renders on every polling tick, handing us a fresh
  // onCancel/onConfirm reference each time. Keep the latest via ref instead
  // of depending on them directly, so this effect only fires on an actual
  // open/close transition — not on every unrelated parent re-render, which
  // would otherwise wipe out whatever the admin has typed mid-edit.
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!open) return;
    setReason("");
    const onKeyDown = (e) => { if (e.key === "Escape") onCancelRef.current(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => onConfirm(reason.trim() || "No reason provided");

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon"><FaBan /></div>
          <div>
            <h3>Reject Request</h3>
            {requestLabel && <div className="modal-sub">{requestLabel}</div>}
          </div>
          <button className="modal-close" onClick={onCancel} aria-label="Close"><FaTimes /></button>
        </div>

        <label className="modal-label">Reason for rejection</label>
        <textarea
          className="modal-textarea"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Bucket naming convention violates team policy"
          rows={3}
          autoFocus
        />
        <div className="modal-hint">The requester will see this on their request.</div>

        <div className="modal-actions">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn btn-reject" onClick={handleConfirm}><FaBan /> Reject Request</button>
        </div>
      </div>
    </div>
  );
}
