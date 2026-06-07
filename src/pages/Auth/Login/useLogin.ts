import { useState } from "react";
import { api } from "../../../services/api";
import { toast } from "../../../utils/helpers";

// Các status từ backend cho hồ sơ chờ duyệt
type PendingStatus = "PENDING_OTP" | "OTP_VERIFIED" | "EXPIRED" | "REJECTED";

// Map status → message rõ ràng cho UI
const PENDING_MESSAGES: Record<PendingStatus, string> = {
  PENDING_OTP:  "Vui lòng xác thực OTP trước khi đăng nhập.",
  OTP_VERIFIED: "Tài khoản của bạn chưa được Admin chấp nhận. Vui lòng chờ xét duyệt.",
  EXPIRED:      "Mã OTP đã hết hạn. Vui lòng đăng ký lại.",
  REJECTED:     "Tài khoản của bạn đã bị từ chối. Liên hệ Admin để biết thêm chi tiết.",
};

export const useLogin = (onLogin: (user: any) => void) => {
  const [form, setForm] = useState({ EMAIL: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  // State banner hiển thị khi tài khoản chưa được duyệt
  const [pendingStatus, setPendingStatus] = useState<PendingStatus | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPendingStatus(null);
    if (!form.EMAIL || !form.password) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setLoading(true);
    try {
      const normalizedEmail = form.EMAIL.trim().toLowerCase();
      const res = await api.login({ EMAIL: normalizedEmail, password: form.password });
      const data = res.data;
      if (data.success || data.token || data.accessToken) {
        const accToken = data.accessToken || data.token;
        const refToken = data.refreshToken;
        
        // Tương thích ngược: vẫn lưu token
        if (accToken) localStorage.setItem("token", accToken);
        if (accToken) localStorage.setItem("accessToken", accToken);
        if (refToken) localStorage.setItem("refreshToken", refToken);

        const userData = data.user || data.nhanvien || data.employee || data.data || {};
        localStorage.setItem("user", JSON.stringify(userData));
        onLogin(userData);
      } else {
        toast.error(data.message || "Đăng nhập thất bại!");
      }
    } catch (err: any) {
      const status: string | undefined = err.response?.data?.status;
      const message: string | undefined = err.response?.data?.message;

      // Fallback kiểm tra hồ sơ chờ duyệt theo status từ backend
      if (status && status in PENDING_MESSAGES) {
        setPendingStatus(status as PendingStatus);
      } else if (message?.toLowerCase().includes("mật khẩu")) {
        toast.error("Mật khẩu không chính xác.");
      } else {
        toast.error(message || "Tên đăng nhập hoặc mật khẩu không đúng!");
      }
    } finally {
      setLoading(false);
    }
  };

  return { form, set, showPass, setShowPass, loading, handleSubmit, pendingStatus, setPendingStatus };
};
