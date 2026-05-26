import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { getManv, getUserLevel } from "../utils/user";
import { toast, formatDate, getProp } from "../utils/helpers";
import { Btn, Badge, Spinner, Card } from "./UI/index";

export const ProjectTimesheet = ({ projectId, user }: { projectId: number; user: any }) => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  
  const [form, setForm] = useState({ ngay: "", soGioLam: "", noiDungCongViec: "" });
  const [logLoading, setLogLoading] = useState(false);

  const isAdmin = getUserLevel(user) >= 2;
  const manv = getManv(user);

  useEffect(() => {
    fetchTimesheets();
  }, [projectId]);

  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const res = await api.getProjectTimesheets(projectId);
      setTimesheets(res.data?.data || []);
    } catch {
      toast.error("Lỗi tải timesheet!");
    } finally {
      setLoading(false);
    }
  };

  const handleLogTime = async () => {
    if (!form.ngay || !form.soGioLam) return toast.error("Vui lòng nhập ngày và số giờ");
    setLogLoading(true);
    try {
      await api.logTimesheet({ maNv: manv, maDa: projectId, ...form });
      toast.success("Đã log giờ thành công");
      setShowLogForm(false);
      setForm({ ngay: "", soGioLam: "", noiDungCongViec: "" });
      fetchTimesheets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi lưu timesheet");
    } finally {
      setLogLoading(false);
    }
  };

  const handleApprove = async (id: number, status: string) => {
    try {
      await api.approveTimesheet(id, { trangThai: status, nguoiDuyet: manv });
      toast.success("Đã cập nhật trạng thái");
      fetchTimesheets();
    } catch {
      toast.error("Lỗi duyệt timesheet");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Nhật ký làm việc (Timesheet)</h4>
        <Btn size="sm" onClick={() => setShowLogForm(!showLogForm)}>{showLogForm ? "Đóng" : "Log giờ"}</Btn>
      </div>

      {showLogForm && (
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#888" }}>Ngày làm việc</label>
              <input type="date" className="form-input" value={form.ngay} onChange={e => setForm({...form, ngay: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#888" }}>Số giờ (Ví dụ: 2.5)</label>
              <input type="number" step="0.5" className="form-input" value={form.soGioLam} onChange={e => setForm({...form, soGioLam: e.target.value})} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#888" }}>Nội dung công việc</label>
            <input type="text" className="form-input" value={form.noiDungCongViec} onChange={e => setForm({...form, noiDungCongViec: e.target.value})} placeholder="Đã làm tính năng X..." />
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={handleLogTime} disabled={logLoading}>Lưu lại</Btn>
          </div>
        </Card>
      )}

      {loading ? <Spinner /> : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Ngày</th>
              <th>Số giờ</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              {isAdmin && <th>Duyệt</th>}
            </tr>
          </thead>
          <tbody>
            {timesheets.map((t: any) => {
              const id = getProp(t, 'id');
              const ten = getProp(t, 'hoten');
              const ngay = getProp(t, 'ngay');
              const soGio = getProp(t, 'sogiolam');
              const noiDung = getProp(t, 'noidungcongviec');
              const trangThai = getProp(t, 'trangthai');
              
              return (
                <tr key={id}>
                  <td style={{ fontWeight: 600 }}>{ten}</td>
                  <td>{formatDate(ngay)}</td>
                  <td>{soGio}h</td>
                  <td>{noiDung}</td>
                  <td>
                    <Badge color={trangThai === "Đã duyệt" ? "green" : trangThai === "Từ chối" ? "red" : "yellow"}>
                      {trangThai}
                    </Badge>
                  </td>
                  {isAdmin && (
                    <td>
                      {trangThai === "Chờ duyệt" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <Btn size="sm" variant="primary" onClick={() => handleApprove(id, "Đã duyệt")}>Duyệt</Btn>
                          <Btn size="sm" variant="danger" onClick={() => handleApprove(id, "Từ chối")}>Từ chối</Btn>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default ProjectTimesheet;
