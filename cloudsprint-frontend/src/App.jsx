import { useState, useEffect, useCallback } from "react";
import { FaListUl, FaPlusCircle, FaSignOutAlt, FaUserShield, FaUser, FaBoxOpen } from "react-icons/fa";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Sidebar from "./components/Sidebar";
import StatsBar from "./components/StatsBar";
import RequestForm from "./components/RequestForm";
import RequestList from "./components/RequestList";
import MyResources from "./components/MyResources";
import ThemeToggle from "./components/ThemeToggle";
import { getRequests } from "./api/requests";

function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user.role === "admin";
  const [view, setView] = useState("requests");
  const [requests, setRequests] = useState([]);

  const refresh = useCallback(() => {
    getRequests().then(setRequests).catch(console.error);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <div className="layout">
      <Sidebar view={view} setView={setView} isAdmin={isAdmin} />
      <div className="main">
        <div className="topbar">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <strong>{user.name}</strong>
              <span className={`role-tag ${isAdmin ? "role-tag-admin" : "role-tag-requester"}`} style={{ margin: 0, padding: "3px 10px", fontSize: 9.5 }}>
                {isAdmin ? <FaUserShield /> : <FaUser />} {isAdmin ? "Admin" : "Requester"}
              </span>
            </div>
            <span className="org-tag">{user.org_name || "Organization"}</span>
          </div>
          <button className="btn btn-teardown" onClick={logout}><FaSignOutAlt /> Logout</button>
        </div>

        {view === "requests" && (
          <>
            <div className="page-header"><div className="icon-badge"><FaListUl /></div><h2>{isAdmin ? "All Requests" : "My Requests"}</h2></div>
            <StatsBar requests={requests} />
            <RequestList requests={requests} onChanged={refresh} isAdmin={isAdmin} currentUser={user} />
          </>
        )}
        {view === "resources" && (
          <>
            <div className="page-header"><div className="icon-badge"><FaBoxOpen /></div><h2>My Resources</h2></div>
            <MyResources />
          </>
        )}
        {view === "new" && (
          <>
            <div className="page-header"><div className="icon-badge"><FaPlusCircle /></div><h2>New Request</h2></div>
            <RequestForm onCreated={() => { refresh(); setView("requests"); }} />
          </>
        )}
      </div>
    </div>
  );
}

function AuthGate() {
  const { user } = useAuth();
  const [screen, setScreen] = useState("landing");

  if (user) return <Dashboard />;
  if (screen === "landing") {
    return <Landing onLogin={() => setScreen("login")} onRegister={() => setScreen("register")} />;
  }
  return screen === "login"
    ? <Login goToRegister={() => setScreen("register")} goHome={() => setScreen("landing")} />
    : <Register goToLogin={() => setScreen("login")} goHome={() => setScreen("landing")} />;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeToggle />
      <AuthGate />
    </AuthProvider>
  );
}