import { useState } from "react";
import { FaCloud, FaUser, FaEnvelope, FaLock, FaBuilding } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Register({ goToLogin, goHome }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", organization_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await register(form);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand" onClick={goHome} style={{ cursor: "pointer" }}><FaCloud /></div>
        <h2>Create your account</h2>
        <p className="auth-sub">Register yourself and your organization</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label><FaUser /> Full Name</label>
          <input value={form.name} onChange={update("name")} required />
        </div>
        <div className="form-group">
          <label><FaBuilding /> Organization Name</label>
          <input value={form.organization_name} onChange={update("organization_name")} required
            placeholder="e.g. Acme Corp — first user becomes admin" />
        </div>
        <div className="form-group">
          <label><FaEnvelope /> Email</label>
          <input type="email" value={form.email} onChange={update("email")} required />
        </div>
        <div className="form-group">
          <label><FaLock /> Password</label>
          <input type="password" value={form.password} onChange={update("password")} required minLength={6} />
        </div>

        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="auth-switch">
          Already have an account? <span onClick={goToLogin}>Sign In</span>
        </p>
      </form>
    </div>
  );
}