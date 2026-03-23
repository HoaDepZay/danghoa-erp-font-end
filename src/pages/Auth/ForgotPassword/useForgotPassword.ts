import { useState } from "react";
import { api } from "../../../services/api";
import { toast } from "../../../utils/helpers";

export const STEP = { EMAIL: "email", OTP: "otp", RESET: "reset", DONE: "done" };

export const useForgotPassword = () => {
  const [step, setStep] = useState(STEP.EMAIL);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Vui lòng nhập địa chỉ email!"); return; }
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email)) { toast.error("Email không hợp lệ!"); return; }
    setLoading(true);
    try {
      await api.forgotPassword({ email });
      toast.success("Mã OTP đã được gửi đến email của bạn!");
      setStep(STEP.OTP);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Email không tồn tại trong hệ thống!");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) { toast.error("Vui lòng nhập mã OTP!"); return; }
    setLoading(true);
    try {
      await api.verifyOtp({ email, otpCode: otp });
      toast.success("Xác thực OTP thành công!");
      setStep(STEP.RESET);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass.length < 6) { toast.error("Mật khẩu phải có ít nhất 6 ký tự!"); return; }
    if (newPass !== confirmPass) { toast.error("Mật khẩu xác nhận không khớp!"); return; }
    setLoading(true);
    try {
      await api.changePassword({ email, otpCode: otp, newPassword: newPass });
      toast.success("Đặt lại mật khẩu thành công!");
      setStep(STEP.DONE);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đặt lại mật khẩu thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return {
    step, setStep, email, setEmail, otp, setOtp, newPass, setNewPass, confirmPass, setConfirmPass,
    showPass, setShowPass, showConfirm, setShowConfirm, loading, handleSendEmail, handleVerifyOtp, handleResetPassword
  };
};

