import { useState, useEffect, useCallback } from "react";
import { FaListUl, FaPlusCircle, FaSignOutAlt } from "react-icons/fa";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Sidebar from "./components/Sidebar";
import StatsBar from "./components/StatsBar";
import RequestForm from "./components/RequestForm";
import RequestList from "./components/RequestList";
import ThemeToggle from "./components/ThemeToggle";
import { getRequests } from "./api/requests";

function Dashboard() {
  const { user, logout } = useAuth();
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
      <Sidebar view={view} setView={setView} />
      <div className="main">
        <div className="topbar">
          <div>
            <strong>{user.name}</strong>
            <span className="org-tag">{user.org_name || "Organization"} · {user.role}</span>
          </div>
          <button className="btn btn-teardown" onClick={logout}><FaSignOutAlt /> Logout</button>
        </div>

        {view === "requests" && (
          <>
            <div className="page-header"><div className="icon-badge"><FaListUl /></div><h2>Requests</h2></div>
            <StatsBar requests={requests} />
            <RequestList requests={requests} onChanged={refresh} isAdmin={user.role === "admin"} currentUser={user} />
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
  const [screen, setScreen] = useState("login");

  if (user) return <Dashboard />;
  return screen === "login"
    ? <Login goToRegister={() => setScreen("register")} />
    : <Register goToLogin={() => setScreen("login")} />;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeToggle />
      <AuthGate />
    </AuthProvider>
  );
}