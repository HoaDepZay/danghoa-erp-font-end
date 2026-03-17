import { useState, useEffect, useCallback } from "react";
import { FolderKanban, Plus, Trash2, UserPlus, User, Clock } from "lucide-react";
import { api } from "../services/api";
import { toast, formatDate } from "../utils/helpers";
import { getManv, toArray, getUserLevel } from "../utils/user";
import {
  Btn, Badge, Card, SectionHeader, EmptyState, Avatar, Spinner, FormField,
} from "../components/UI/index";
import Modal from "../components/UI/Modal";

const STATUS_COLOR = { "Đang thực hiện": "blue", "Hoàn thành": "green", "Tạm dừng": "yellow", "Hủy": "red" };

// ── Create Project Modal ──────────────────────────────────────────────────────
const CreateProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({ TenDA: "", MoTa: "", NgayBatDau: "", NgayKetThuc: "", TrangThai: "Đang thực hiện" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setForm({ TenDA: "", MoTa: "", NgayBatDau: "", NgayKetThuc: "", TrangThai: "Đang thực hiện" });
  }, [isOpen]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.TenDA.trim()) return toast.error("Tên dự án không được trống");
    setLoading(true);
    try {
      await api.createProject(form);
      toast.success("Tạo dự án thành công!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi tạo dự án!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo dự án mới"
      footer={<><Btn variant="secondary" onClick={onClose}>Hủy</Btn><Btn loading={loading} onClick={handleSubmit}>Tạo dự án</Btn></>}>
      <div className="space-y-4">
        <FormField label="Tên dự án *">
          <input className="form-input" placeholder="Tên dự án..." value={form.TenDA} onChange={set("TenDA")} />
        </FormField>
        <FormField label="Mô tả">
          <textarea className="form-input resize-none" rows={3} placeholder="Mô tả dự án..." value={form.MoTa} onChange={set("MoTa")} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ngày bắt đầu">
            <input className="form-input" type="date" value={form.NgayBatDau} onChange={set("NgayBatDau")} />
          </FormField>
          <FormField label="Ngày kết thúc">
            <input className="form-input" type="date" value={form.NgayKetThuc} onChange={set("NgayKetThuc")} />
          </FormField>
        </div>
        <FormField label="Trạng thái">
          <select className="form-input" value={form.TrangThai} onChange={set("TrangThai")}>
            <option>Đang thực hiện</option>
            <option>Hoàn thành</option>
            <option>Tạm dừng</option>
            <option>Hủy</option>
          </select>
        </FormField>
      </div>
    </Modal>
  );
};

// ── Project Detail Modal ──────────────────────────────────────────────────────
const ProjectDetailModal = ({ isOpen, onClose, projectId, employees, userLevel, onRefresh }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addMember, setAddMember] = useState({ MaNV: "", VaiTroDuAn: "Thành viên", ThoiGian: "" });
  const [addingMember, setAddingMember] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await api.getProject(projectId);
      setData(res.data);
    } catch {
      toast.error("Không thể tải chi tiết dự án");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen) fetchDetail();
  }, [isOpen, fetchDetail]);

  const handleAddMember = async () => {
    if (!addMember.MaNV) return toast.error("Chọn nhân viên!");
    setAddingMember(true);
    try {
      await api.addProjectMember(projectId, addMember);
      toast.success("Phân công thành công!");
      setAddMember({ MaNV: "", VaiTroDuAn: "Thành viên", ThoiGian: "" });
      fetchDetail();
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi phân công!");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (empId) => {
    if (!window.confirm("Xác nhận gỡ nhân viên này khỏi dự án?")) return;
    try {
      await api.removeProjectMember(projectId, empId);
      toast.success("Đã gỡ nhân viên!");
      fetchDetail();
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi!");
    }
  };

  const project = data?.project || data;
  const members = data?.members || data?.ThanhVien || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết dự án" size="lg"
      footer={<Btn variant="secondary" onClick={onClose}>Đóng</Btn>}>
      {loading ? (
        <div className="flex justify-center py-10"><Spinner size={28} className="text-gray-400" /></div>
      ) : project ? (
        <div className="space-y-6">
          {/* Project info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between">
              <h4 className="font-700 text-lg">{project.TENDA || project.TenDA}</h4>
              <Badge color={STATUS_COLOR[project.TRANGTHAI || project.TrangThai] || "gray"}>
                {project.TRANGTHAI || project.TrangThai || "Đang thực hiện"}
              </Badge>
            </div>
            {project.MOTA && <p className="text-sm text-gray-500">{project.MOTA}</p>}
            <div className="flex gap-4 text-xs text-gray-400 mt-2">
              {project.NGAYBATDAU && <span>Bắt đầu: {formatDate(project.NGAYBATDAU)}</span>}
              {project.NGAYKETTHUC && <span>Kết thúc: {formatDate(project.NGAYKETTHUC)}</span>}
            </div>
          </div>

          {/* Members */}
          <div>
            <p className="text-xs text-gray-500 font-600 uppercase tracking-wider mb-3">
              Thành viên tham gia ({members.length} người)
            </p>
            {members.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Chưa có thành viên</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {members.map((m) => (
                  <div key={m.MANV || m.MaNV} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.HOTEN || m.HoTen} size="sm" />
                      <div>
                        <p className="text-sm font-600">{m.HOTEN || m.HoTen}</p>
                        <p className="text-xs text-gray-400">{m.VaiTroDuAn || "Thành viên"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {(m.ThoiGian || m.THOIGIAN) && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={12} />{m.ThoiGian || m.THOIGIAN}h
                        </span>
                      )}
                      {userLevel >= 3 && (
                        <button
                          onClick={() => handleRemoveMember(m.MANV || m.MaNV)}
                          className="text-red-400 hover:text-red-600 p-1 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add member form */}
          {userLevel >= 3 && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 font-600 uppercase tracking-wider mb-3">Phân công nhân viên</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <select
                    className="form-input"
                    value={addMember.MaNV}
                    onChange={(e) => setAddMember((f) => ({ ...f, MaNV: e.target.value }))}
                  >
                    <option value="">— Chọn nhân viên —</option>
                    {employees.map((emp) => (
                      <option key={emp.MANV || emp.MaNV} value={emp.MANV || emp.MaNV}>
                        {emp.HOTEN || emp.HoTen}
                      </option>
                    ))}
                  </select>
                </div>
                <select
                  className="form-input"
                  value={addMember.VaiTroDuAn}
                  onChange={(e) => setAddMember((f) => ({ ...f, VaiTroDuAn: e.target.value }))}
                >
                  <option>Thành viên</option>
                  <option>Trưởng dự án</option>
                  <option>Kỹ thuật</option>
                  <option>Thiết kế</option>
                  <option>Kiểm thử</option>
                </select>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Giờ làm"
                  value={addMember.ThoiGian}
                  onChange={(e) => setAddMember((f) => ({ ...f, ThoiGian: e.target.value }))}
                />
                <div className="col-span-3">
                  <Btn
                    loading={addingMember}
                    size="sm"
                    icon={<UserPlus size={15} />}
                    onClick={handleAddMember}
                    className="w-full justify-center"
                  >
                    Phân công
                  </Btn>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const ProjectsPage = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ type: "", data: null });
  const [viewMode, setViewMode] = useState("all"); // all | mine

  const ROLE_LEVELS = { "Cộng tác viên": 1, "Nhân viên": 2, "Quản lý": 3, "Admin": 4 };
  const userLevel = ROLE_LEVELS[user?.chuc_vu] || 1;
  const manv = getManv(user);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
        const [allRes, myRes] = await Promise.allSettled([
          userLevel >= 2 ? api.getProjects() : null,
          api.getMyProjects(manv),
        ]);
        if (allRes.status === "fulfilled" && allRes.value) {
          setProjects(toArray(allRes.value.data));
        }
        if (myRes.status === "fulfilled") {
          setMyProjects(toArray(myRes.value.data));
        }
    } catch {
      toast.error("Không thể tải dự án!");
    } finally {
      setLoading(false);
    }
  }, [manv, userLevel]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => {
    api.getEmployees({ pageSize: 200 })
      .then((r) => setEmployees(r.data?.data || r.data?.employees || r.data || []))
      .catch(() => {});
  }, []);

  const displayList = viewMode === "mine" ? myProjects : projects;

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Dự án"
        subtitle={`${displayList.length} dự án`}
        actions={
          <>
            {userLevel >= 2 && (
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setViewMode("mine")}
                  className={`px-3 py-1.5 text-xs font-600 transition-colors ${viewMode === "mine" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  Của tôi
                </button>
                <button
                  onClick={() => setViewMode("all")}
                  className={`px-3 py-1.5 text-xs font-600 transition-colors ${viewMode === "all" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  Tất cả
                </button>
              </div>
            )}
            {userLevel >= 3 && (
              <Btn size="sm" icon={<Plus size={15} />} onClick={() => setModal({ type: "create", data: null })}>
                Tạo dự án
              </Btn>
            )}
          </>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i}>
              <div className="skeleton h-5 w-3/4 mb-3 rounded" />
              <div className="skeleton h-4 w-full mb-2 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
            </Card>
          ))}
        </div>
      ) : displayList.length === 0 ? (
        <Card>
          <EmptyState icon={<FolderKanban size={48} />} title="Chưa có dự án" description="Tạo dự án đầu tiên cho nhóm" />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayList.map((p) => (
            <Card
              key={p.MADA || p.MaDA}
              className="hover:shadow-md transition-all cursor-pointer group"
              onClick={() => setModal({ type: "detail", data: p.MADA || p.MaDA })}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FolderKanban size={18} className="text-white" />
                </div>
                <Badge color={STATUS_COLOR[p.TRANGTHAI || p.TrangThai] || "gray"}>
                  {p.TRANGTHAI || p.TrangThai || "Đang thực hiện"}
                </Badge>
              </div>

              <h4 className="font-700 text-gray-900 mb-1">{p.TENDA || p.TenDA}</h4>
              {(p.MOTA || p.MoTa) && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.MOTA || p.MoTa}</p>
              )}

              {(p.VaiTroDuAn) && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                  <User size={12} />
                  <span>{p.VaiTroDuAn}</span>
                </div>
              )}

              {(p.THOIGIAN || p.ThoiGian) && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                  <Clock size={12} />
                  <span>{p.THOIGIAN || p.ThoiGian} giờ</span>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                {p.NGAYBATDAU && <span>{formatDate(p.NGAYBATDAU)}</span>}
                <span className="text-gray-400 group-hover:text-gray-600 transition-colors">Xem chi tiết →</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={modal.type === "create"}
        onClose={() => setModal({ type: "", data: null })}
        onSuccess={fetchProjects}
      />
      <ProjectDetailModal
        isOpen={modal.type === "detail"}
        onClose={() => setModal({ type: "", data: null })}
        projectId={modal.data}
        employees={employees}
        userLevel={userLevel}
        onRefresh={fetchProjects}
      />
    </div>
  );
};

export default ProjectsPage;
