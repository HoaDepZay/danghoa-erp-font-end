import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, Save, ChevronDown, ChevronUp, Users, CheckSquare } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "../../utils/helpers";
import { CREATE_PROJECT_INITIAL_FORM, buildCreateProjectModel } from "../../utils/projectModel";
import { Btn, Card, FormField, DatePicker, CustomSelect, Avatar } from "../../components/UI/index";
import { STATUS_OPTIONS } from "./useProjects";
import { ProjectIconPicker } from "../../components/ProjectIconPicker";

interface PhaseDraft {
  id: string;
  tenGd: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: string;
  members: { MA_NV: string; VAI_TRO: string; HO_TEN: string }[];
  tasks: { id: string; tenNhiemVu: string; maNv: string; moTa: string; ngayBatDau: string; ngayKetThuc: string; doUuTien: string; trangThai: string }[];
  isExpanded?: boolean;
}

const CreateProject: React.FC<any> = ({ onNavigate }) => {
  const [form, setForm] = useState({ ...CREATE_PROJECT_INITIAL_FORM });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [projectRoles, setProjectRoles] = useState<any[]>([]);
  
  // Project Members
  const [members, setMembers] = useState<{ MA_NV: string; MA_VAI_TRO: number; HO_TEN?: string; TEN_VAI_TRO?: string }[]>([]);
  const [addMember, setAddMember] = useState({ MA_NV: "", MA_VAI_TRO: 1 });

  // Phases
  const [phases, setPhases] = useState<PhaseDraft[]>([]);

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

  // --- Project Member Logic ---
  const handleAddProjectMember = () => {
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

  const handleRemoveProjectMember = (maNv: string) => {
    setMembers(members.filter(m => m.MA_NV !== maNv));
    // Dọn dẹp nhân sự này khỏi các phase nếu có
    setPhases(phases.map(p => ({
      ...p,
      members: p.members.filter(pm => pm.MA_NV !== maNv),
      tasks: p.tasks.filter(pt => pt.maNv !== maNv) // Hoặc set maNv về null, nhưng xoá cho an toàn
    })));
  };

  // --- Phase Logic ---
  const handleAddPhase = () => {
    setPhases([...phases, {
      id: Math.random().toString(36).substring(7),
      tenGd: "",
      ngayBatDau: form.NGAY_BAT_DAU || "",
      ngayKetThuc: form.NGAY_KET_THUC || "",
      trangThai: "Chưa bắt đầu",
      members: [],
      tasks: [],
      isExpanded: true
    }]);
  };

  const updatePhase = (phaseId: string, updates: Partial<PhaseDraft>) => {
    setPhases(phases.map(p => p.id === phaseId ? { ...p, ...updates } : p));
  };

  const removePhase = (phaseId: string) => {
    setPhases(phases.filter(p => p.id !== phaseId));
  };

  // Phase Member Logic
  const handleAddPhaseMember = (phaseId: string, maNv: string, vaiTro: string) => {
    if (!maNv) return toast.error("Vui lòng chọn nhân viên");
    const phase = phases.find(p => p.id === phaseId);
    if (phase?.members.find(m => m.MA_NV === maNv)) return toast.error("Nhân viên này đã có trong giai đoạn");
    
    const emp = members.find(m => m.MA_NV === maNv);
    if (!emp) return;

    updatePhase(phaseId, {
      members: [...(phase?.members || []), { MA_NV: maNv, VAI_TRO: vaiTro, HO_TEN: emp.HO_TEN || "" }]
    });
  };

  const handleRemovePhaseMember = (phaseId: string, maNv: string) => {
    const phase = phases.find(p => p.id === phaseId);
    if(!phase) return;
    updatePhase(phaseId, {
      members: phase.members.filter(m => m.MA_NV !== maNv),
      tasks: phase.tasks.filter(t => t.maNv !== maNv) // Xóa các task giao cho người này
    });
  };

  // Phase Task Logic
  const handleAddTask = (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;
    updatePhase(phaseId, {
      tasks: [...phase.tasks, {
        id: Math.random().toString(36).substring(7),
        tenNhiemVu: "",
        maNv: "",
        moTa: "",
        ngayBatDau: phase.ngayBatDau || "",
        ngayKetThuc: phase.ngayKetThuc || "",
        doUuTien: "Trung bình",
        trangThai: "Mới"
      }]
    });
  };

  const updateTask = (phaseId: string, taskId: string, updates: any) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;
    updatePhase(phaseId, {
      tasks: phase.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    });
  };

  const removeTask = (phaseId: string, taskId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;
    updatePhase(phaseId, {
      tasks: phase.tasks.filter(t => t.id !== taskId)
    });
  };

  // --- Submit ---
  const handleSubmit = async () => {
    const payload = buildCreateProjectModel(form);
    if (!payload.TEN_DA) return toast.error("Tên dự án không được trống");
    if (payload.NGAY_BAT_DAU && payload.NGAY_KET_THUC && payload.NGAY_BAT_DAU > payload.NGAY_KET_THUC) {
      return toast.error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
    }

    // Validate phases
    for (const p of phases) {
      if (!p.tenGd) return toast.error("Các giai đoạn phải có tên đầy đủ");
      for (const t of p.tasks) {
        if (!t.tenNhiemVu || !t.maNv) return toast.error(`Nhiệm vụ trong giai đoạn "${p.tenGd}" chưa điền đủ tên và người phụ trách`);
      }
    }

    setLoading(true);
    try {
      const fullPayload = {
        project: payload,
        members: members.map(m => ({ MA_NV: m.MA_NV, MA_VAI_TRO: m.MA_VAI_TRO })),
        phases: phases.map(p => ({
          tenGd: p.tenGd,
          ngayBatDau: p.ngayBatDau,
          ngayKetThuc: p.ngayKetThuc,
          trangThai: p.trangThai,
          members: p.members.map(pm => ({ MA_NV: pm.MA_NV, VAI_TRO: pm.VAI_TRO })),
          tasks: p.tasks.map(t => ({
            maNv: t.maNv,
            tenNhiemVu: t.tenNhiemVu,
            moTa: t.moTa,
            ngayBatDau: t.ngayBatDau,
            ngayKetThuc: t.ngayKetThuc,
            doUuTien: t.doUuTien,
            trangThai: t.trangThai,
            phanTramHoanThanh: 0
          }))
        }))
      };

      await api.createProjectFull(fullPayload);

      toast.success("Tạo dự án thành công!");
      if (onNavigate) onNavigate("projects");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi tạo dự án!");
      console.error(err);
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
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 14 }}>Thiết lập thông tin chung, giai đoạn và phân công nhân sự ngay từ đầu</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        
        {/* ROW 1: INFO & MEMBERS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 24 }}>
          {/* Thông tin chung */}
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

              <ProjectIconPicker 
                icon={form.ICON} 
                color={form.COLOR} 
                onIconChange={(icon) => setForm({ ...form, ICON: icon })}
                onColorChange={(color) => setForm({ ...form, COLOR: color })}
              />

            </div>
          </Card>

          {/* Phân công nhân sự */}
          <Card style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Phân công nhân sự dự án</h3>
            
            <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px dashed #cbd5e1", marginBottom: 20 }}>
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
                <Btn variant="secondary" onClick={handleAddProjectMember} icon={<Plus size={16} />} style={{ marginTop: 8, justifyContent: "center" }}>
                  Thêm vào dự án
                </Btn>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#1e293b" }}>Danh sách nhân sự ({members.length})</h4>
              {members.length === 0 ? (
                <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>Chưa có nhân sự nào được phân công vào Dự án.</p>
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
                      <Btn onClick={() => handleRemoveProjectMember(m.MA_NV)} style={{ color: "#ef4444", background: "#fee2e2", border: "none", cursor: "pointer", padding: 8, borderRadius: 8 }}>
                        <Trash2 size={14} />
                      </Btn>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ROW 2: PHASES */}
        <Card style={{ padding: 24, borderTop: "4px solid #111" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Thiết lập Giai đoạn & Nhiệm vụ</h3>
              <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0 0" }}>Bạn có thể tạo các giai đoạn, phân bổ nhân sự và giao task ngay tại đây.</p>
            </div>
            <Btn variant="primary" icon={<Plus size={16} />} onClick={handleAddPhase}>
              Thêm Giai đoạn
            </Btn>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {phases.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", background: "#f8fafc", borderRadius: 12, border: "2px dashed #e2e8f0" }}>
                <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 16px 0" }}>Dự án chưa có giai đoạn nào.</p>
                <Btn variant="secondary" onClick={handleAddPhase} icon={<Plus size={16}/>}>Thêm Giai đoạn đầu tiên</Btn>
              </div>
            ) : phases.map((phase, index) => (
              <div key={phase.id} style={{ border: "1px solid #cbd5e1", borderRadius: 12, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                {/* Phase Header - Accordion Toggle */}
                <div 
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#f8fafc", borderBottom: phase.isExpanded ? "1px solid #e2e8f0" : "none", cursor: "pointer", borderRadius: phase.isExpanded ? "12px 12px 0 0" : "12px" }}
                  onClick={() => updatePhase(phase.id, { isExpanded: !phase.isExpanded })}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 28, height: 28, background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: 14, fontWeight: 700 }}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{phase.tenGd || "Giai đoạn chưa đặt tên"}</h4>
                      <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>
                        {phase.members.length} nhân sự • {phase.tasks.length} nhiệm vụ
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={(e) => { e.stopPropagation(); removePhase(phase.id); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 8 }}>
                      <Trash2 size={16} />
                    </button>
                    {phase.isExpanded ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
                  </div>
                </div>

                {/* Phase Body */}
                {phase.isExpanded && (
                  <div style={{ padding: 20 }}>
                    {/* Phase Info */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                      <FormField label="Tên giai đoạn *">
                        <input className="form-input" placeholder="Ví dụ: Phân tích yêu cầu..." value={phase.tenGd} onChange={(e) => updatePhase(phase.id, { tenGd: e.target.value })} />
                      </FormField>
                      <FormField label="Trạng thái">
                        <CustomSelect 
                          className="form-input" value={phase.trangThai} onChange={(e: any) => updatePhase(phase.id, { trangThai: e.target.value })}
                          options={["Chưa bắt đầu", "Đang thực hiện", "Hoàn thành", "Tạm dừng"].map(s => ({label: s, value: s}))}
                        />
                      </FormField>
                      <FormField label="Từ ngày">
                        <DatePicker 
                          value={phase.ngayBatDau} 
                          onChange={(d: any) => updatePhase(phase.id, { ngayBatDau: d ? d.toLocaleDateString('en-CA') : "" })} 
                          minDate={form.NGAY_BAT_DAU ? new Date(form.NGAY_BAT_DAU) : undefined}
                          maxDate={form.NGAY_KET_THUC ? new Date(form.NGAY_KET_THUC) : undefined}
                        />
                      </FormField>
                      <FormField label="Đến ngày">
                        <DatePicker 
                          value={phase.ngayKetThuc} 
                          onChange={(d: any) => updatePhase(phase.id, { ngayKetThuc: d ? d.toLocaleDateString('en-CA') : "" })} 
                          minDate={phase.ngayBatDau ? new Date(phase.ngayBatDau) : (form.NGAY_BAT_DAU ? new Date(form.NGAY_BAT_DAU) : undefined)}
                          maxDate={form.NGAY_KET_THUC ? new Date(form.NGAY_KET_THUC) : undefined}
                        />
                      </FormField>
                    </div>

                    <hr style={{ border: 0, borderTop: "1px dashed #e2e8f0", margin: "0 0 24px 0" }} />

                    {/* Phase Members & Tasks */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, alignItems: "start" }}>
                      
                      {/* Left: Phase Members */}
                      <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                          <Users size={16} color="#3b82f6" />
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Nhân sự Giai đoạn</h4>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                          <CustomSelect
                            className="form-input"
                            value={""}
                            onChange={(e: any) => {
                               if(e.target.value) handleAddPhaseMember(phase.id, e.target.value, "Nhân viên");
                            }}
                            options={[
                              { label: "+ Chọn từ ds dự án", value: "" },
                              ...members.filter(m => !phase.members.find(pm => pm.MA_NV === m.MA_NV)).map(m => ({
                                label: m.HO_TEN || m.MA_NV,
                                value: m.MA_NV
                              }))
                            ]}
                          />
                        </div>

                        {phase.members.length === 0 ? (
                          <p style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Chưa có nhân sự nào trong giai đoạn này.</p>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {phase.members.map(pm => (
                              <div key={pm.MA_NV} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600 }}>{pm.HO_TEN}</div>
                                  <CustomSelect 
                                    variant="ghost"
                                    value={pm.VAI_TRO} 
                                    onChange={(e: any) => updatePhase(phase.id, { members: phase.members.map(m => m.MA_NV === pm.MA_NV ? { ...m, VAI_TRO: e.target.value } : m) })}
                                    style={{ width: "auto", fontSize: 12, color: "#3b82f6", fontWeight: 600, marginTop: 4 }}
                                    options={[
                                      { label: "Nhân viên", value: "Nhân viên" },
                                      { label: "Trưởng giai đoạn", value: "Trưởng giai đoạn" }
                                    ]}
                                  />
                                </div>
                                <button onClick={() => handleRemovePhaseMember(phase.id, pm.MA_NV)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={14} /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Tasks */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <CheckSquare size={16} color="#10b981" />
                            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Nhiệm vụ trong Giai đoạn</h4>
                          </div>
                          <Btn size="sm" variant="secondary" onClick={() => handleAddTask(phase.id)} icon={<Plus size={14} />}>Thêm Task</Btn>
                        </div>

                        {phase.tasks.length === 0 ? (
                          <div style={{ padding: 24, textAlign: "center", background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
                            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 12px 0" }}>Chưa có nhiệm vụ nào.</p>
                            <Btn size="sm" onClick={() => handleAddTask(phase.id)}>Thêm ngay</Btn>
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {phase.tasks.map((task, tIndex) => (
                              <div key={task.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                  <h5 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#64748b" }}>Nhiệm vụ {tIndex + 1}</h5>
                                  <button onClick={() => removeTask(phase.id, task.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={14}/></button>
                                </div>
                                
                                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>
                                  <FormField label="Tên nhiệm vụ *">
                                    <input className="form-input" placeholder="Tên việc..." value={task.tenNhiemVu} onChange={(e) => updateTask(phase.id, task.id, { tenNhiemVu: e.target.value })} />
                                  </FormField>
                                  <FormField label="Phụ trách *">
                                    <CustomSelect
                                      className="form-input"
                                      value={task.maNv}
                                      onChange={(e: any) => updateTask(phase.id, task.id, { maNv: e.target.value })}
                                      options={[
                                        { label: "-- Chọn --", value: "" },
                                        ...phase.members.map(m => ({ label: m.HO_TEN, value: m.MA_NV }))
                                      ]}
                                    />
                                  </FormField>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                                  <FormField label="Bắt đầu">
                                    <DatePicker 
                                      value={task.ngayBatDau} 
                                      onChange={(d: any) => updateTask(phase.id, task.id, { ngayBatDau: d ? d.toLocaleDateString('en-CA') : "" })} 
                                      minDate={phase.ngayBatDau ? new Date(phase.ngayBatDau) : (form.NGAY_BAT_DAU ? new Date(form.NGAY_BAT_DAU) : undefined)}
                                      maxDate={phase.ngayKetThuc ? new Date(phase.ngayKetThuc) : (form.NGAY_KET_THUC ? new Date(form.NGAY_KET_THUC) : undefined)}
                                    />
                                  </FormField>
                                  <FormField label="Kết thúc">
                                    <DatePicker 
                                      value={task.ngayKetThuc} 
                                      onChange={(d: any) => updateTask(phase.id, task.id, { ngayKetThuc: d ? d.toLocaleDateString('en-CA') : "" })} 
                                      minDate={task.ngayBatDau ? new Date(task.ngayBatDau) : (phase.ngayBatDau ? new Date(phase.ngayBatDau) : (form.NGAY_BAT_DAU ? new Date(form.NGAY_BAT_DAU) : undefined))}
                                      maxDate={phase.ngayKetThuc ? new Date(phase.ngayKetThuc) : (form.NGAY_KET_THUC ? new Date(form.NGAY_KET_THUC) : undefined)}
                                    />
                                  </FormField>
                                  <FormField label="Độ ưu tiên">
                                    <CustomSelect 
                                      className="form-input" value={task.doUuTien} onChange={(e: any) => updateTask(phase.id, task.id, { doUuTien: e.target.value })}
                                      options={["Thấp", "Trung bình", "Cao"].map(s => ({label: s, value: s}))}
                                    />
                                  </FormField>
                                </div>
                                <div style={{ marginTop: 12 }}>
                                  <FormField label="Mô tả">
                                    <textarea className="form-input" rows={1} value={task.moTa} onChange={(e) => updateTask(phase.id, task.id, { moTa: e.target.value })} style={{ resize: "none" }} />
                                  </FormField>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* FOOTER ACTIONS */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32, padding: "20px 0", borderTop: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="secondary" onClick={() => onNavigate && onNavigate("projects")}>Hủy bỏ</Btn>
          <Btn variant="primary" icon={<Save size={16} />} onClick={handleSubmit} loading={loading}>
            {phases.length > 0 ? "Lưu Dự án, Giai đoạn & Nhiệm vụ" : "Lưu và Tạo dự án"}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
