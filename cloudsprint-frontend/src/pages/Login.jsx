import { useState } from "react";
import { FaCloud, FaEnvelope, FaLock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Login({ goToRegister, goHome }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand" onClick={goHome} style={{ cursor: "pointer" }}><FaCloud /></div>
        <h2>Welcome back</h2>
        <p className="auth-sub">Sign in to your organization's provisioning portal</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label><FaEnvelope /> Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label><FaLock /> Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="auth-switch">
          Don't have an account? <span onClick={goToRegister}>Register</span>
        </p>
      </form>
    </div>
  );
}