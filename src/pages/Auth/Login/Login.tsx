import React from "react";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "./LoginForm";

interface LoginProps {
  onLogin: (userData: any) => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

const Login: React.FC<LoginProps> = ({
  onLogin,
  onSwitchToRegister,
  onForgotPassword,
}) => {
  const S: Record<string, React.CSSProperties> = {
    page: {
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      backgroundColor: "#f5f6fa",
      overflowY: "auto",
      padding: "32px 16px",
    },
    card: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: "#fff",
      borderRadius: 24,
      boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
      border: "1px solid #f0f0f0",
      padding: "40px",
    },
    logoWrap: { textAlign: "center", marginBottom: 32 },
    logoBox: {
      width: 60,
      height: 60,
      borderRadius: 16,
      backgroundColor: "#111",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 16px",
      color: "#fff",
    },
    title: {
      fontSize: 28,
      fontWeight: 900,
      color: "#111",
      margin: 0,
      letterSpacing: "-0.5px",
    },
    subtitle: { fontSize: 13, color: "#999", marginTop: 4 },
    fields: { display: "flex", flexDirection: "column", gap: 12 },
    fieldWrap: { position: "relative" },
    iconLeft: {
      position: "absolute",
      left: 14,
      top: "50%",
      transform: "translateY(-50%)",
      color: "#ccc",
      display: "flex",
      alignItems: "center",
    },
    iconRight: {
      position: "absolute",
      right: 14,
      top: "50%",
      transform: "translateY(-50%)",
      color: "#ccc",
      cursor: "pointer",
      background: "none",
      border: "none",
      padding: 0,
      display: "flex",
      alignItems: "center",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "13px 14px 13px 42px",
      border: "2px solid #f0f0f0",
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 500,
      color: "#111",
      backgroundColor: "#fafafa",
      outline: "none",
      transition: "border-color 0.15s",
      fontFamily: "inherit",
    },
    inputPass: { paddingRight: 42 },
    btn: {
      width: "100%",
      boxSizing: "border-box",
      padding: "14px",
      marginTop: 4,
      backgroundColor: "#111", // Hardcoded fallback; loading logic usually changes this in useLogin hook but simplified here
      color: "#fff",
      border: "none",
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      fontFamily: "inherit",
      transition: "background-color 0.15s",
    },
    forgotWrap: { textAlign: "right", marginTop: -4 },
    forgotLink: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 12,
      color: "#999",
      padding: 0,
      fontFamily: "inherit",
      textDecoration: "underline",
    },
    divider: {
      borderTop: "1px solid #f0f0f0",
      marginTop: 28,
      paddingTop: 20,
      textAlign: "center",
    },
    footer: { fontSize: 13, color: "#999" },
    footerLink: {
      fontWeight: 700,
      color: "#111",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      textDecoration: "underline",
      padding: 0,
    },
    copy: { fontSize: 11, color: "#ccc", textAlign: "center", marginTop: 20 },
    spinner: {
      width: 16,
      height: 16,
      border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    },
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div style={S.logoWrap}>
          <div className="auth-logo-box">
            <ShieldCheck size={28} color="#fff" />
          </div>
          <h1 style={S.title}>
            <span style={{ color: "#999" }}>ERP</span>
          </h1>
          <p style={S.subtitle}>Hệ thống Quản trị Nhân sự</p>
        </div>

        {/* Form via component */}
        <LoginForm
          onLogin={onLogin}
          onForgotPassword={onForgotPassword}
          S={S}
        />

        {/* Footer */}
        <div style={S.divider}>
          <p style={S.footer}>
            Chưa có tài khoản?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              style={S.footerLink}
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>

      <p style={S.copy}>Đại học Công Thương TP.HCM · HUIT ERP v2.0</p>
    </div>
  );
};

export default Login;
