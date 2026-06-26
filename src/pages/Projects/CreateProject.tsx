import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "../../utils/helpers";
import {
  CREATE_PROJECT_INITIAL_FORM,
  buildCreateProjectModel,
} from "../../utils/projectModel";
import {
  Btn,
  Card,
  FormField,
  DatePicker,
  CustomSelect,
  Avatar,
} from "../../components/UI/index";
import { STATUS_OPTIONS } from "./useProjects";

const CreateProject: React.FC<any> = ({ onNavigate }) => {
  const [form, setForm] = useState({ ...CREATE_PROJECT_INITIAL_FORM });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [projectRoles, setProjectRoles] = useState<any[]>([]);
  const [members, setMembers] = useState<{ MA_NV: string; MA_VAI_TRO: number; HO_TEN?: string; TEN_VAI_TRO?: string }[]>([]);
  const [addMember, setAddMember] = useState({ MA_NV: "", MA_VAI_TRO: 1 });

  useEffect(() => {
    Promise.all([
      api.getEmployees({ pageSize: 1000 }),
      api.getProjectRoles()
    ]).then(([empRes, roleRes]) => {
      setEmployees(empRes.data?.data || []);
      setProjectRoles(roleRes.data?.data || []);
    }).catch((err) => {
      console.error("Lỗi lấy dữ liệu employees/roles:", err);
    });
  }, []);

  const set = (k: string) => (e: any) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleAddMember = () => {
    if (!addMember.MA_NV) return toast.error("Vui lòng chọn nhân viên");
    if (!addMember.MA_VAI_TRO) return toast.error("Vui lòng chọn vai trò");
    if (members.find(m => m.MA_NV === addMember.MA_NV)) {
      return toast.error("Nhân viên này đã được chọn");
    }
    const emp = employees.find(e => e.MA_NV === addMember.MA_NV);
    const role = projectRoles.find(r => r.MA_VAI_TRO === addMember.MA_VAI_TRO);
    
    setMembers([...members, {
      MA_NV: addMember.MA_NV,
      MA_VAI_TRO: addMember.MA_VAI_TRO,
      HO_TEN: emp?.HO_TEN || emp?.EMAIL,
      TEN_VAI_TRO: role?.TEN_VAI_TRO
    }]);
    setAddMember({ MA_NV: "", MA_VAI_TRO: 1 });
  };

  const handleRemoveMember = (maNv: string) => {
    setMembers(members.filter(m => m.MA_NV !== maNv));
  };

  const handleSubmit = async () => {
    const payload = buildCreateProjectModel(form);
    if (!payload.TEN_DA) return toast.error("Tên dự án không được trống");
    if (
      payload.NGAY_BAT_DAU &&
      payload.NGAY_KET_THUC &&
      payload.NGAY_BAT_DAU > payload.NGAY_KET_THUC
    ) {
      return toast.error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
    }

    setLoading(true);
    try {
      await api.createProject({
        ...payload,
        members: members.map(m => ({ MA_NV: m.MA_NV, MA_VAI_TRO: m.MA_VAI_TRO }))
      });
      toast.success("Tạo dự án thành công!");
      if (onNavigate) onNavigate("projects");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi tạo dự án!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ padding: "0 0 40px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Btn variant="secondary" onClick={() => onNavigate && onNavigate("projects")} icon={<ArrowLeft size={16} />} style={{ padding: "8px" }} />
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111", margin: 0 }}>Tạo dự án mới</h2>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 14 }}>Thiết lập thông tin chung và phân công nhân sự ngay từ đầu</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 24 }}>
        <Card style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Thông tin chung</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FormField label="Tên dự án *">
              <input
                className="form-input"
                placeholder="Nhập tên dự án..."
                value={form.TEN_DA}
                onChange={set("TEN_DA")}
              />
            </FormField>
            <FormField label="Mô tả dự án">
              <textarea
                className="form-input"
                rows={4}
                placeholder="Mô tả chi tiết mục tiêu, phạm vi dự án..."
                value={form.MO_TA}
                onChange={set("MO_TA")}
                style={{ resize: "none" }}
              />
            </FormField>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FormField label="Ngày bắt đầu">
                <DatePicker
                  value={form.NGAY_BAT_DAU}
                  onChange={(date: any) => setForm((f) => ({ ...f, NGAY_BAT_DAU: date ? date.toLocaleDateString('en-CA') : "" }))}
                />
              </FormField>
              <FormField label="Ngày kết thúc">
                <DatePicker
                  value={form.NGAY_KET_THUC}
                  onChange={(date: any) => setForm((f) => ({ ...f, NGAY_KET_THUC: date ? date.toLocaleDateString('en-CA') : "" }))}
                  minDate={form.NGAY_BAT_DAU ? new Date(form.NGAY_BAT_DAU) : undefined}
                />
              </FormField>
            </div>
            <FormField label="Trạng thái">
              <CustomSelect
                className="form-input"
                value={form.TRANG_THAI}
                onChange={set("TRANG_THAI")}
                options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))}
              />
            </FormField>
            <FormField>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: "#f8fafc", padding: "12px 16px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <input
                  type="checkbox"
                  checked={Boolean(form.CONG_KHAI)}
                  onChange={(e) => setForm((f) => ({ ...f, CONG_KHAI: e.target.checked }))}
                  style={{ width: 18, height: 18 }}
                />
                <div>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", display: "block" }}>Dự án công khai</span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Mọi người đều có thể xem tổng quan và nhiệm vụ</span>
                </div>
              </label>
            </FormField>
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Phân công nhân sự</h3>
          
          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px dashed #cbd5e1", marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#475569" }}>THÊM THÀNH VIÊN VÀO DỰ ÁN</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FormField label="Nhân viên">
                <CustomSelect
                  className="form-input"
                  value={addMember.MA_NV}
                  onChange={(e: any) => setAddMember({ ...addMember, MA_NV: e.target.value })}
                  options={[
                    { label: "-- Chọn nhân viên --", value: "" },
                    ...employees.map((emp: any) => ({
                      label: emp.HO_TEN || emp.EMAIL || emp.MA_NV,
                      value: emp.MA_NV,
                    })),
                  ]}
                />
              </FormField>
              <FormField label="Vai trò">
                <CustomSelect
                  className="form-input"
                  value={addMember.MA_VAI_TRO}
                  onChange={(e: any) => setAddMember({ ...addMember, MA_VAI_TRO: Number(e.target.value) })}
                  options={projectRoles?.map((r: any) => ({ label: r.TEN_VAI_TRO, value: r.MA_VAI_TRO })) || []}
                />
              </FormField>
              <Btn variant="secondary" onClick={handleAddMember} icon={<Plus size={16} />} style={{ marginTop: 8, justifyContent: "center" }}>
                Thêm vào danh sách
              </Btn>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#1e293b" }}>Danh sách phân công ({members.length})</h4>
            {members.length === 0 ? (
              <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>Chưa có thành viên nào được thêm.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 300, overflowY: "auto", paddingRight: 4 }}>
                {members.map(m => (
                  <div key={m.MA_NV} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar name={m.HO_TEN || m.MA_NV} size="sm" />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#0f172a" }}>{m.HO_TEN}</p>
                        <p style={{ fontSize: 12, color: "#3b82f6", margin: 0, fontWeight: 500 }}>{m.TEN_VAI_TRO}</p>
                      </div>
                    </div>
                    <Btn onClick={() => handleRemoveMember(m.MA_NV)} style={{ color: "#ef4444", background: "#fee2e2", border: "none", cursor: "pointer", padding: 8, borderRadius: 8 }}>
                      <Trash2 size={14} />
                    </Btn>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, padding: "20px 0", borderTop: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="secondary" onClick={() => onNavigate && onNavigate("projects")}>Hủy bỏ</Btn>
          <Btn variant="primary" icon={<Save size={16} />} onClick={handleSubmit} loading={loading}>Lưu và Tạo dự án</Btn>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
