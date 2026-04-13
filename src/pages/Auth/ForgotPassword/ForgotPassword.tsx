import React, { useState, useRef } from "react";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useForgotPassword, STEP } from "./useForgotPassword";

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const {
    step, setStep, email, setEmail, otp, setOtp,
    newPass, setNewPass, confirmPass, setConfirmPass,
    showPass, setShowPass, showConfirm, setShowConfirm,
    loading, handleSendEmail, handleResendOtp, handleResetPassword,
  } = useForgotPassword();

  // OTP boxes refs (6 ô)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[i] = val.slice(-1);
    setOtpDigits(next);
    setOtp(next.join(""));
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p.length === 6) {
      const digits = p.split("");
      setOtpDigits(digits);
      setOtp(p);
      otpRefs.current[5]?.focus();
    }
  };

  const S: Record<string, React.CSSProperties> = {
    page: { position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5", overflowY: "auto", padding: "32px 16px" },
    card: { width: "100%", maxWidth: 440, backgroundColor: "#fff", borderRadius: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.10)", border: "1px solid #f0f0f0", padding: "40px" },
    logoWrap: { textAlign: "center", marginBottom: 28 },
    logoBox: { width: 60, height: 60, borderRadius: 16, backgroundColor: "#111", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#fff" },
    title: { fontSize: 24, fontWeight: 900, color: "#111", margin: 0, letterSpacing: "-0.5px" },
    subtitle: { fontSize: 13, color: "#999", marginTop: 4 },

    // Step bar: 2 thanh (email → reset)
    stepBar: { display: "flex", gap: 6, marginBottom: 28 },
    stepDot: (active: boolean, done: boolean): React.CSSProperties => ({
      flex: 1, height: 4, borderRadius: 4,
      backgroundColor: done ? "#111" : active ? "#555" : "#e5e5e5",
      transition: "background-color 0.3s",
    }),

    fields: { display: "flex", flexDirection: "column", gap: 14 },
    fieldWrap: { position: "relative" },
    iconLeft: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#ccc", display: "flex", alignItems: "center" },
    iconRight: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#ccc", cursor: "pointer", background: "none", border: "none", padding: 0, display: "flex", alignItems: "center" },
    input: { width: "100%", boxSizing: "border-box", padding: "13px 14px 13px 42px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#111", backgroundColor: "#fafafa", outline: "none", transition: "border-color 0.15s", fontFamily: "inherit" },
    inputPass: { paddingRight: 42 },

    // OTP boxes
    otpRow: { display: "flex", gap: 8, justifyContent: "center" },
    otpBox: { width: 52, height: 56, textAlign: "center", fontSize: 20, fontWeight: 800, border: "2px solid #e5e5e5", borderRadius: 12, outline: "none", fontFamily: "inherit", color: "#111", backgroundColor: "#fafafa", transition: "border-color 0.15s" } as React.CSSProperties,

    btn: { width: "100%", boxSizing: "border-box", padding: "14px", marginTop: 2, backgroundColor: "#111", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", transition: "background-color 0.15s" },
    btnDisabled: { backgroundColor: "#555", cursor: "not-allowed" },
    backBtn: { display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#999", padding: 0, marginBottom: 20, fontFamily: "inherit" },
    hint: { fontSize: 13, color: "#666", backgroundColor: "#f8f8f8", borderRadius: 10, padding: "12px 14px", border: "1px solid #efefef", lineHeight: 1.5 },
    hintEmail: { fontWeight: 700, color: "#111" },
    divider: { borderTop: "1px solid #f0f0f0", marginTop: 28, paddingTop: 20, textAlign: "center" },
    footer: { fontSize: 13, color: "#999" },
    footerLink: { fontWeight: 700, color: "#111", background: "none", border: "none", cursor: "pointer", fontSize: 13, textDecoration: "underline", padding: 0 },
    copy: { fontSize: 11, color: "#ccc", textAlign: "center", marginTop: 20 },
    spinner: { width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
    successIcon: { width: 80, height: 80, borderRadius: "50%", backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" },
    successTitle: { fontSize: 22, fontWeight: 900, color: "#111", margin: "0 0 8px", textAlign: "center" },
    successText: { fontSize: 13, color: "#999", textAlign: "center", lineHeight: 1.6 },
    sectionLabel: { fontSize: 11, fontWeight: 800, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 6 },
  };

  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "#111"; e.target.style.backgroundColor = "#fff"; };
  const blurBorder  = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "#f0f0f0"; e.target.style.backgroundColor = "#fafafa"; };

  const stepIndex = { [STEP.EMAIL]: 0, [STEP.RESET]: 1, [STEP.DONE]: 2 }[step] as number;

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo + tiêu đề */}
        <div style={S.logoWrap}>
          <div className="auth-logo-box"><ShieldCheck size={28} color="#fff" /></div>
          <h1 style={S.title}>Quên Mật Khẩu</h1>
          <p style={S.subtitle}>Khôi phục tài khoản HUIT ERP của bạn</p>
        </div>

        {/* Step bar */}
        {step !== STEP.DONE && (
          <div style={S.stepBar}>
            <div style={S.stepDot(stepIndex === 0, stepIndex > 0)} />
            <div style={S.stepDot(stepIndex === 1, stepIndex > 1)} />
          </div>
        )}

        {/* ── BƯỚC 1: Nhập email ───────────────────────────────────────── */}
        {step === STEP.EMAIL && (
          <>
            <button style={S.backBtn} onClick={onBack}><ArrowLeft size={14} /> Quay lại đăng nhập</button>
            <form onSubmit={handleSendEmail} style={S.fields}>
              <p style={S.hint}>Nhập địa chỉ email đã đăng ký. Hệ thống sẽ gửi mã OTP để đặt lại mật khẩu.</p>
              <div style={S.fieldWrap}>
                <span style={S.iconLeft}><Mail size={16} /></span>
                <input
                  type="email"
                  placeholder="Địa chỉ email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={S.input}
                  autoComplete="email"
                  autoFocus
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                />
              </div>
              <button type="submit" disabled={loading} style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}>
                {loading && <span style={S.spinner} />}
                {loading ? "Đang gửi OTP..." : "Gửi mã OTP →"}
              </button>
            </form>
          </>
        )}

        {/* ── BƯỚC 2: Nhập OTP + mật khẩu mới ───────────────────────── */}
        {step === STEP.RESET && (
          <>
            <button style={S.backBtn} onClick={() => setStep(STEP.EMAIL)}><ArrowLeft size={14} /> Thay đổi email</button>
            <form onSubmit={handleResetPassword} style={S.fields}>

              {/* Banner email */}
              <p style={S.hint}>
                Mã OTP đã được gửi đến <span style={S.hintEmail}>{email}</span>.<br />
                Vui lòng kiểm tra hộp thư (kể cả mục SPAM).
              </p>

              {/* OTP 6 ô */}
              <div>
                <p style={S.sectionLabel}>Mã OTP (6 chữ số)</p>
                <div style={S.otpRow}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      style={{ ...S.otpBox, borderColor: digit ? "#111" : "#e5e5e5", backgroundColor: digit ? "#fff" : "#fafafa" }}
                    />
                  ))}
                </div>
                <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 8 }}>
                  Không nhận được?{" "}
                  <button type="button" disabled={loading} onClick={handleResendOtp}
                    style={{ background: "none", border: "none", fontSize: 12, color: "#111", fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "inherit" }}>
                    Gửi lại OTP
                  </button>
                </p>
              </div>

              {/* Mật khẩu mới */}
              <div>
                <p style={S.sectionLabel}>Mật khẩu mới</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={S.fieldWrap}>
                    <span style={S.iconLeft}><Lock size={16} /></span>
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      style={{ ...S.input, ...S.inputPass }}
                      autoComplete="new-password"
                      onFocus={focusBorder}
                      onBlur={blurBorder}
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowPass(v => !v)} style={S.iconRight}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div style={S.fieldWrap}>
                    <span style={S.iconLeft}><Lock size={16} /></span>
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Xác nhận mật khẩu mới"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      style={{ ...S.input, ...S.inputPass }}
                      autoComplete="new-password"
                      onFocus={focusBorder}
                      onBlur={blurBorder}
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)} style={S.iconRight}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength hints */}
                  {newPass && (
                    <ul style={{ fontSize: 12, paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                      <li style={{ color: newPass.length >= 6 ? "#22c55e" : "#f87171" }}>
                        {newPass.length >= 6 ? "✓" : "✗"} Ít nhất 6 ký tự
                      </li>
                      <li style={{ color: confirmPass && newPass === confirmPass ? "#22c55e" : "#f87171" }}>
                        {confirmPass && newPass === confirmPass ? "✓" : "✗"} Mật khẩu khớp
                      </li>
                    </ul>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}>
                {loading && <span style={S.spinner} />}
                {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          </>
        )}

        {/* ── BƯỚC 3: Hoàn thành ─────────────────────────────────────── */}
        {step === STEP.DONE && (
          <div style={{ textAlign: "center" }}>
            <div style={S.successIcon}><CheckCircle2 size={44} color="#22c55e" /></div>
            <h2 style={S.successTitle}>Đặt lại thành công!</h2>
            <p style={S.successText}>
              Mật khẩu của bạn đã được cập nhật.<br />
              Vui lòng đăng nhập bằng mật khẩu mới.
            </p>
            <button onClick={onBack} style={{ ...S.btn, marginTop: 24 }}>Đăng nhập ngay</button>
          </div>
        )}

        {/* Footer */}
        {step !== STEP.DONE && (
          <div style={S.divider}>
            <p style={S.footer}>
              Nhớ mật khẩu rồi?{" "}
              <button type="button" onClick={onBack} style={S.footerLink}>Đăng nhập</button>
            </p>
          </div>
        )}
      </div>
      <p style={S.copy}>Đại học Công nghiệp TP.HCM · HUIT ERP v2.0</p>
    </div>
  );
};

export default ForgotPassword;
