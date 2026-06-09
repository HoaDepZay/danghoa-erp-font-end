import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast, formatDate } from "../../utils/helpers";
import { FileText, X, Plus, CalendarDays, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Spinner } from "../../components/UI";
import { getManv } from "../../utils/user";

interface LeaveRequestProps {
  user: any;
}

const STATUS_COLOR: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  "Chờ duyệt":          { bg: "#fef9c3", text: "#92400e", icon: <Clock size={13} /> },
  "Chờ duyệt (Cấp 2)":  { bg: "#dbeafe", text: "#1e40af", icon: <Clock size={13} /> },
  "Đã duyệt":           { bg: "#dcfce7", text: "#166534", icon: <CheckCircle size={13} /> },
  "Từ chối":            { bg: "#fee2e2", text: "#991b1b", icon: <AlertCircle size={13} /> },
};

const LeaveRequest = ({ user }: LeaveRequestProps) => {
  const [myLeaves, setMyLeaves] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tuNgay: "", denNgay: "", lyDo: "", maLoaiNghi: "" });
  const [saving, setSaving]     = useState(false);

  useEffect(() => { fetchMyLeaves(); fetchLeaveTypes(); }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.getLeaveTypes();
      setLeaveTypes(res.data?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.getMyLeaves();
      setMyLeaves(res.data?.data || []);
    } catch {
      toast.error("Không thể tải danh sách đơn nghỉ phép");
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tuNgay || !form.denNgay || !form.lyDo.trim() || !form.maLoaiNghi) {
      return toast.error("Vui lòng điền đầy đủ ngày, lý do và loại nghỉ phép");
    }
    if (new Date(form.denNgay) < new Date(form.tuNgay)) {
      return toast.error("Ngày kết thúc phải sau ngày bắt đầu");
    }
    setSaving(true);
    try {
      const res = await api.submitLeave({
        tuNgay: form.tuNgay,
        denNgay: form.denNgay,
        lyDo: form.lyDo.trim(),
        maLoaiNghi: form.maLoaiNghi,
      });
      toast.success(res.data?.message || "Nộp đơn thành công!");
      setShowForm(false);
      setForm({ tuNgay: "", denNgay: "", lyDo: "", maLoaiNghi: "" });
      fetchMyLeaves();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi nộp đơn");
    } finally {
      setSaving(false);
    }
  };

  const countDays = () => {
    if (!form.tuNgay || !form.denNgay) return 0;
    const diff = new Date(form.denNgay).getTime() - new Date(form.tuNgay).getTime();
    return Math.max(0, Math.ceil(diff / 86400000) + 1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h2>Đơn nghỉ phép của tôi</h2>
          <p>Xem lịch sử và nộp đơn nghỉ phép mới</p>
        </div>
        <div className="section-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={16} /> Nộp đơn nghỉ phép
          </button>
        </div>
      </div>

      {/* Leave list */}
      <div className="card">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Spinner size={28} />
          </div>
        ) : myLeaves.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <CalendarDays size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>Bạn chưa có đơn nghỉ phép nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Từ ngày</th>
                  <th>Đến ngày</th>
                  <th>Số ngày</th>
                  <th>Loại nghỉ phép</th>
                  <th>Lý do</th>
                  <th>Trạng thái</th>
                  <th>Lý do từ chối</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((leave: any) => {
                  const tu  = leave.TUNGAY  || leave.tuNgay || leave.tungay;
                  const den = leave.DENNGAY || leave.denNgay || leave.denngay;
                  const status = leave.TRANGTHAIDUYET || leave.trangThaiDuyet || leave.trangthaiduyet || "Chờ duyệt";
                  const style = STATUS_COLOR[status] || STATUS_COLOR["Chờ duyệt"];
                  const days = tu && den
                    ? Math.ceil((new Date(den).getTime() - new Date(tu).getTime()) / 86400000) + 1
                    : "—";
                  return (
                    <tr key={leave.MADON || leave.maDon}>
                      <td>{formatDate(tu)}</td>
                      <td>{formatDate(den)}</td>
                      <td><b>{days}</b> ngày</td>
                      <td>{leave.TenLoaiNghi || leave.tenLoaiNghi || leave.tenloainghi || "Khác"}</td>
                      <td style={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {leave.LYDO || leave.lyDo || leave.lydo || "—"}
                      </td>
                      <td>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          background: style.bg, color: style.text,
                          borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 600,
                        }}>
                          {style.icon} {status}
                        </span>
                      </td>
                      <td style={{ color: "#ef4444", fontSize: 12 }}>
                        {leave.LyDoTuChoi || leave.lyDoTuChoi || leave.lydotuchoi || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal nộp đơn */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#22c55e" }}>
                  <FileText size={18} />
                </div>
                <h3>Nộp đơn xin nghỉ phép</h3>
              </div>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, padding: "20px 0 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Từ ngày *</label>
                  <input className="form-input" type="date" value={form.tuNgay} onChange={set("tuNgay")}
                    min={new Date().toISOString().split("T")[0]} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Đến ngày *</label>
                  <input className="form-input" type="date" value={form.denNgay} onChange={set("denNgay")}
                    min={form.tuNgay || new Date().toISOString().split("T")[0]} required />
                </div>
              </div>

              {form.tuNgay && form.denNgay && (
                <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
                  <CalendarDays size={16} />
                  Tổng <b style={{ marginLeft: 2 }}>{countDays()} ngày</b> nghỉ phép
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Loại nghỉ phép *</label>
                <select className="form-input" value={form.maLoaiNghi} onChange={set("maLoaiNghi")} required>
                  <option value="">-- Chọn loại nghỉ phép --</option>
                  {leaveTypes.map(t => (
                    <option key={t.MA_LOAI_NGHI || t.MALOAINGHI || t.maLoaiNghi || t.maloainghi} value={t.MA_LOAI_NGHI || t.MALOAINGHI || t.maLoaiNghi || t.maloainghi}>{t.TEN_LOAI_NGHI || t.TENLOAINGHI || t.tenLoaiNghi || t.tenloainghi}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Lý do chi tiết *</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={form.lyDo}
                  onChange={set("lyDo")}
                  placeholder="Mô tả lý do xin nghỉ phép..."
                  required
                />
              </div>

              <div className="modal-footer" style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {saving ? <Spinner size={14} /> : <FileText size={14} />}
                  {saving ? "Đang gửi..." : "Nộp đơn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequest;
