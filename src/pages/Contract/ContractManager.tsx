import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast, formatDate } from "../../utils/helpers";
import { AlertTriangle, FilePlus, X, Building2 } from "lucide-react";
import { Badge, Spinner, Card, Btn, FormField } from "../../components/UI/index";

const CONTRACT_TYPES = ["Thử việc", "1 năm", "3 năm", "Vô thời hạn"];

const ContractManager = ({ user }: { user: any }) => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMaNv, setSelectedMaNv] = useState("");
  const [form, setForm] = useState({
    MA_NV: "", loaiHopDong: "Thử việc", tuNgay: "", denNgay: "",
    luongCoBan: "", ngayKy: "", ghiChu: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchContracts(); }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await api.getContracts();
      setContracts(res.data?.data || []);
    } catch {
      toast.error("Không thể lấy danh sách hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const openForm = (MA_NV = "") => {
    setSelectedMaNv(MA_NV);
    setForm({ MA_NV, loaiHopDong: "1 năm", tuNgay: "", denNgay: "", luongCoBan: "", ngayKy: "", ghiChu: "" });
    setShowForm(true);
  };

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.MA_NV || !form.tuNgay || !form.luongCoBan) {
      return toast.error("Vui lòng điền đầy đủ: Mã NV, Từ ngày, Lương cơ bản");
    }
    setSaving(true);
    try {
      await api.createContract({
        MA_NV: form.MA_NV, loaiHopDong: form.loaiHopDong,
        tuNgay: form.tuNgay, denNgay: form.denNgay || undefined,
        luongCoBan: Number(form.luongCoBan),
        ngayKy: form.ngayKy || undefined, ghiChu: form.ghiChu || undefined,
      });
      toast.success("Đã tạo hợp đồng thành công");
      setShowForm(false);
      fetchContracts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi tạo hợp đồng");
    } finally {
      setSaving(false);
    }
  };

  const urgencyColor = (days: number) => {
    if (days <= 7)  return "#ef4444";
    if (days <= 15) return "#f59e0b";
    return "#3b82f6";
  };

  return (
    <div className="contract-manager">
      <div className="section-header">
        <div>
          <h2>Quản lý Hợp đồng</h2>
          <p>Danh sách tất cả hợp đồng của nhân viên</p>
        </div>
        <div className="section-header-actions">
          <Btn variant="primary" onClick={() => openForm()} icon={<FilePlus size={16} />}>
            Tạo hợp đồng mới
          </Btn>
        </div>
      </div>

      <Card>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner size={28} /></div>
        ) : contracts.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <Building2 size={40} color="#e2e8f0" />
            <p style={{ color: "#94a3b8", marginTop: 12 }}>Không có hợp đồng nào trong hệ thống 🎉</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th>Phòng ban</th>
                  <th>Loại hợp đồng</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày hết hạn</th>
                  <th>Còn lại</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c: any) => {
                  const days = c.soNgayConLai ?? c.SoNgayConLai ?? c.songayconlai ?? 0;
                  const loai = c.LOAIHOPDONG || c.loaiHopDong || c.loaihopdong;
                  return (
                    <tr key={c.MAHD || c.maHd || c.mahd}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.TenNhanVien || c.tenNhanVien || c.tennhanvien}</div>
                        <small style={{ color: "#64748b" }}>{c.MANV || c.MA_NV || c.MA_NV}</small>
                      </td>
                      <td>{c.TENPB || c.tenPb || c.tenpb || "—"}</td>
                      <td>
                        <Badge color={loai === "Thử việc" ? "yellow" : "blue"}>
                          {loai}
                        </Badge>
                      </td>
                      <td>{formatDate(c.TUNGAY || c.tuNgay || c.tungay)}</td>
                      <td>{formatDate(c.DENNGAY || c.denNgay || c.denngay)}</td>
                      <td>
                        <span style={{
                          fontWeight: 700, fontSize: 14,
                          color: days > 10000 ? "#3b82f6" : urgencyColor(days),
                          display: "flex", alignItems: "center", gap: 4
                        }}>
                          {days > 10000 ? (
                            "Vô thời hạn"
                          ) : days < 0 ? (
                            <>
                              <AlertTriangle size={14} /> Đã hết hạn
                            </>
                          ) : (
                            <>
                              {days <= 7 && <AlertTriangle size={14} />}
                              {days} ngày
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <Btn variant="primary" onClick={() => openForm(c.MANV || c.MA_NV || c.MA_NV)} icon={<FilePlus size={14} />}>
                          Gia hạn / Ký mới
                        </Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Tạo Hợp Đồng */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tạo / Gia hạn hợp đồng</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FormField label="Mã nhân viên *">
                <input className="form-input" value={form.MA_NV} onChange={set("MA_NV")} placeholder="VD: NV001" />
              </FormField>
              <FormField label="Loại hợp đồng *">
                <select className="form-input" value={form.loaiHopDong} onChange={set("loaiHopDong")}>
                  {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>
              <FormField label="Ngày bắt đầu *">
                <input className="form-input" type="date" value={form.tuNgay} onChange={set("tuNgay")} />
              </FormField>
              <FormField label="Ngày hết hạn">
                <input className="form-input" type="date" value={form.denNgay} onChange={set("denNgay")}
                  placeholder="Bỏ trống nếu vô thời hạn" />
              </FormField>
              <FormField label="Lương cơ bản *">
                <input className="form-input" type="number" value={form.luongCoBan} onChange={set("luongCoBan")} placeholder="VD: 10000000" />
              </FormField>
              <FormField label="Ngày ký">
                <input className="form-input" type="date" value={form.ngayKy} onChange={set("ngayKy")} />
              </FormField>
              <FormField label="Ghi chú" style={{ gridColumn: "1 / -1" }}>
                <textarea className="form-input" rows={3} value={form.ghiChu} onChange={set("ghiChu")} placeholder="Ghi chú thêm..." />
              </FormField>
            </div>
            <div className="modal-footer" style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <Btn variant="secondary" onClick={() => setShowForm(false)}>Hủy</Btn>
              <Btn variant="primary" loading={saving} onClick={handleSave}>Lưu hợp đồng</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManager;
