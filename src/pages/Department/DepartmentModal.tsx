import React, { useState, useEffect, useCallback } from "react";
import { Building2, UserPlus, Trash2, MessageSquare } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "../../utils/helpers";
import { Btn, FormField, Avatar, Spinner, Drawer } from "../../components/UI/index";
import { formatDate } from "../../utils/helpers";

// ─── Modal Tạo / Sửa phòng ban ───────────────────────────────────────────────
interface DeptModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  employees: any[];
  onSuccess: () => void;
}

export const DeptModal: React.FC<DeptModalProps> = ({
  isOpen,
  onClose,
  editData,
  employees,
  onSuccess,
}) => {
  const isEdit = !!editData;
  const [form, setForm] = useState({ tenpb: "", matruongphg: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(
      editData
        ? {
            tenpb: editData.tenpb || "",
            matruongphg: editData.matruongphg || "",
          }
        : { tenpb: "", matruongphg: "" }
    );
  }, [editData, isOpen]);

  const handleSubmit = async () => {
    if (!form.tenpb.trim()) return toast.error("Tên phòng ban không được trống");
    setLoading(true);
    try {
      const payload: any = {
        tenpb: form.tenpb.trim(),
        matruongphg: form.matruongphg || undefined,
      };
      if (isEdit) {
        await api.updateDepartment(editData.maphg, payload);
        toast.success("Cập nhật phòng ban thành công!");
      } else {
        await api.createDepartment(payload);
        toast.success("Tạo phòng ban thành công!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Lỗi thao tác!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
      subtitle={isEdit ? `Mã: ${editData?.maphg}` : "Tạo đơn vị tổ chức mới"}
      icon={<Building2 size={18} />}
      size="sm"
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>Hủy</Btn>
          <Btn loading={loading} onClick={handleSubmit}>{isEdit ? "Lưu" : "Thêm"}</Btn>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FormField label="Tên phòng ban *">
          <input
            className="form-input"
            placeholder="VD: Phòng Kỹ thuật"
            value={form.tenpb}
            onChange={(e) => setForm((f) => ({ ...f, tenpb: e.target.value }))}
          />
        </FormField>
        <FormField label="Trưởng phòng">
          <select
            className="form-input"
            value={form.matruongphg}
            onChange={(e) => setForm((f) => ({ ...f, matruongphg: e.target.value }))}
          >
            <option value="">— Chưa chọn —</option>
            {employees.map((emp) => (
              <option key={emp.manv} value={emp.manv}>
                {emp.hoten} ({emp.manv})
              </option>
            ))}
          </select>
        </FormField>
      </div>
    </Drawer>
  );
};

// ─── Modal Chi tiết phòng ban (có thêm/xóa thành viên) ────────────────────────
interface DeptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deptId: string | number | null;
  allEmployees: any[];   // toàn bộ NV để chọn thêm
  isAdmin: boolean;
  onRefresh: () => void;
  onNavigate?: (page: string) => void;
  user?: any;
}

export const DeptDetailModal: React.FC<DeptDetailModalProps> = ({
  isOpen,
  onClose,
  deptId,
  allEmployees,
  isAdmin,
  onRefresh,
  onNavigate,
  user: _user,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [addManv, setAddManv] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!deptId) return;

    setLoading(true);
    try {
      const r = await api.getDepartment(deptId);
      const roomData = r.data?.data ?? r.data;
      console.log(`Loading Department Detail for Room ID: ${deptId}`, roomData);
      setData(roomData);
    } catch {
      toast.error("Không thể tải chi tiết phòng ban");
    } finally {
      setLoading(false);
    }
  }, [deptId]);

  useEffect(() => {
    if (isOpen) fetchDetail();
    else setData(null);
  }, [isOpen, fetchDetail]);

  const handleChat = async () => {
    if (!deptId) return;
    try {
      const res = await api.getDepartmentChatRoom(deptId);
      const room = res.data?.data || res.data;
      
      const roomIdValue = room?.maPhong || room?.maphong || room?.id;
      if (room && roomIdValue) {
        localStorage.setItem("pendingChatRoomId", String(roomIdValue));
        if (onNavigate) {
          onNavigate("chat");
          onClose();
        }
      } else {
        toast.error("Không tìm thấy phòng chat cho phòng ban này!");
      }
    } catch (err: any) {
      toast.error("Phòng ban này chưa có phòng chat hoặc lỗi kết nối!");
    }
  };

  const handleAddMember = async () => {
    if (!addManv) return toast.error("Vui lòng chọn nhân viên!");
    setAddingMember(true);
    try {
      await api.updateEmployee(addManv, { maphg: deptId });
      toast.success("Thêm thành viên thành công!");
      setAddManv("");
      fetchDetail();
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi thêm thành viên!");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (manv: string) => {
    if (!window.confirm("Xác nhận gỡ nhân viên này khỏi phòng ban?")) return;
    try {
      await api.updateEmployee(manv, { maphg: null });
      toast.success("Đã gỡ nhân viên!");
      fetchDetail();
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi gỡ thành viên!");
    }
  };

  // Lọc danh sách nhân viên thuộc phòng ban này từ allEmployees dựa trên deptId
  const members = allEmployees.filter((emp: any) => {
    const empDeptId = emp.maphg || emp.maphong;
    return empDeptId && deptId && String(empDeptId).trim().toUpperCase() === String(deptId).trim().toUpperCase();
  });

  // Tìm trưởng phòng tương ứng trong danh sách nhân viên
  const truongPhongEmp = allEmployees.find((emp: any) => {
    const empId = emp.manv;
    const leaderId = data?.matruongphg;
    return empId && leaderId && String(empId).trim().toUpperCase() === String(leaderId).trim().toUpperCase();
  });
  const truongPhong = truongPhongEmp 
    ? truongPhongEmp.hoten 
    : (data?.tenTruongPhong || "");

  // Danh sách NV chưa thuộc phòng này (để chọn thêm)
  const memberIds = new Set(members.map((m: any) => m.manv));
  const availableEmployees = allEmployees.filter(
    (e) => !memberIds.has(e.manv)
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={data ? (data.tenpb || "Chi tiết phòng ban") : "Chi tiết phòng ban"}
      subtitle={data ? `Mã phòng: ${data.maphg} · ${members.length} thành viên` : undefined}
      icon={<Building2 size={18} />}
      size="lg"
      footer={<Btn variant="secondary" onClick={onClose}>Đóng</Btn>}
    >
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
          <Spinner size={28} />
        </div>
      ) : data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── Header ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, background: "#111", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building2 size={22} color="#fff" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>{data.tenpb}</p>
                <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>Mã: {data.maphg}</p>
                {data.ngthanhlap && (
                  <p style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0" }}>
                    Thành lập: {formatDate(data.ngthanhlap)}
                  </p>
                )}
              </div>
            </div>
            <Btn size="sm" variant="secondary" icon={<MessageSquare size={14} />} onClick={handleChat}>
              Nhắn tin nhóm
            </Btn>
          </div>

          {/* ── Trưởng phòng ── */}
          {truongPhong && (
            <div>
              <p style={{ fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Trưởng phòng
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f8f8f8", borderRadius: 12, padding: "10px 14px" }}>
                <Avatar name={truongPhong} size="sm" />
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{truongPhong}</span>
                  {data.matruongphg && (
                    <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{data.matruongphg}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Danh sách thành viên ── */}
          <div>
            <p style={{ fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Thành viên ({members.length} người)
            </p>

            {members.length === 0 ? (
              <p style={{ fontSize: 13, color: "#aaa", textAlign: "center", padding: "16px 0" }}>
                Chưa có thành viên trong phòng ban
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                {members.map((nv: any) => {
                  const manv = nv.manv;
                  const hoten = nv.hoten;
                  const chucvu = nv.chucvu;
                  return (
                    <div
                      key={manv}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        background: "#f8f8f8",
                        borderRadius: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={hoten} size="sm" />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{hoten}</p>
                          <p style={{ fontSize: 11, color: "#999", margin: 0 }}>
                            {chucvu} · {manv}
                          </p>
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                           onClick={() => handleRemoveMember(manv)}
                          title="Gỡ khỏi phòng ban"
                          style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, transition: "background 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Thêm thành viên (chỉ admin) ── */}
          {isAdmin && (
            <div style={{ borderTop: "1px solid #ebebeb", paddingTop: 16 }}>
              <p style={{ fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Thêm thành viên vào phòng ban
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <select
                  className="form-input"
                  value={addManv}
                  onChange={(e) => setAddManv(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">— Chọn nhân viên —</option>
                  {availableEmployees.map((emp) => {
                    const id = emp.manv;
                    const name = emp.hoten;
                    return (
                      <option key={id} value={id}>
                        {name} ({id})
                      </option>
                    );
                  })}
                </select>
                <Btn
                  loading={addingMember}
                  size="sm"
                  icon={<UserPlus size={14} />}
                  onClick={handleAddMember}
                >
                  Thêm
                </Btn>
              </div>
              {availableEmployees.length === 0 && (
                <p style={{ fontSize: 11, color: "#aaa", marginTop: 8 }}>
                  Tất cả nhân viên đã thuộc phòng ban này
                </p>
              )}
            </div>
          )}

        </div>
      ) : null}
    </Drawer>
  );
};
