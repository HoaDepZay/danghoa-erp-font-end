import React, { useState, useRef } from "react";
import { User, Mail, Lock, Eye, EyeOff, Clock, CheckCircle } from "lucide-react";
import { toast } from "../../../utils/helpers";

const S: Record<string, React.CSSProperties> = {
  input: {
    width: "100%", boxSizing: "border-box",
    padding: "13px 14px 13px 42px",
    border: "2px solid #f0f0f0", borderRadius: 12,
    fontSize: 14, fontWeight: 500, color: "#111",
    backgroundColor: "#fafafa", outline: "none",
    fontFamily: "inherit",
  },
  inputWrap: { position: "relative", marginBottom: 12 },
  iconL: {
    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
    color: "#ccc", display: "flex", alignItems: "center", pointerEvents: "none",
  },
  iconR: {
    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
    color: "#ccc", cursor: "pointer", background: "none", border: "none", padding: 0,
    display: "flex", alignItems: "center",
  },
  btn: {
    width: "100%", boxSizing: "border-box", padding: "14px",
    backgroundColor: "#111", color: "#fff", border: "none", borderRadius: 12,
    fontSize: 14, fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontFamily: "inherit", marginTop: 4,
  },
  btnDisabled: { backgroundColor: "#555", cursor: "not-allowed" },
  ghostBtn: {
    background: "none", border: "none", cursor: "pointer",
    fontSize: 13, color: "#111", fontWeight: 700, textDecoration: "underline",
    fontFamily: "inherit", padding: 0,
  },
  otpWrap: { display: "flex", gap: 8, justifyContent: "center", margin: "16px 0" },
  otpInput: {
    width: 48, height: 52, textAlign: "center", fontSize: 20, fontWeight: 800,
    border: "2px solid #e5e5e5", borderRadius: 12, outline: "none",
    fontFamily: "inherit", color: "#111",
  },
  infoBanner: {
    backgroundColor: "#f5f5f5", borderRadius: 12, padding: "14px 16px",
    textAlign: "center", marginBottom: 16, fontSize: 14,
  },
  spinner: {
    width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
};

const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = "#111";
  e.target.style.backgroundColor = "#fff";
};
const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = "#e5e5e5";
  e.target.style.backgroundColor = "#fafafa";
};

export const StepInfo: React.FC<{ form: any; setForm: any; onNext: () => void; loading: boolean }> = ({ form, setForm, onNext, loading }) => {
  const [showPass, setShowPass] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f: any) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.HO_TEN || !form.EMAIL || !form.password) return toast.error("Vui lòng điền đầy đủ!");
    if (form.password.length < 6) return toast.error("Mật khẩu phải ít nhất 6 ký tự!");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.EMAIL)) return toast.error("EMAIL không hợp lệ!");
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={S.inputWrap}>
        <span style={S.iconL}><User size={16} /></span>
        <input style={S.input} placeholder="Họ và tên đầy đủ" value={form.HO_TEN} onChange={set("HO_TEN")} onFocus={inputFocus} onBlur={inputBlur} />
      </div>
      <div style={S.inputWrap}>
        <span style={S.iconL}><Mail size={16} /></span>
        <input type="EMAIL" style={S.input} placeholder="EMAIL (nhận OTP)" value={form.EMAIL} onChange={set("EMAIL")} onFocus={inputFocus} onBlur={inputBlur} />
      </div>
      <div style={{ ...S.inputWrap, marginBottom: 0 }}>
        <span style={S.iconL}><Lock size={16} /></span>
        <input type={showPass ? "text" : "password"} style={{ ...S.input, paddingRight: 42 }} placeholder="Mật khẩu (ít nhất 6 ký tự)" value={form.password} onChange={set("password")} onFocus={inputFocus} onBlur={inputBlur} />
        <button type="button" tabIndex={-1} onClick={() => setShowPass((v) => !v)} style={S.iconR}>
          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <button type="submit" disabled={loading} style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}>
        {loading && <span style={S.spinner} />}
        {loading ? "Đang xử lý..." : "Tiếp tục →"}
      </button>
    </form>
  );
};

export const StepOtp: React.FC<{ EMAIL: string; onVerify: (otp: string) => void; onResend: () => void; loading: boolean }> = ({ EMAIL, onVerify, onResend, loading }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d)) setTimeout(() => onVerify(next.join("")), 100);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p.length === 6) {
      setOtp(p.split(""));
      refs.current[5]?.focus();
      setTimeout(() => onVerify(p), 100);
    }
  };

  return (
    <div>
      <div style={S.infoBanner}>
        <p style={{ margin: 0, fontSize: 13, color: "#999" }}>Mã OTP đã gửi đến</p>
        <p style={{ margin: "4px 0 0", fontWeight: 700, color: "#111" }}>{EMAIL}</p>
      </div>
      <div style={S.otpWrap}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            style={{ ...S.otpInput, borderColor: digit ? "#111" : "#e5e5e5" }}
          />
        ))}
      </div>
      <button type="button" disabled={loading || otp.some((d) => !d)} onClick={() => onVerify(otp.join(""))} style={{ ...S.btn, ...(loading || otp.some((d) => !d) ? S.btnDisabled : {}) }}>
        {loading && <span style={S.spinner} />}
        {loading ? "Đang xác thực..." : "Xác thực OTP"}
      </button>
      <p style={{ textAlign: "center", fontSize: 13, color: "#999", marginTop: 14 }}>
        Không nhận được mã? <button type="button" onClick={onResend} style={S.ghostBtn}>Gửi lại</button>
      </p>
    </div>
  );
};

// Màn hình chờ admin duyệt — hiển thị sau khi verify OTP thành công
export const StepPending: React.FC<{ EMAIL: string; onGoLogin: () => void }> = ({ EMAIL, onGoLogin }) => (
  <div style={{ textAlign: "center" }}>
    {/* Icon đồng hồ */}
    <div style={{
      width: 72, height: 72, borderRadius: 20,
      background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 18px", boxShadow: "0 8px 24px rgba(245,158,11,0.3)",
    }}>
      <Clock size={34} color="#fff" />
    </div>

    <p style={{ fontWeight: 800, fontSize: 20, color: "#111", margin: "0 0 6px" }}>
      Hồ sơ đang chờ duyệt
    </p>
    <p style={{ fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 1.6 }}>
      OTP đã xác thực thành công cho <strong style={{ color: "#111" }}>{EMAIL}</strong>.<br />
      Hồ sơ của bạn đang chờ <strong style={{ color: "#111" }}>Admin</strong> xem xét và phê duyệt.
    </p>

    {/* Timeline trạng thái */}
    <div style={{
      background: "#f8f8f8", borderRadius: 14, padding: "16px 20px",
      textAlign: "left", marginBottom: 20, display: "flex", flexDirection: "column", gap: 12,
    }}>
      {[
        { label: "Đăng ký tài khoản", done: true },
        { label: "Xác thực OTP", done: true },
        { label: "Chờ Admin phê duyệt", done: false, active: true },
        { label: "Được cấp quyền truy cập", done: false },
      ].map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: s.done ? "#111" : s.active ? "#f59e0b" : "#e5e5e5",
            fontSize: 11, color: "#fff", fontWeight: 700,
          }}>
            {s.done ? "✓" : i + 1}
          </div>
          <span style={{
            fontSize: 13, fontWeight: s.active ? 700 : 500,
            color: s.done ? "#111" : s.active ? "#d97706" : "#bbb",
          }}>
            {s.label}
          </span>
          {s.active && (
            <span style={{
              marginLeft: "auto", fontSize: 10, fontWeight: 700,
              background: "#fef3c7", color: "#92400e",
              padding: "2px 8px", borderRadius: 20,
            }}>Đang chờ</span>
          )}
        </div>
      ))}
    </div>

    <p style={{ fontSize: 12, color: "#aaa", marginBottom: 20 }}>
      Bạn sẽ nhận EMAIL thông báo khi được phê duyệt.
    </p>

    <button onClick={onGoLogin} style={{ ...S.btn, background: "#f0f0f0", color: "#555" }}>
      Về trang đăng nhập
    </button>
  </div>
);

// Fallback nếu cần màn hình "Đăng ký hoàn tất" (tái sử dụng khi đã APPROVED)
export const StepSuccess: React.FC<{ onGoLogin: () => void }> = ({ onGoLogin }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: "#111", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#fff" }}>
      <CheckCircle size={30} color="#fff" />
    </div>
    <p style={{ fontWeight: 700, fontSize: 18, color: "#111", margin: "12px 0 4px" }}>Đăng ký thành công!</p>
    <p style={{ fontSize: 13, color: "#999", marginBottom: 24 }}>Tài khoản đã được kích hoạt. Hãy đăng nhập để tiếp tục.</p>
    <button onClick={onGoLogin} style={S.btn}>Đăng nhập ngay</button>
  </div>
);
