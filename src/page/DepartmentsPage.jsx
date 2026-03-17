import { useState, useEffect, useCallback } from "react";
import { Building2, Plus, Edit3, Users, ChevronRight } from "lucide-react";
import { api } from "../services/api";
import { toast } from "../utils/helpers";
import {
  Btn, Card, SectionHeader, EmptyState, SkeletonRows, Avatar, Spinner
} from "../components/UI/index";
import Modal from "../components/UI/Modal";

// ── Form Modal ────────────────────────────────────────────────────────────────
const DeptModal = ({ isOpen, onClose, editData, employees, onSuccess }) => {
  const isEdit = !!editData;
  const [form, setForm] = useState({ TenPB: "", MaTruongPhg: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        TenPB: editData.TENPB || editData.TenPB || "",
        MaTruongPhg: editData.MATRUONGPHG || editData.MaTruongPhg || "",
      });
    } else {
      setForm({ TenPB: "", MaTruongPhg: "" });
    }
  }, [editData, isOpen]);

  const handleSubmit = async () => {
    if (!form.TenPB.trim()) return toast.error("Tên phòng ban không được trống");
    setLoading(true);
    try {
      const payload = {
        TenPB: form.TenPB,
        MaTruongPhg: form.MaTruongPhg || undefined,
      };
      if (isEdit) {
        const id = editData.MAPHG || editData.MaPhg;
        await api.updateDepartment(id, payload);
        toast.success("Cập nhật phòng ban thành công!");
      } else {
        await api.createDepartment(payload);
        toast.success("Tạo phòng ban thành công!");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Lỗi thao tác!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>Hủy</Btn>
          <Btn loading={loading} onClick={handleSubmit}>{isEdit ? "Lưu" : "Thêm"}</Btn>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="form-label">Tên phòng ban *</label>
          <input
            className="form-input"
            placeholder="VD: Phòng Kỹ thuật"
            value={form.TenPB}
            onChange={(e) => setForm((f) => ({ ...f, TenPB: e.target.value }))}
          />
        </div>
        <div>
          <label className="form-label">Trưởng phòng</label>
          <select
            className="form-input"
            value={form.MaTruongPhg}
            onChange={(e) => setForm((f) => ({ ...f, MaTruongPhg: e.target.value }))}
          >
            <option value="">— Chưa chọn —</option>
            {employees.map((emp) => (
              <option key={emp.MANV || emp.MaNV} value={emp.MANV || emp.MaNV}>
                {emp.HOTEN || emp.HoTen} ({emp.MANV || emp.MaNV})
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
};

// ── Detail Modal ─────────────────────────────────────────────────────────────
const DeptDetailModal = ({ isOpen, onClose, deptId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && deptId) {
      setLoading(true);
      api.getDepartment(deptId)
        .then((r) => setData(r.data))
        .catch(() => toast.error("Không thể tải chi tiết phòng ban"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, deptId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết phòng ban" size="md"
      footer={<Btn variant="secondary" onClick={onClose}>Đóng</Btn>}>
      {loading ? (
        <div className="flex justify-center py-8"><Spinner size={28} className="text-gray-400" /></div>
      ) : data ? (
        <div className="space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center">
              <Building2 size={26} className="text-white" />
            </div>
            <div>
              <p className="text-lg font-700">{data.TENPB || data.TenPB}</p>
              <p className="text-sm text-gray-400">Mã: {data.MAPHG || data.MaPhg}</p>
            </div>
          </div>
          {data.TruongPhong && (
            <div>
              <p className="text-xs text-gray-500 font-600 uppercase tracking-wider mb-2">Trưởng phòng</p>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <Avatar name={data.TruongPhong} size="sm" />
                <span className="font-600 text-sm">{data.TruongPhong}</span>
              </div>
            </div>
          )}
          {data.NhanVien && data.NhanVien.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 font-600 uppercase tracking-wider mb-3">
                Nhân viên ({data.NhanVien.length} người)
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {data.NhanVien.map((nv) => (
                  <div key={nv.MANV || nv.MaNV} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50">
                    <Avatar name={nv.HOTEN || nv.HoTen} size="sm" />
                    <div>
                      <p className="text-sm font-600">{nv.HOTEN || nv.HoTen}</p>
                      <p className="text-xs text-gray-400">{nv.CHUCVU || nv.chucvu}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const DepartmentsPage = ({ user }) => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ type: "", data: null });

  const ROLE_LEVELS = { "Cộng tác viên": 1, "Nhân viên": 2, "Quản lý": 3, "Admin": 4 };
  const userLevel = ROLE_LEVELS[user?.chuc_vu] || 1;

  const fetchDepts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getDepartments();
      setDepartments(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách phòng ban!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepts(); }, [fetchDepts]);
  useEffect(() => {
    api.getEmployees({ pageSize: 200 }).then((r) => {
      setEmployees(r.data?.data || r.data?.employees || r.data || []);
    }).catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Phòng ban"
        subtitle={`${departments.length} phòng ban trong hệ thống`}
        actions={
          userLevel >= 3 && (
            <Btn size="sm" icon={<Plus size={15} />} onClick={() => setModal({ type: "add", data: null })}>
              Thêm phòng ban
            </Btn>
          )
        }
      />

      {loading ? (
        <Card padding={false}>
          <table className="data-table">
            <thead><tr><th>Mã</th><th>Tên phòng ban</th><th>Trưởng phòng</th><th>Thao tác</th></tr></thead>
            <tbody><SkeletonRows cols={4} rows={6} /></tbody>
          </table>
        </Card>
      ) : departments.length === 0 ? (
        <Card>
          <EmptyState icon={<Building2 size={48} />} title="Chưa có phòng ban nào" description="Thêm phòng ban đầu tiên cho tổ chức" />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <Card
              key={dept.MAPHG || dept.MaPhg}
              className="hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                    <Building2 size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-700 text-gray-900">{dept.TENPB || dept.TenPB}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Mã: {dept.MAPHG || dept.MaPhg}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {userLevel >= 3 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setModal({ type: "edit", data: dept }); }}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit3 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {dept.TruongPhong && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <Users size={13} />
                  <span>TP: {dept.TruongPhong}</span>
                </div>
              )}

              <button
                onClick={() => setModal({ type: "detail", data: dept.MAPHG || dept.MaPhg })}
                className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-50 py-2 rounded-lg transition-colors"
              >
                <span>Xem chi tiết</span>
                <ChevronRight size={13} />
              </button>
            </Card>
          ))}
        </div>
      )}

      <DeptModal
        isOpen={modal.type === "add" || modal.type === "edit"}
        onClose={() => setModal({ type: "", data: null })}
        editData={modal.type === "edit" ? modal.data : null}
        employees={employees}
        onSuccess={fetchDepts}
      />
      <DeptDetailModal
        isOpen={modal.type === "detail"}
        onClose={() => setModal({ type: "", data: null })}
        deptId={modal.data}
      />
    </div>
  );
};

export default DepartmentsPage;
