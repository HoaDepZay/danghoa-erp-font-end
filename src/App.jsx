import { useState, useEffect, Component } from "react";
import { ToastContainer } from "./components/UI/Toast";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import Login from "./page/Login";
import Register from "./page/Register";
import ForgotPassword from "./page/ForgotPassword";
import DashboardPage from "./page/DashboardPage";
import EmployeesPage from "./page/EmployeesPage";
import DepartmentsPage from "./page/DepartmentsPage";
import ProjectsPage from "./page/ProjectsPage";
import PayrollPage from "./page/PayrollPage";
import ProfilePage from "./page/ProfilePage";
import { getUserLevel } from "./utils/user";

// ── Error Boundary – ngăn trang trắng toàn app khi 1 page bị crash ──────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("[ErrorBoundary]", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          <h2 style={{ color: "#e11d48", fontWeight: 700, marginBottom: 8 }}>⚠️ Trang bị lỗi</h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 16 }}>{String(this.state.error)}</p>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ padding: "8px 20px", background: "#111", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
const PAGES = {
  dashboard: DashboardPage,
  employees: EmployeesPage,
  departments: DepartmentsPage,
  projects: ProjectsPage,
  payroll: PayrollPage,
  profile: ProfilePage,
};
const PAGE_MIN_LEVEL = { dashboard: 1, profile: 1, payroll: 1, projects: 1, employees: 2, departments: 2 };

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState("login"); // login | register | forgot
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setAppLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // App.jsx already saves to localStorage in Login.jsx (already done before onLogin())
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    if (window.confirm("Xác nhận đăng xuất?")) {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setAuthView("login");
      setActivePage("dashboard");
    }
  };

  const handleNavigate = (page) => {
    // Support both login response format (role) and employee API format (chuc_vu/CHUCVU)
    const userLevel = getUserLevel(user);
    const required = PAGE_MIN_LEVEL[page] || 1;
    if (userLevel < required) {
      alert("⚠️ Bạn không có quyền truy cập trang này!");
      return;
    }
    setActivePage(page);
  };

  // Loading splash
  if (appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="text-white" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <p className="text-gray-400 text-sm">Đang tải HUIT ERP...</p>
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

  // Main app
  const PageComponent = PAGES[activePage] || DashboardPage;

  return (
    <>
      <ToastContainer />
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header activePage={activePage} user={user} />
          <main className="flex-1 p-6">
            <ErrorBoundary key={activePage}>
              <PageComponent key={activePage} user={user} onNavigate={handleNavigate} />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
