import { useState } from "react";
import { api } from "../../../services/api";
import { toast } from "../../../utils/helpers";

// Flow: EMAIL → RESET (nhập OTP + mật khẩu mới cùng lúc) → DONE
export const STEP = { EMAIL: "email", RESET: "reset", DONE: "done" };

export const useForgotPassword = () => {
  const [step, setStep] = useState(STEP.EMAIL);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Bước 1: Gửi email → POST /api/auth/forgot-password
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Vui lòng nhập địa chỉ email!"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Email không hợp lệ!"); return; }
    setLoading(true);
    try {
      await api.forgotPassword({ email });
      toast.success("Nếu email tồn tại, hệ thống đã gửi mã OTP đặt lại mật khẩu.");
      setStep(STEP.RESET);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể gửi OTP, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại OTP (gọi lại endpoint forgot-password)
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await api.forgotPassword({ email });
      toast.success("Đã gửi lại mã OTP!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể gửi lại OTP!");
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP + đặt mật khẩu mới → POST /api/auth/reset-password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { toast.error("Vui lòng nhập đủ mã OTP 6 chữ số!"); return; }
    if (!newPass || newPass.length < 6) { toast.error("Mật khẩu phải có ít nhất 6 ký tự!"); return; }
    if (newPass !== confirmPass) { toast.error("Mật khẩu xác nhận không khớp!"); return; }
    setLoading(true);
    try {
      await api.resetPassword({ email, otpCode: otp, newPassword: newPass });
      toast.success("Đặt lại mật khẩu thành công!");
      setStep(STEP.DONE);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP không đúng hoặc đã hết hạn, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return {
    step, setStep, email, setEmail, otp, setOtp,
    newPass, setNewPass, confirmPass, setConfirmPass,
    showPass, setShowPass, showConfirm, setShowConfirm,
    loading, handleSendEmail, handleResendOtp, handleResetPassword,
  };
};
