import React, { useState, useEffect, useCallback, Component, ReactNode, ErrorInfo } from "react";
import { ToastContainer } from "./components/UI/Toast";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword/ForgotPassword";

import Dashboard from "./pages/Dashboard/Dashboard";
import Employees from "./pages/Employee/EmployeeList/Employees";
import EmployeeProfile from "./pages/Employee/EmployeeProfile/EmployeeProfile";
import Departments from "./pages/Department/Departments";
import DepartmentDetails from "./pages/Department/DepartmentDetails";
import Projects from "./pages/Projects/Projects";
import CreateProject from "./pages/Projects/CreateProject";
import Payroll from "./pages/Payroll/Payroll";
import Profile from "./pages/Profile/MyProfile/Profile";
import Admin from "./pages/Admin/Admin";
import Schedule from "./pages/Schedule/Schedule";
import Chat from "./pages/Chat/Chat";
import Attendance from "./pages/Attendance/Attendance";
import LeaveManagement from "./pages/Leave/LeaveManagement";
import LeaveRequest from "./pages/Leave/LeaveRequest";
import ContractManager from "./pages/Contract/ContractManager";
import Analytics from "./pages/Analytics/Analytics";
import ProjectDetails from "./pages/Projects/ProjectDetails";
import PhaseDetails from "./pages/Projects/PhaseDetails";
import OrgChart from "./pages/OrgChart/OrgChart";
import Expenses from "./pages/Expenses/Expenses";

import { getUserLevel, getManv } from "./utils/user";
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
  project_create: CreateProject,
  payroll: Payroll,
  profile: Profile,
  admin: Admin,
  schedule: Schedule,
  chat: Chat,
  attendance: Attendance,
  leave: LeaveManagement,      // Manager/Admin: xem tất cả đơn
  myLeave: LeaveRequest,        // Nhân viên: nộp đơn của mình
  contracts: ContractManager,
  analytics: Analytics,
  project_details: ProjectDetails,
  phase_details: PhaseDetails,
  department_details: DepartmentDetails,
  employee_profile: EmployeeProfile,
  "org-chart": OrgChart,
  expenses: Expenses,
};

const PAGE_MIN_LEVEL: Record<string, number> = {
  dashboard: 1,
  profile: 1,
  payroll: 1,
  projects: 1,
  project_create: 3,
  employees: 1,
  departments: 1,
  admin: 4,
  schedule: 1,
  chat: 1,
  attendance: 1,
  leave: 3,        // Manager/Admin mới xem tất cả đơn
  myLeave: 1,      // Mọi nhân viên đều có thể nộp đơn
  contracts: 3,
  analytics: 3, // HR Analytics - Manager level
  project_details: 1,
  phase_details: 1,
  department_details: 1,
  employee_profile: 1,
  "org-chart": 1,
  expenses: 1,
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [authView, setAuthView] = useState("login");
  const [activePage, setActivePage] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return hash && PAGES[hash] ? hash : "dashboard";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.innerWidth <= 1024,
  );
  const [appLoading, setAppLoading] = useState(true);

  // Lắng nghe sự kiện click nút Back/Forward của trình duyệt
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      setActivePage(hash && PAGES[hash] ? hash : "dashboard");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setAuthView("login");
      window.location.hash = ""; // Reset URL
    };
    const handleAuthUpdate = (e: any) => {
      if (e.detail) setUser(e.detail);
    };
    window.addEventListener("auth:logout", handleAuthLogout);
    window.addEventListener("auth:updateUser", handleAuthUpdate);

    try {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (savedUser && token) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Fetch latest profile in background to keep data in sync
        const MA_NV = getManv(parsedUser);
        if (MA_NV) {
          api.getProfile(MA_NV)
            .then((res: any) => {
              const latestUser = res.data?.employee || res.data?.data || res.data;
              if (latestUser) {
                const mergedUser = { ...parsedUser, ...latestUser };
                setUser(mergedUser);
                localStorage.setItem("user", JSON.stringify(mergedUser));
              }
            })
            .catch(() => {
              api.getEmployee(MA_NV)
                .then((res: any) => {
                  const latestUser = res.data?.employee || res.data?.data || res.data;
                  if (latestUser) {
                    const mergedUser = { ...parsedUser, ...latestUser };
                    setUser(mergedUser);
                    localStorage.setItem("user", JSON.stringify(mergedUser));
                  }
                })
                .catch(() => {});
            });
        }
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } finally {
      setAppLoading(false);
    }

    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
      window.removeEventListener("auth:updateUser", handleAuthUpdate);
    };
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    window.location.hash = "dashboard";
  };

  const handleLogout = async () => {
    if (window.confirm("Xác nhận đăng xuất?")) {
      try {
        await api.logout(); 
      } catch (error) {
        console.error("Logout error", error);
      }
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setAuthView("login");
      window.location.hash = "";
    }
  };

  const handleNavigate = useCallback((page: string) => {
    const userLevel = getUserLevel(user);
    const required = PAGE_MIN_LEVEL[page] || 1;
    if (userLevel < required) {
      alert("⚠️ Bạn không có quyền truy cập trang này!");
      return;
    }
    window.location.hash = page; // Đổi URL, sẽ kích hoạt handleHashChange để đổi page
    if (window.innerWidth <= 1024) setSidebarCollapsed(true);
  }, [user]);

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
          <p style={{ fontSize: 14, color: "#888" }}>Đang tải DANGHOA-ERP...</p>
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
            onNavigate={handleNavigate}
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
