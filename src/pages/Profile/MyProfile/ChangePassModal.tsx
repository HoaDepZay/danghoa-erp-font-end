import React, { useState } from "react";
import { api } from "../../../services/api";
import { toast } from "../../../utils/helpers";
import { Btn, FormField } from "../../../components/UI/index";
import Modal from "../../../components/UI/Modal";

interface ChangePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const ChangePassModal: React.FC<ChangePassModalProps> = ({ isOpen, onClose, user }) => {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.oldPassword || !form.newPassword) return toast.error("Vui lòng điền đầy đủ!");
    if (form.newPassword !== form.confirmPassword) return toast.error("Mật khẩu mới không khớp!");
    if (form.newPassword.length < 6) return toast.error("Mật khẩu phải ít nhất 6 ký tự!");
    setLoading(true);
    try {
      const email = user?.EMAIL || user?.Email || user?.email;
      await api.changePassword({ email, oldPassword: form.oldPassword, newPassword: form.newPassword });
      toast.success("Đổi mật khẩu thành công!");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Sai mật khẩu cũ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đổi mật khẩu"
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>Hủy</Btn>
          <Btn loading={loading} onClick={handleSubmit}>Xác nhận</Btn>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FormField label="Mật khẩu hiện tại">
          <input className="form-input" type="password" placeholder="••••••••" value={form.oldPassword} onChange={set("oldPassword")} />
        </FormField>
        <FormField label="Mật khẩu mới">
          <input className="form-input" type="password" placeholder="Ít nhất 6 ký tự" value={form.newPassword} onChange={set("newPassword")} />
        </FormField>
        <FormField label="Xác nhận mật khẩu mới">
          <input className="form-input" type="password" placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChange={set("confirmPassword")} />
        </FormField>
      </div>
    </Modal>
  );
};

