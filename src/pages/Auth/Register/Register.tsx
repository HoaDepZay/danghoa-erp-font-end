import React from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { StepInfo, StepOtp, StepPending } from "./RegisterForm";
import { useRegister } from "./useRegister";

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const { step, setStep, form, setForm, loading, handleRegister, handleVerify, handleResend } = useRegister();

  const TITLES: Record<number, string> = {
    1: "Tạo tài khoản",
    2: "Xác thực OTP",
    3: "Đang chờ duyệt",
  };

  const getStepDotStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: active ? "#111" : "#eee",
    transition: "background-color 0.3s",
  });

  const S: Record<string, React.CSSProperties> = {
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
    ghostBtn: {
      background: "none", border: "none", cursor: "pointer",
      fontSize: 13, color: "#111", fontWeight: 700, textDecoration: "underline",
      fontFamily: "inherit", padding: 0,
    },
    backBtn: {
      background: "none", border: "none", cursor: "pointer",
      fontSize: 13, color: "#999", fontFamily: "inherit", padding: 0,
      display: "flex", alignItems: "center", gap: 4, justifyContent: "center"
    },
    divider: { borderTop: "1px solid #f0f0f0", marginTop: 24, paddingTop: 18 },
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="auth-logo-box">
            <ShieldCheck size={24} color="#fff" />
          </div>
          <h1 style={{ ...S.title, fontSize: 22 }}>{TITLES[step]}</h1>
          {step === 1 && <p style={S.sub}>Điền thông tin để đăng ký</p>}
          {step === 2 && <p style={S.sub}>Mã OTP gửi đến {form.email}</p>}
          {step === 3 && <p style={S.sub}>Hồ sơ đang chờ Admin xem xét</p>}
        </div>

        {/* Step progress bar — chỉ hiển thị ở step 1 & 2 */}
        {step < 3 && (
          <div style={S.stepBar}>
            <div style={getStepDotStyle(1 <= step)} />
            <div style={getStepDotStyle(2 <= step)} />
          </div>
        )}

        {step === 1 && <StepInfo form={form} setForm={setForm} onNext={handleRegister} loading={loading} />}
        {step === 2 && <StepOtp email={form.email} onVerify={handleVerify} onResend={handleResend} loading={loading} />}
        {step === 3 && <StepPending email={form.email} onGoLogin={onSwitchToLogin} />}

        {/* Footer navigation — ẩn khi đang ở màn chờ duyệt */}
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
