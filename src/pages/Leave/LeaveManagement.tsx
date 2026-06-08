import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast, formatDate, getProp } from "../../utils/helpers";
import { CheckCircle2, XCircle, Search, Clock } from "lucide-react";
import { Btn, Badge, Spinner, Card } from "../../components/UI/index";

const LeaveManagement = ({ user }: { user: any }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.getLeaves();
      setLeaves(res.data?.data || []);
    } catch (error) {
      toast.error("Không thể lấy danh sách đơn nghỉ phép");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, currentStatus: string) => {
    try {
      const isLevel1 = currentStatus.includes("Chờ duyệt");
      const capDuyet = isLevel1 && !currentStatus.includes("Cấp 2") ? 1 : 2;
      await api.approveLeave({ maDon: id, capDuyet, TRANG_THAI: "Đã duyệt" });
      toast.success("Duyệt đơn thành công");
      fetchLeaves();
    } catch (error) {
      toast.error("Lỗi duyệt đơn");
    }
  };

  const openRejectModal = (id: number) => {
    setSelectedLeaveId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectReason) return toast.error("Vui lòng nhập lý do từ chối");
    try {
      await api.approveLeave({ maDon: selectedLeaveId, capDuyet: 1, TRANG_THAI: "Từ chối", lyDoTuChoi: rejectReason });
      toast.success("Đã từ chối đơn");
      setRejectModalOpen(false);
      fetchLeaves();
    } catch (error) {
      toast.error("Lỗi từ chối đơn");
    }
  };

  return (
    <div className="leave-management">
      <div className="section-header">
        <div>
          <h2>Quản lý nghỉ phép</h2>
          <p>Duyệt đơn từ nghỉ phép đa cấp</p>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Phòng ban</th>
                <th>Từ ngày</th>
                <th>Đến ngày</th>
                <th>Loại nghỉ</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-4"><Spinner /></td></tr>
              ) : leaves.map((lv: any) => {
                const maDon = getProp(lv, 'madon') ?? getProp(lv, 'id');
                const tenNv = getProp(lv, 'tennhanvien') ?? "";
                const MA_NV = getProp(lv, 'MA_NV') ?? "";
                const MA_PHG = getProp(lv, 'MA_PHG') ?? "";
                const tuNgay = getProp(lv, 'tungay');
                const denNgay = getProp(lv, 'denngay');
                const lyDo = getProp(lv, 'lydo') ?? "";
                const TRANG_THAI = getProp(lv, 'trangthaiduyet') ?? getProp(lv, 'TRANG_THAI') ?? "Chờ duyệt";
                
                return (
                <tr key={maDon}>
                  <td>
                    <span style={{ fontWeight: 600 }}>{tenNv}</span>
                    <br/><small className="text-gray">{MA_NV}</small>
                  </td>
                  <td>{MA_PHG}</td>
                  <td>{formatDate(tuNgay)}</td>
                  <td>{formatDate(denNgay)}</td>
                  <td>{getProp(lv, 'tenloainghi') || "Khác"}</td>
                  <td style={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {lyDo}
                  </td>
                  <td>
                    <Badge color={TRANG_THAI === "Đã duyệt" ? "green" : TRANG_THAI === "Từ chối" ? "red" : "yellow"}>
                      {TRANG_THAI}
                    </Badge>
                  </td>
                  <td>
                    {(TRANG_THAI !== "Đã duyệt" && TRANG_THAI !== "Từ chối") && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Btn variant="primary" onClick={() => handleApprove(maDon, TRANG_THAI)} icon={<CheckCircle2 size={14}/>}>Duyệt</Btn>
                        <Btn variant="danger" onClick={() => openRejectModal(maDon)} icon={<XCircle size={14}/>}>Từ chối</Btn>
                      </div>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </Card>

      {rejectModalOpen && (
        <div className="modal-overlay" onClick={() => setRejectModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Từ chối đơn nghỉ phép</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Lý do từ chối</label>
                <textarea 
                  className="form-input" 
                  rows={4} 
                  value={rejectReason} 
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do..."
                />
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <Btn variant="secondary" onClick={() => setRejectModalOpen(false)}>Hủy</Btn>
              <Btn variant="danger" onClick={handleReject}>Xác nhận</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
