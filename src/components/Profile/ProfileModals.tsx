import React from "react";
import { X } from "lucide-react";

const ProfileModals = ({ modal, setModal, departments, loading, handlers }) => {
  if (!modal.isOpen) return null;
  const close = () => setModal({ isOpen: false, type: "", data: {} });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 text-slate-900">
      <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="mb-6 flex items-center justify-between font-black text-xl">
          {modal.type === "self_edit"
            ? "Sửa Email"
            : modal.type === "pass_edit"
              ? "Đổi mật khẩu"
              : "Quản trị"}
          <button onClick={close} className="text-slate-300 hover:text-red-600">
            <X />
          </button>
        </div>

        {/* --- MODAL NỘI DUNG --- */}
        {modal.type === "self_edit" && (
          <div className="space-y-4">
            <input
              type="EMAIL"
              value={modal.data.EMAIL}
              onChange={(e) =>
                setModal({
                  ...modal,
                  data: { ...modal.data, EMAIL: e.target.value },
                })
              }
              className="w-full rounded-2xl border-2 border-slate-100 p-4 outline-none focus:border-red-500 font-bold"
            />
            <button
              onClick={handlers.handleUpdateProfile}
              className="w-full rounded-2xl bg-red-600 py-4 font-black text-white hover:bg-red-700"
            >
              LƯU THAY ĐỔI
            </button>
          </div>
        )}

        {modal.type === "pass_edit" && (
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Mật khẩu cũ"
              onChange={(e) =>
                setModal({
                  ...modal,
                  data: { ...modal.data, oldPass: e.target.value },
                })
              }
              className="w-full rounded-2xl border-2 border-slate-100 p-4 outline-none focus:border-red-500"
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              onChange={(e) =>
                setModal({
                  ...modal,
                  data: { ...modal.data, newPass: e.target.value },
                })
              }
              className="w-full rounded-2xl border-2 border-slate-100 p-4 outline-none focus:border-red-500"
            />
            <input
              type="password"
              placeholder="Xác nhận"
              onChange={(e) =>
                setModal({
                  ...modal,
                  data: { ...modal.data, confirmPass: e.target.value },
                })
              }
              className="w-full rounded-2xl border-2 border-slate-100 p-4 outline-none focus:border-red-500"
            />
            <button
              onClick={handlers.handleChangePass}
              className="w-full rounded-2xl bg-slate-900 py-4 font-black text-white hover:bg-black uppercase"
            >
              Xác nhận đổi
            </button>
          </div>
        )}

        {modal.type === "admin_edit" && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-red-400 uppercase">
              Sửa NV: {modal.data.HO_TEN}
            </p>
            <input
              type="text"
              placeholder="Họ tên"
              value={modal.data.HO_TEN}
              onChange={(e) =>
                setModal({
                  ...modal,
                  data: { ...modal.data, HO_TEN: e.target.value },
                })
              }
              className="w-full rounded-2xl border-2 border-slate-100 p-4 outline-none focus:border-red-500 font-bold"
            />
            <input
              type="number"
              placeholder="Lương"
              onChange={(e) =>
                setModal({
                  ...modal,
                  data: { ...modal.data, LUONG: e.target.value },
                })
              }
              className="w-full rounded-2xl border-2 border-slate-100 p-4 outline-none focus:border-red-500 font-bold"
            />
            <select
              onChange={(e) =>
                setModal({
                  ...modal,
                  data: { ...modal.data, CHUC_VU: e.target.value },
                })
              }
              className="w-full rounded-2xl border-2 border-slate-100 p-4 outline-none focus:border-red-500 font-bold"
            >
              <option value="Nhân viên">Nhân viên</option>
              <option value="Cộng tác viên">Cộng tác viên</option>
              <option value="Quản lý">Quản lý</option>
            </select>
            <button
              onClick={handlers.handleAdminEditNV}
              className="w-full rounded-2xl bg-red-600 py-4 font-black text-white"
            >
              CẬP NHẬT
            </button>
          </div>
        )}

        {modal.type === "dept_create" && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Tên phòng ban"
              value={modal.data.tenpb}
              onChange={(e) =>
                setModal({
                  ...modal,
                  data: { ...modal.data, tenpb: e.target.value },
                })
              }
              className="w-full rounded-2xl border-2 border-slate-100 p-4 outline-none focus:border-emerald-500 font-bold"
            />
            <button
              onClick={handlers.handleCreateDepartment}
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-600 py-4 font-black text-white uppercase"
            >
              {loading ? "Đang tạo..." : "Tạo mới"}
            </button>
          </div>
        )}

        {modal.type === "emp_create" && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <p className="text-[10px] font-black text-red-400 uppercase">
              Tạo tài khoản nhân viên
            </p>
            <input
              type="text"
              placeholder="Username (Họ tên viết liền không dấu)"
              onChange={(e) =>
                setModal({
                  ...modal,
                  data: { ...modal.data, username: e.target.value },
                })
              }
              className="w-full rounded-2xl border-2 border-slate-100 p-4 outline-none focus:border-red-500 font-bold"
            />
            <input
              type="EMAIL"
              placeholder="Email"
              onChange={(e) =>
                setModal({
                  ...modal,
                  data: { ...modal.data, EMAIL: e.target.value },
                })
              }
              className="w-full rounded-2xl border-2 border-slate-100 p-4 outline-none focus:border-red-500 font-bold"
            />
            <input
              type="password"
              placeholder="Mật khẩu khởi tạo"
              onChange={(e) =>
                setModal({
                  ...modal,
                  data: { ...modal.data, password: e.target.value },
                })
              }
              className="w-full rounded-2xl border-2 border-slate-100 p-4 outline-none focus:border-red-500 font-bold"
            />
            <select
              onChange={(e) =>
                setModal({
                  ...modal,
                  data: { ...modal.data, MA_PHG: e.target.value },
                })
              }
              className="w-full rounded-2xl border-2 border-slate-100 p-4 outline-none focus:border-red-500 font-bold"
            >
              <option value="">Chọn phòng ban</option>
              {departments.map((dept) => (
                <option key={dept.MA_PHG} value={dept.MA_PHG}>
                  {dept.tenpb}
                </option>
              ))}
            </select>
            <button
              onClick={handlers.handleCreateEmployee}
              disabled={loading}
              className="w-full rounded-2xl bg-red-600 py-4 font-black text-white uppercase tracking-widest"
            >
              Tạo Nhân Viên
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModals;
