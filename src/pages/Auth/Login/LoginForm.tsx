import React from "react";
import { User, Lock, Eye, EyeOff, Clock, XCircle, AlertCircle, ShieldOff } from "lucide-react";
import { useLogin } from "./useLogin";

interface LoginFormProps {
  onLogin: (user: any) => void;
  onForgotPassword: () => void;
  S: Record<string, React.CSSProperties>;
}

// Config banner theo từng trạng thái hồ sơ
const BANNER_CONFIG: Record<string, { icon: React.ReactNode; bg: string; border: string; color: string; text: string }> = {
  OTP_VERIFIED: {
    icon: <Clock size={16} />,
    bg: "#fffbeb", border: "#fde68a", color: "#92400e",
    text: "Tài khoản của bạn chưa được Admin chấp nhận. Vui lòng chờ xét duyệt.",
  },
  PENDING_OTP: {
    icon: <AlertCircle size={16} />,
    bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af",
    text: "Vui lòng xác thực OTP trong EMAIL của bạn trước khi đăng nhập.",
  },
  EXPIRED: {
    icon: <ShieldOff size={16} />,
    bg: "#fff7ed", border: "#fed7aa", color: "#9a3412",
    text: "Mã OTP đã hết hạn. Vui lòng đăng ký lại để tiếp tục.",
  },
  REJECTED: {
    icon: <XCircle size={16} />,
    bg: "#fef2f2", border: "#fecaca", color: "#991b1b",
    text: "Tài khoản của bạn đã bị từ chối. Vui lòng liên hệ Admin để biết thêm.",
  },
};

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onForgotPassword, S }) => {
  const { form, set, showPass, setShowPass, loading, handleSubmit, pendingStatus, setPendingStatus } = useLogin(onLogin);

  const banner = pendingStatus ? BANNER_CONFIG[pendingStatus] : null;

  return (
    <form onSubmit={handleSubmit} style={S.fields}>

      {/* Banner trạng thái hồ sơ chờ duyệt */}
      {banner && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          background: banner.bg, border: `1.5px solid ${banner.border}`,
          borderRadius: 12, padding: "12px 14px", marginBottom: 4,
        }}>
          <span style={{ color: banner.color, marginTop: 1, flexShrink: 0 }}>{banner.icon}</span>
          <span style={{ fontSize: 13, color: banner.color, fontWeight: 500, lineHeight: 1.5 }}>
            {banner.text}
          </span>
          <button
            type="button"
            onClick={() => setPendingStatus(null)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: banner.color, padding: 0, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Email */}
      <div style={S.fieldWrap}>
        <span style={S.iconLeft}>
          <User size={16} />
        </span>
        <input
          type="EMAIL"
          placeholder="Email đăng nhập"
          value={form.EMAIL}
          onChange={set("EMAIL")}
          style={S.input}
          autoComplete="EMAIL"
          autoCapitalize="none"
          autoCorrect="off"
          onFocus={(e) => { e.target.style.borderColor = "#111"; e.target.style.backgroundColor = "#fff"; }}
          onBlur={(e) => { e.target.style.borderColor = "#f0f0f0"; e.target.style.backgroundColor = "#fafafa"; }}
        />
      </div>

      {/* Password */}
      <div style={S.fieldWrap}>
        <span style={S.iconLeft}>
          <Lock size={16} />
        </span>
        <input
          type={showPass ? "text" : "password"}
          placeholder="Mật khẩu"
          value={form.password}
          onChange={set("password")}
          style={{ ...S.input, ...S.inputPass }}
          autoComplete="current-password"
          onFocus={(e) => { e.target.style.borderColor = "#111"; e.target.style.backgroundColor = "#fff"; }}
          onBlur={(e) => { e.target.style.borderColor = "#f0f0f0"; e.target.style.backgroundColor = "#fafafa"; }}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPass((v) => !v)}
          style={S.iconRight}
        >
          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Forgot Password */}
      <div style={S.forgotWrap}>
        <button type="button" onClick={onForgotPassword} style={S.forgotLink}>
          Quên mật khẩu?
        </button>
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading} style={S.btn}>
        {loading && <span style={S.spinner} />}
        {loading ? "Đang xác thực..." : "Đăng nhập"}
      </button>
    </form>
  );
};
