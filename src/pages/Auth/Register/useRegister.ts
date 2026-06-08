import { useState } from "react";
import { api } from "../../../services/api";
import { toast } from "../../../utils/helpers";

// Steps: 1=Thông tin, 2=OTP, 3=Chờ duyệt admin
export const useRegister = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ HO_TEN: "", EMAIL: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await api.register(form);
      toast.success("Mã OTP đã gửi đến EMAIL của bạn!");
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "EMAIL đã tồn tại hoặc có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (otp: string) => {
    if (otp.length !== 6) return toast.error("Nhập đầy đủ 6 chữ số OTP!");
    setLoading(true);
    try {
      await api.verifyOtp({ EMAIL: form.EMAIL, otpCode: otp });
      // Chỉ cập nhật trạng thái OTP_VERIFIED — chưa tạo tài khoản chính thức
      // Chuyển sang màn chờ admin duyệt
      setStep(3);
      toast.success("Xác thực OTP thành công! Hồ sơ của bạn đang chờ admin duyệt.");
    } catch (err: any) {
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

  return { step, setStep, form, setForm, loading, handleRegister, handleVerify, handleResend };
};
