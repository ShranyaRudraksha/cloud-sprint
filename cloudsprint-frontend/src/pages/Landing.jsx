import {
  FaBolt, FaServer, FaBoxOpen, FaUserShield, FaNetworkWired,
  FaUserCheck, FaTerminal, FaClipboardList, FaShieldAlt, FaArrowRight,
} from "react-icons/fa";

const RESOURCES = [
  { icon: FaServer, label: "EC2 Instance", desc: "A live server you can SSH into, sized from t2.micro up." },
  { icon: FaBoxOpen, label: "S3 Bucket", desc: "Versioned and private by default, ready in seconds." },
  { icon: FaUserShield, label: "IAM User", desc: "Scoped access via managed policy, no console login." },
  { icon: FaNetworkWired, label: "VPC Network", desc: "An isolated network with a public subnet and routing." },
];

const CAPABILITIES = [
  { icon: FaUserCheck, label: "Approval workflow", desc: "Nothing reaches AWS until an org admin reviews and approves the request." },
  { icon: FaTerminal, label: "Live provisioning console", desc: "Watch the actual Terraform apply/destroy output stream in real time." },
  { icon: FaClipboardList, label: "Full audit trail", desc: "Every request, decision, and teardown is logged for later review." },
  { icon: FaShieldAlt, label: "Org-scoped access", desc: "Requesters see and manage only their own resources; admins see it all." },
];

const STEPS = [
  { n: "1", label: "Submit a request", desc: "Pick a resource type, fill in a few parameters, send it for review." },
  { n: "2", label: "Admin approves", desc: "An org admin reviews the request and approves or rejects it, with a reason." },
  { n: "3", label: "Terraform provisions it", desc: "On approval, the backend runs Terraform against real AWS — live, visibly." },
  { n: "4", label: "Track or tear down", desc: "Follow progress on an order-style tracker, then tear it down when done." },
];

export default function Landing({ onLogin, onRegister }) {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="brand" style={{ marginBottom: 0, padding: 0 }}>
          <div className="brand-icon"><FaBolt /></div>
          <h1>InfraOnDemand</h1>
        </div>
        <div className="landing-nav-actions">
          <button className="btn" onClick={onLogin}>Sign In</button>
          <button className="btn btn-primary" onClick={onRegister}>Get Started</button>
        </div>
      </nav>

      <section className="landing-hero">
        <h2 className="landing-hero-title">Self-service AWS infrastructure, without the wait.</h2>
        <p className="landing-hero-sub">
          Request an EC2 instance, S3 bucket, IAM user, or VPC network in a couple of clicks.
          Every request is reviewed by your organization's admin before anything touches AWS —
          then provisioned live with Terraform, with a console you can actually watch.
        </p>
        <div className="landing-hero-actions">
          <button className="btn btn-primary" onClick={onRegister}>Create an account <FaArrowRight /></button>
          <button className="btn" onClick={onLogin}>Sign in</button>
        </div>
      </section>

      <section className="landing-section">
        <h2>What you can provision</h2>
        <div className="landing-grid">
          {RESOURCES.map(r => {
            const Icon = r.icon;
            return (
              <div className="landing-card" key={r.label}>
                <div className="landing-card-icon"><Icon /></div>
                <div className="landing-card-title">{r.label}</div>
                <div className="landing-card-desc">{r.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="landing-section">
        <h2>How it works</h2>
        <div className="landing-steps">
          {STEPS.map((s, i) => (
            <div className="landing-step" key={s.n}>
              <div className="landing-step-num">{s.n}</div>
              <div className="landing-step-label">{s.label}</div>
              <div className="landing-step-desc">{s.desc}</div>
              {i < STEPS.length - 1 && <div className="landing-step-line" />}
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <h2>Built for accountability</h2>
        <div className="landing-grid">
          {CAPABILITIES.map(c => {
            const Icon = c.icon;
            return (
              <div className="landing-card" key={c.label}>
                <div className="landing-card-icon"><Icon /></div>
                <div className="landing-card-title">{c.label}</div>
                <div className="landing-card-desc">{c.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="landing-footer">
        <button className="btn btn-primary" onClick={onRegister}>Get started for free</button>
        <p>Runs on Terraform + AWS, region ap-south-1 (Mumbai)</p>
      </footer>
    </div>
  );
}
