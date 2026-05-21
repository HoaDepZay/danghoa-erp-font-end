import React, { useState, useEffect, Component, ReactNode, ErrorInfo } from "react";
import { ToastContainer } from "./components/UI/Toast";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword/ForgotPassword";

import Dashboard from "./pages/Dashboard/Dashboard";
import Employees from "./pages/Employee/EmployeeList/Employees";
import Departments from "./pages/Department/Departments";
import Projects from "./pages/Projects/Projects";
import Payroll from "./pages/Payroll/Payroll";
import Profile from "./pages/Profile/MyProfile/Profile";
import Admin from "./pages/Admin/Admin";
import Schedule from "./pages/Schedule/Schedule";
import Chat from "./pages/Chat/Chat";
import Attendance from "./pages/Attendance/Attendance";

import { getUserLevel } from "./utils/user";
import { api } from "./services/api";

// ── Error Boundary ──────────────────────────────────────────────────────────
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          <h2 style={{ color: "#e11d48", fontWeight: 700, marginBottom: 8 }}>
            ⚠️ Trang bị lỗi
          </h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 16 }}>
            {String(this.state.error)}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="btn btn-primary"
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PAGES: Record<string, React.FC<any>> = {
  dashboard: Dashboard,
  employees: Employees,
  departments: Departments,
  projects: Projects,
  payroll: Payroll,
  profile: Profile,
  admin: Admin,
  schedule: Schedule,
  chat: Chat,
  attendance: Attendance,
};

const PAGE_MIN_LEVEL: Record<string, number> = {
  dashboard: 1,
  profile: 1,
  payroll: 1,
  projects: 1,
  employees: 1,
  departments: 3,
  admin: 4,
  schedule: 1,
  chat: 1,
  attendance: 1,
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [authView, setAuthView] = useState("login");
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.innerWidth <= 1024,
  );
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setAuthView("login");
      setActivePage("dashboard");
    };
    window.addEventListener("auth:logout", handleAuthLogout);

    try {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (savedUser && token) setUser(JSON.parse(savedUser));
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } finally {
      setAppLoading(false);
    }

    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setActivePage("dashboard");
  };

  const handleLogout = async () => {
    if (window.confirm("Xác nhận đăng xuất?")) {
      try {
        await api.logout(); // Gọi API logout xóa cookie hoặc thao tác ở backend (nếu có)
      } catch (error) {
        console.error("Logout error", error);
      }
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setAuthView("login");
      setActivePage("dashboard");
    }
  };

  const handleNavigate = (page: string) => {
    const userLevel = getUserLevel(user);
    const required = PAGE_MIN_LEVEL[page] || 1;
    if (userLevel < required) {
      alert("⚠️ Bạn không có quyền truy cập trang này!");
      return;
    }
    setActivePage(page);
    if (window.innerWidth <= 1024) setSidebarCollapsed(true);
  };

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024) setSidebarCollapsed(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Loading splash
  if (appLoading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f6fa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "#111",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p style={{ fontSize: 14, color: "#888" }}>Đang tải HUIT ERP...</p>
        </div>
      </div>
    );
  }

  // Auth screens
  if (!user) {
    return (
      <>
        <ToastContainer />
        {authView === "login" ? (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthView("register")}
            onForgotPassword={() => setAuthView("forgot")}
          />
        ) : authView === "register" ? (
          <Register onSwitchToLogin={() => setAuthView("login")} />
        ) : (
          <ForgotPassword onBack={() => setAuthView("login")} />
        )}
      </>
    );
  }

  const PageComponent = PAGES[activePage] || Dashboard;

  return (
    <>
      <ToastContainer />
      <div className="app-shell">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
        <div
          className={`sidebar-backdrop${sidebarCollapsed ? "" : " show"}`}
          onClick={() => setSidebarCollapsed(true)}
          aria-hidden="true"
        />
        <div className="app-main">
          <Header
            activePage={activePage}
            user={user}
            onToggleMenu={() => setSidebarCollapsed((v) => !v)}
          />
          <main className="app-content">
            <ErrorBoundary key={activePage}>
              <PageComponent
                key={activePage}
                user={user}
                onNavigate={handleNavigate}
              />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
