import { useState, useRef } from "react";
import { api } from "../services/api";
import { toast } from "../utils/helpers";
import { ShieldCheck, User, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";

/* ── Shared styles ── */
const S = {
  page: {
    position: "fixed", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    backgroundColor: "#f5f5f5", overflowY: "auto", padding: "32px 16px",
  },
  card: {
    width: "100%", maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
    border: "1px solid #f0f0f0",
    padding: "40px",
  },
  logoBox: {
    width: 54, height: 54, borderRadius: 14,
    backgroundColor: "#111", display: "flex", alignItems: "center",
    justifyContent: "center", margin: "0 auto 14px", color: "#fff",
  },
  title: { fontSize: 24, fontWeight: 900, color: "#111", margin: 0 },
  sub: { fontSize: 13, color: "#999", marginTop: 4, marginBottom: 0 },
  stepBar: { display: "flex", gap: 8, marginBottom: 28 },
  stepDot: (active) => ({
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: active ? "#111" : "#eee",
    transition: "background-color 0.3s",
  }),
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
  backBtn: {
    background: "none", border: "none", cursor: "pointer",
    fontSize: 13, color: "#999", fontFamily: "inherit", padding: 0,
    display: "flex", alignItems: "center", gap: 4,
  },
  divider: { borderTop: "1px solid #f0f0f0", marginTop: 24, paddingTop: 18 },
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

const inputFocus = (e) => {
  e.target.style.borderColor = "#111";
  e.target.style.backgroundColor = "#fff";
};
const inputBlur = (e) => {
  e.target.style.borderColor = "#e5e5e5";
  e.target.style.backgroundColor = "#fafafa";
};

/* ── Step 1 ── */
const StepInfo = ({ form, setForm, onNext, loading }) => {
  const [showPass, setShowPass] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.hoten || !form.email || !form.password) return toast.error("Vui lòng điền đầy đủ!");
    if (form.password.length < 6) return toast.error("Mật khẩu phải ít nhất 6 ký tự!");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error("Email không hợp lệ!");
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={S.inputWrap}>
        <span style={S.iconL}><User size={16} /></span>
        <input style={S.input} placeholder="Họ và tên đầy đủ" value={form.hoten}
          onChange={set("hoten")} onFocus={inputFocus} onBlur={inputBlur} />
      </div>
      <div style={S.inputWrap}>
        <span style={S.iconL}><Mail size={16} /></span>
        <input type="email" style={S.input} placeholder="Email (nhận OTP)" value={form.email}
          onChange={set("email")} onFocus={inputFocus} onBlur={inputBlur} />
      </div>
      <div style={{ ...S.inputWrap, marginBottom: 0 }}>
        <span style={S.iconL}><Lock size={16} /></span>
        <input type={showPass ? "text" : "password"} style={{ ...S.input, paddingRight: 42 }}
          placeholder="Mật khẩu (ít nhất 6 ký tự)" value={form.password}
          onChange={set("password")} onFocus={inputFocus} onBlur={inputBlur} />
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

/* ── Step 2 OTP ── */
const StepOtp = ({ email, onVerify, onResend, loading }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const refs = useRef([]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d)) setTimeout(() => onVerify(next.join("")), 100);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
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
        <p style={{ margin: "4px 0 0", fontWeight: 700, color: "#111" }}>{email}</p>
      </div>
      <div style={S.otpWrap}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            style={{
              ...S.otpInput,
              borderColor: digit ? "#111" : "#e5e5e5",
            }}
          />
        ))}
      </div>
      <button
        type="button"
        disabled={loading || otp.some((d) => !d)}
        onClick={() => onVerify(otp.join(""))}
        style={{ ...S.btn, ...(loading || otp.some((d) => !d) ? S.btnDisabled : {}) }}
      >
        {loading && <span style={S.spinner} />}
        {loading ? "Đang xác thực..." : "Xác thực OTP"}
      </button>
      <p style={{ textAlign: "center", fontSize: 13, color: "#999", marginTop: 14 }}>
        Không nhận được mã?{" "}
        <button onClick={onResend} style={S.ghostBtn}>Gửi lại</button>
      </p>
    </div>
  );
};

/* ── Step 3 Success ── */
const StepSuccess = ({ onGoLogin }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ ...S.logoBox, width: 60, height: 60, borderRadius: 18 }}>
      <CheckCircle size={30} color="#fff" />
    </div>
    <p style={{ fontWeight: 700, fontSize: 18, color: "#111", margin: "12px 0 4px" }}>Đăng ký thành công!</p>
    <p style={{ fontSize: 13, color: "#999", marginBottom: 24 }}>
      Tài khoản đã được kích hoạt. Hãy đăng nhập để tiếp tục.
    </p>
    <button onClick={onGoLogin} style={S.btn}>Đăng nhập ngay</button>
  </div>
);

/* ── Main Register ── */
const Register = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ hoten: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const TITLES = {
    1: "Tạo tài khoản",
    2: "Xác thực OTP",
    3: "Hoàn thành!",
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await api.register(form);
      toast.success("Mã OTP đã gửi đến email của bạn!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Email đã tồn tại hoặc có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (otp) => {
    if (otp.length !== 6) return toast.error("Nhập đầy đủ 6 chữ số OTP!");
    setLoading(true);
    try {
      // Backend expects: { email, otpCode }  (see authController.ts)
      await api.verifyOtp({ email: form.email, otpCode: otp });
      setStep(3);
      toast.success("Xác thực thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP không đúng hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.register(form);
      toast.info("Đã gửi lại mã OTP!");
    } catch {
      toast.error("Không thể gửi lại OTP!");
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={S.logoBox}>
            <ShieldCheck size={24} color="#fff" />
          </div>
          <h1 style={{ ...S.title, fontSize: 22 }}>{TITLES[step]}</h1>
          {step === 1 && <p style={S.sub}>Điền thông tin để đăng ký</p>}
          {step === 2 && <p style={S.sub}>Mã OTP gửi đến {form.email}</p>}
        </div>

        {/* Step bar */}
        {step < 3 && (
          <div style={S.stepBar}>
            <div style={S.stepDot(1 <= step)} />
            <div style={S.stepDot(2 <= step)} />
          </div>
        )}

        {/* Content */}
        {step === 1 && <StepInfo form={form} setForm={setForm} onNext={handleRegister} loading={loading} />}
        {step === 2 && <StepOtp email={form.email} onVerify={handleVerify} onResend={handleResend} loading={loading} />}
        {step === 3 && <StepSuccess onGoLogin={onSwitchToLogin} />}

        {/* Footer nav */}
        {step < 3 && (
          <div style={S.divider}>
            <div style={{ textAlign: "center" }}>
              {step === 2 ? (
                <button onClick={() => setStep(1)} style={S.backBtn}>
                  <ArrowLeft size={14} /> Quay lại
                </button>
              ) : (
                <p style={{ fontSize: 13, color: "#999", margin: 0 }}>
                  Đã có tài khoản?{" "}
                  <button onClick={onSwitchToLogin} style={S.ghostBtn}>Đăng nhập</button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
