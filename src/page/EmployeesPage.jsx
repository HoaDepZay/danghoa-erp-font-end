import { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Edit3, Search, Download,
} from "lucide-react";
import { api } from "../services/api";
import { toast, formatDate, exportToCsv } from "../utils/helpers";
import { toArray } from "../utils/user";
import {
  Btn, Badge, Avatar, Card, SectionHeader, SkeletonRows,
  EmptyState, Pagination, FormField, Spinner,
} from "../components/UI/index";
import Modal from "../components/UI/Modal";

const ROLE_COLORS = { "Quản lý": "black", "Nhân viên": "gray", "Cộng tác viên": "blue", "Admin": "purple" };

// ── Modal Thêm / Sửa NV ─────────────────────────────────────────────────────
const EmployeeModal = ({ isOpen, onClose, editData, departments, onSuccess }) => {
  const isEdit = !!editData;
  const [form, setForm] = useState({
    MaNV: "", HoTen: "", Email: "", SoDienThoai: "", DiaChi: "",
    GioiTinh: "Nam", NgaySinh: "", MaPhg: "", LuongCoBan: "",
    chucvu: "Nhân viên", Password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        MaNV: editData.MANV || editData.MaNV || "",
        HoTen: editData.HOTEN || editData.HoTen || "",
        Email: editData.EMAIL || editData.Email || "",
        SoDienThoai: editData.SODIENTHOA || editData.SoDienThoai || "",
        DiaChi: editData.DIACHINHAN || editData.DIACHI || editData.DiaChi || "",
        GioiTinh: editData.GIOITINH || editData.GioiTinh || "Nam",
        NgaySinh: editData.NGAYSINH ? editData.NGAYSINH.split("T")[0] : "",
        MaPhg: editData.MAPHG || editData.MaPhg || "",
        LuongCoBan: editData.LUONG || editData.LUONGCOBAN || editData.LuongCoBan || "",
        chucvu: editData.CHUCVU || editData.chucvu || "Nhân viên",
        Password: "",
      });
    } else {
      setForm({ MaNV: "", HoTen: "", Email: "", SoDienThoai: "", DiaChi: "", GioiTinh: "Nam", NgaySinh: "", MaPhg: "", LuongCoBan: "", chucvu: "Nhân viên", Password: "" });
    }
  }, [editData, isOpen]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.HoTen) return toast.error("Họ tên không được trống");
    setLoading(true);
    try {
      const payload = {
        HoTen: form.HoTen,
        Email: form.Email,
        SoDienThoai: form.SoDienThoai,
        DiaChi: form.DiaChi,
        GioiTinh: form.GioiTinh,
        NgaySinh: form.NgaySinh || undefined,
        MaPhg: form.MaPhg ? Number(form.MaPhg) : undefined,
        LuongCoBan: form.LuongCoBan ? Number(form.LuongCoBan) : undefined,
        chucvu: form.chucvu,
      };
      if (isEdit) {
        await api.updateEmployee(form.MaNV, payload);
        toast.success("Cập nhật nhân viên thành công!");
      } else {
        if (!form.MaNV) return toast.error("Mã NV không được trống");
        await api.createEmployee({ ...payload, MaNV: form.MaNV, Password: form.Password || "123456" });
        toast.success("Thêm nhân viên thành công!");
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
      title={isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
      size="lg"
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>Hủy</Btn>
          <Btn loading={loading} onClick={handleSubmit}>{isEdit ? "Lưu thay đổi" : "Thêm mới"}</Btn>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        {!isEdit && (
          <FormField label="Mã nhân viên *">
            <input className="form-input" placeholder="VD: NV001" value={form.MaNV} onChange={set("MaNV")} />
          </FormField>
        )}
        <FormField label="Họ và tên *">
          <input className="form-input" placeholder="Nguyễn Văn A" value={form.HoTen} onChange={set("HoTen")} />
        </FormField>
        <FormField label="Email">
          <input className="form-input" type="email" placeholder="email@huit.edu.vn" value={form.Email} onChange={set("Email")} />
        </FormField>
        <FormField label="Số điện thoại">
          <input className="form-input" placeholder="0901234567" value={form.SoDienThoai} onChange={set("SoDienThoai")} />
        </FormField>
        <FormField label="Ngày sinh">
          <input className="form-input" type="date" value={form.NgaySinh} onChange={set("NgaySinh")} />
        </FormField>
        <FormField label="Giới tính">
          <select className="form-input" value={form.GioiTinh} onChange={set("GioiTinh")}>
            <option>Nam</option>
            <option>Nữ</option>
          </select>
        </FormField>
        <FormField label="Phòng ban">
          <select className="form-input" value={form.MaPhg} onChange={set("MaPhg")}>
            <option value="">— Chưa chọn —</option>
            {departments.map((d) => (
              <option key={d.MAPHG || d.MaPhg} value={d.MAPHG || d.MaPhg}>
                {d.TENPB || d.TenPB}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Chức vụ">
          <select className="form-input" value={form.chucvu} onChange={set("chucvu")}>
            <option>Cộng tác viên</option>
            <option>Nhân viên</option>
            <option>Quản lý</option>
          </select>
        </FormField>
        <FormField label="Lương cơ bản (VNĐ)">
          <input className="form-input" type="number" placeholder="5000000" value={form.LuongCoBan} onChange={set("LuongCoBan")} />
        </FormField>
        {!isEdit && (
          <FormField label="Mật khẩu mặc định">
            <input className="form-input" placeholder="Mặc định: 123456" value={form.Password} onChange={set("Password")} />
          </FormField>
        )}
        <div className="col-span-2">
          <FormField label="Địa chỉ">
            <input className="form-input" placeholder="Số nhà, đường, quận, TP" value={form.DiaChi} onChange={set("DiaChi")} />
          </FormField>
        </div>
      </div>
    </Modal>
  );
};

// ── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ isOpen, onClose, employeeId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employeeId) {
      setLoading(true);
      api.getEmployee(employeeId)
        .then((r) => {
          // API trả { success, data: {...} } hoặc { success, employee: {...} }
          const payload = r.data?.data || r.data?.employee || r.data || null;
          setData(payload);
        })
        .catch(() => toast.error("Không thể tải thông tin"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, employeeId]);

  const emp = data?.employee || data;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết nhân viên" size="md"
      footer={<Btn variant="secondary" onClick={onClose}>Đóng</Btn>}>
      {loading ? (
        <div className="flex justify-center py-8"><Spinner size={28} className="text-gray-400" /></div>
      ) : emp ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <Avatar name={emp.HOTEN || emp.HoTen} size="lg" />
            <div>
              <p className="text-lg font-700">{emp.HOTEN || emp.HoTen}</p>
              <Badge color={ROLE_COLORS[emp.CHUCVU || emp.chucvu] || "gray"}>{emp.CHUCVU || emp.chucvu}</Badge>
            </div>
          </div>
          {[
            ["Mã NV", emp.MANV || emp.MaNV],
            ["Email", emp.EMAIL || emp.Email],
            ["SĐT", emp.SODIENTHOA || emp.SoDienThoai || "—"],
            ["Ngày sinh", formatDate(emp.NGAYSINH || emp.NgaySinh)],
            ["Giới tính", emp.GIOITINH || emp.GioiTinh],
            ["Địa chỉ", emp.DIACHINHAN || emp.DIACHI || emp.DiaChi],
            ["Phòng ban", emp.TENPB || emp.TenPB],
            ["Lương cơ bản", (emp.LUONG || emp.LUONGCOBAN) ? `${Number(emp.LUONG || emp.LUONGCOBAN).toLocaleString("vi-VN")} VNĐ` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-500 text-right max-w-[60%]">{value || "—"}</span>
            </div>
          ))}
        </div>
      ) : null}
    </Modal>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const EmployeesPage = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState({ type: "", data: null });
  const PAGE_SIZE = 10;

  const ROLE_LEVELS = { "Cộng tác viên": 1, "Nhân viên": 2, "Quản lý": 3, "Admin": 4 };
  const userLevel = ROLE_LEVELS[user?.chuc_vu] || 1;

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getEmployees({ page, pageSize: PAGE_SIZE, search: search || undefined });
      const d = res.data;
      // API trả về { success, message, data: [...], pagination: { totalRecords, ... } }
      const arr = toArray(d);
      setEmployees(arr);
      setTotal(d?.pagination?.totalRecords ?? d?.total ?? arr.length);
    } catch (err) {
      toast.error("Không thể tải danh sách nhân viên!");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => {
    api.getDepartments().then((r) => {
      // API trả { success, data: [...] } → r.data là object, r.data.data là array
      const depts = Array.isArray(r.data) ? r.data
        : Array.isArray(r.data?.data) ? r.data.data
        : [];
      setDepartments(depts);
    }).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleExport = () => {
    exportToCsv(
      "nhan_vien",
      ["Mã NV", "Họ tên", "Email", "SĐT", "Chức vụ", "Phòng ban"],
      employees.map((e) => [
        e.MANV || e.MaNV,
        e.HOTEN || e.HoTen,
        e.EMAIL || e.Email,
        e.SODIENTHOA || e.SoDienThoai,
        e.CHUCVU || e.chucvu,
        e.TENPB || e.TenPB,
      ])
    );
    toast.success("Xuất CSV thành công!");
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Nhân viên"
        subtitle={`${total} người · Trang ${page}/${totalPages || 1}`}
        actions={
          <>
            <Btn variant="secondary" size="sm" icon={<Download size={15} />} onClick={handleExport}>
              Xuất CSV
            </Btn>
            {userLevel >= 3 && (
              <Btn size="sm" icon={<UserPlus size={15} />} onClick={() => setModal({ type: "add", data: null })}>
                Thêm nhân viên
              </Btn>
            )}
          </>
        }
      />

      {/* Search */}
      <Card className="mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="form-input pl-9"
            placeholder="Tìm theo tên, mã NV, email..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Chức vụ</th>
                <th>Phòng ban</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows cols={6} rows={8} />
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon={<Search size={40} />} title="Không tìm thấy nhân viên" />
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.MANV || emp.MaNV}>
                    <td>
                      <span className="font-600 text-xs bg-gray-100 px-2 py-1 rounded">
                        {emp.MANV || emp.MaNV}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={emp.HOTEN || emp.HoTen} size="sm" />
                        <span className="font-600">{emp.HOTEN || emp.HoTen}</span>
                      </div>
                    </td>
                    <td className="text-gray-500">{emp.EMAIL || emp.Email || "—"}</td>
                    <td>
                      <Badge color={ROLE_COLORS[emp.CHUCVU || emp.chucvu] || "gray"}>
                        {emp.CHUCVU || emp.chucvu}
                      </Badge>
                    </td>
                    <td className="text-gray-500">{emp.TENPB || emp.TenPB || "—"}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal({ type: "detail", data: emp.MANV || emp.MaNV })}
                          className="text-xs text-gray-500 hover:text-gray-900 font-500 hover:underline"
                        >
                          Chi tiết
                        </button>
                        {userLevel >= 3 && (
                          <button
                            onClick={() => setModal({ type: "edit", data: emp })}
                            className="text-xs text-gray-500 hover:text-gray-900 font-500 hover:underline"
                          >
                            Sửa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-50">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>

      {/* Modals */}
      <EmployeeModal
        isOpen={modal.type === "add" || modal.type === "edit"}
        onClose={() => setModal({ type: "", data: null })}
        editData={modal.type === "edit" ? modal.data : null}
        departments={departments}
        onSuccess={fetchEmployees}
      />
      <DetailModal
        isOpen={modal.type === "detail"}
        onClose={() => setModal({ type: "", data: null })}
        employeeId={modal.data}
      />
    </div>
  );
};

export default EmployeesPage;
