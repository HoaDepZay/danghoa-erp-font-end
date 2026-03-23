import React from "react";
import { ShieldCheck, Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useForgotPassword, STEP } from "./useForgotPassword";

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const {
    step, setStep, email, setEmail, otp, setOtp, newPass, setNewPass, confirmPass, setConfirmPass,
    showPass, setShowPass, showConfirm, setShowConfirm, loading, handleSendEmail, handleVerifyOtp, handleResetPassword
  } = useForgotPassword();

  const S: Record<string, React.CSSProperties> = {
    page: { position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5", overflowY: "auto", padding: "32px 16px" },
    card: { width: "100%", maxWidth: 420, backgroundColor: "#fff", borderRadius: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.10)", border: "1px solid #f0f0f0", padding: "40px" },
    logoWrap: { textAlign: "center", marginBottom: 28 },
    logoBox: { width: 60, height: 60, borderRadius: 16, backgroundColor: "#111", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#fff" },
    title: { fontSize: 24, fontWeight: 900, color: "#111", margin: 0, letterSpacing: "-0.5px" },
    subtitle: { fontSize: 13, color: "#999", marginTop: 4 },
    stepBar: { display: "flex", gap: 6, marginBottom: 28, alignItems: "center" },
    stepDot: (active: boolean, done: boolean): React.CSSProperties => ({ flex: 1, height: 4, borderRadius: 4, backgroundColor: done ? "#111" : active ? "#555" : "#e5e5e5", transition: "background-color 0.3s" }),
    fields: { display: "flex", flexDirection: "column", gap: 12 },
    fieldWrap: { position: "relative" },
    iconLeft: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#ccc", display: "flex", alignItems: "center" },
    iconRight: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#ccc", cursor: "pointer", background: "none", border: "none", padding: 0, display: "flex", alignItems: "center" },
    input: { width: "100%", boxSizing: "border-box", padding: "13px 14px 13px 42px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#111", backgroundColor: "#fafafa", outline: "none", transition: "border-color 0.15s", fontFamily: "inherit" },
    inputPass: { paddingRight: 42 },
    otpInput: { width: "100%", boxSizing: "border-box", padding: "13px 14px 13px 42px", border: "2px solid #f0f0f0", borderRadius: 12, fontSize: 18, fontWeight: 700, color: "#111", backgroundColor: "#fafafa", outline: "none", transition: "border-color 0.15s", fontFamily: "inherit", letterSpacing: 8, textAlign: "center" },
    btn: { width: "100%", boxSizing: "border-box", padding: "14px", marginTop: 4, backgroundColor: loading ? "#555" : "#111", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", transition: "background-color 0.15s" },
    backBtn: { display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#999", padding: 0, marginBottom: 20, fontFamily: "inherit" },
    hint: { fontSize: 13, color: "#999", textAlign: "center", backgroundColor: "#fafafa", borderRadius: 10, padding: "10px 14px", border: "1px solid #f0f0f0" },
    hintEmail: { fontWeight: 700, color: "#111" },
    divider: { borderTop: "1px solid #f0f0f0", marginTop: 28, paddingTop: 20, textAlign: "center" },
    footer: { fontSize: 13, color: "#999" },
    footerLink: { fontWeight: 700, color: "#111", background: "none", border: "none", cursor: "pointer", fontSize: 13, textDecoration: "underline", padding: 0 },
    copy: { fontSize: 11, color: "#ccc", textAlign: "center", marginTop: 20 },
    spinner: { width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
    successIcon: { width: 80, height: 80, borderRadius: "50%", backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" },
    successTitle: { fontSize: 22, fontWeight: 900, color: "#111", margin: "0 0 8px", textAlign: "center" },
    successText: { fontSize: 13, color: "#999", textAlign: "center", lineHeight: 1.6 },
  };

  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "#111"; e.target.style.backgroundColor = "#fff"; };
  const blurBorder = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "#f0f0f0"; e.target.style.backgroundColor = "#fafafa"; };

  const stepIndex = { [STEP.EMAIL]: 0, [STEP.OTP]: 1, [STEP.RESET]: 2, [STEP.DONE]: 3 }[step] as number;

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logoWrap}>
          <div style={S.logoBox}><ShieldCheck size={28} color="#fff" /></div>
          <h1 style={S.title}>Quên Mật Khẩu</h1>
          <p style={S.subtitle}>Khôi phục tài khoản HUIT ERP của bạn</p>
        </div>

        {step !== STEP.DONE && (
          <div style={S.stepBar}>
            <div style={S.stepDot(stepIndex === 0, stepIndex > 0)} />
            <div style={S.stepDot(stepIndex === 1, stepIndex > 1)} />
            <div style={S.stepDot(stepIndex === 2, stepIndex > 2)} />
          </div>
        )}

        {step === STEP.EMAIL && (
          <>
            <button style={S.backBtn} onClick={onBack}><ArrowLeft size={14} /> Quay lại đăng nhập</button>
            <form onSubmit={handleSendEmail} style={S.fields}>
              <div><p style={S.hint}>Nhập địa chỉ email đã đăng ký để nhận mã xác thực OTP.</p></div>
              <div style={S.fieldWrap}>
                <span style={S.iconLeft}><Mail size={16} /></span>
                <input type="email" placeholder="Địa chỉ email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} style={S.input} autoComplete="email" autoFocus onFocus={focusBorder} onBlur={blurBorder} />
              </div>
              <button type="submit" disabled={loading} style={S.btn}>{loading && <span style={S.spinner} />}{loading ? "Đang gửi..." : "Gửi mã OTP"}</button>
            </form>
          </>
        )}

        {step === STEP.OTP && (
          <>
            <button style={S.backBtn} onClick={() => setStep(STEP.EMAIL)}><ArrowLeft size={14} /> Thay đổi email</button>
            <form onSubmit={handleVerifyOtp} style={S.fields}>
               <div>
                <p style={S.hint}>
                  Mã OTP đã được gửi đến{" "}
                  <span style={S.hintEmail}>{email}</span>.
                  Vui lòng kiểm tra hộp thư của bạn.
                </p>
              </div>
              <div style={S.fieldWrap}>
                 <span style={S.iconLeft}><KeyRound size={16} /></span>
                 <input
                  type="text"
                  placeholder="_ _ _ _ _ _"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  style={S.otpInput}
                  autoFocus
                  maxLength={6}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                />
              </div>
              <button type="submit" disabled={loading} style={S.btn}>
                {loading && <span style={S.spinner} />}
                {loading ? "Đang xác thực..." : "Xác thực OTP"}
              </button>
              <button type="button" style={{ ...S.backBtn, margin: "4px auto 0", justifyContent: "center" }} onClick={handleSendEmail} disabled={loading}>Gửi lại mã OTP</button>
            </form>
          </>
        )}

        {step === STEP.RESET && (
          <>
            <button style={S.backBtn} onClick={() => setStep(STEP.OTP)}><ArrowLeft size={14} /> Quay lại</button>
            <form onSubmit={handleResetPassword} style={S.fields}>
              <div style={S.fieldWrap}>
                <span style={S.iconLeft}><Lock size={16} /></span>
                <input type={showPass ? "text" : "password"} placeholder="Mật khẩu mới (ít nhất 6 ký tự)" value={newPass} onChange={(e) => setNewPass(e.target.value)} style={{ ...S.input, ...S.inputPass }} autoFocus autoComplete="new-password" onFocus={focusBorder} onBlur={blurBorder} />
                <button type="button" tabIndex={-1} onClick={() => setShowPass(v => !v)} style={S.iconRight}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <div style={S.fieldWrap}>
                 <span style={S.iconLeft}><Lock size={16} /></span>
                 <input type={showConfirm ? "text" : "password"} placeholder="Xác nhận mật khẩu mới" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} style={{ ...S.input, ...S.inputPass }} autoComplete="new-password" onFocus={focusBorder} onBlur={blurBorder} />
                 <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)} style={S.iconRight}>{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
               {newPass && (
                <ul style={{ fontSize: 12, color: "#999", paddingLeft: 16, margin: 0 }}>
                  <li style={{ color: newPass.length >= 6 ? "#22c55e" : "#f87171" }}>
                    {newPass.length >= 6 ? "✓" : "✗"} Ít nhất 6 ký tự
                  </li>
                  <li style={{ color: confirmPass && newPass === confirmPass ? "#22c55e" : "#f87171" }}>
                    {confirmPass && newPass === confirmPass ? "✓" : "✗"} Mật khẩu khớp
                  </li>
                </ul>
              )}
              <button type="submit" disabled={loading} style={S.btn}>{loading && <span style={S.spinner} />}{loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}</button>
            </form>
          </>
        )}

        {step === STEP.DONE && (
          <div style={{ textAlign: "center" }}>
            <div style={S.successIcon}><CheckCircle2 size={44} color="#22c55e" /></div>
            <h2 style={S.successTitle}>Thành công!</h2>
            <p style={S.successText}>Mật khẩu của bạn đã được đặt lại.<br />Vui lòng đăng nhập bằng mật khẩu mới.</p>
            <button onClick={onBack} style={{ ...S.btn, marginTop: 24 }}>Đăng nhập ngay</button>
          </div>
        )}

        {step !== STEP.DONE && (
          <div style={S.divider}>
            <p style={S.footer}>Nhớ mật khẩu rồi? <button type="button" onClick={onBack} style={S.footerLink}>Đăng nhập</button></p>
          </div>
        )}
      </div>
      <p style={S.copy}>Đại học Công nghiệp TP.HCM · HUIT ERP v2.0</p>
    </div>
  );
};
export default ForgotPassword;

