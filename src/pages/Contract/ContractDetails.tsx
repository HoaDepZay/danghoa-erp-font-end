import React, { useEffect, useState, useContext } from "react";
import { ArrowLeft, FileText, Calendar, DollarSign, PenTool, StickyNote, Activity } from "lucide-react";
import { Card, Btn, Badge, CustomSelect } from "../../components/UI/index";
import { formatDate, toast } from "../../utils/helpers";
import { api } from "../../services/api";
import { getUserLevel } from "../../utils/user";

const STATUS_TYPES = [
  { label: "Chưa bắt đầu", value: "CHUA BAT DAU" },
  { label: "Đang thực hiện", value: "DANG THUC HIEN" },
  { label: "Hết hạn", value: "HET HAN" },
  { label: "Hủy", value: "HUY" },
];

const ContractDetails = ({ user, onNavigate }: { user: any; onNavigate: (page: string) => void }) => {
  const [contract, setContract] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  
  const userLevel = getUserLevel(user);
  const isDirectorOrAdmin = userLevel >= 4;

  useEffect(() => {
    const data = localStorage.getItem("selected_contract");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setContract(parsed);
        if (getUserLevel(user) >= 4) {
          api.getContractHistory(parsed.MA_HD || parsed.MAHD).then((res: any) => {
            if (res.data?.success) setHistory(res.data.data);
          }).catch(console.error);
        }
      } catch (e) {
        console.error("Invalid contract data in localStorage", e);
      }
    } else {
      onNavigate("profile");
    }
  }, [onNavigate, user]);

  if (!contract) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h3 style={{ color: "#e11d48" }}>⚠️ Không tìm thấy dữ liệu hợp đồng</h3>
        <p>Vui lòng quay lại và chọn lại hợp đồng.</p>
        <Btn onClick={() => onNavigate("profile")}>Quay lại Hồ sơ</Btn>
      </div>
    );
  }

  const handleStatusChange = async (e: any) => {
    const newStatus = e.target.value;
    if (!newStatus) return;
    
    setUpdating(true);
    try {
      await api.updateContractStatus(contract.MA_HD || contract.MAHD, newStatus);
      const updated = { ...contract, TRANG_THAI: newStatus };
      setContract(updated);
      localStorage.setItem("selected_contract", JSON.stringify(updated));
      toast.success("Cập nhật trạng thái thành công");
      
      // Refresh history
      api.getContractHistory(contract.MA_HD || contract.MAHD).then((res: any) => {
        if (res.data?.success) setHistory(res.data.data);
      }).catch(console.error);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  const loai = contract.LOAI_HOP_DONG;
  const status = contract.TRANG_THAI || "CHUA BAT DAU";

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => {
            // Check where we came from, or just go back to profile/contracts
            // We can just call onNavigate("profile") or let them use the sidebar
            // Since we don't know the exact previous page, let's just go back in history or profile
            // Actually, we can store "previous_page" in localStorage if we want.
            // For now, let's just go to "profile" since that's the most common for employees, 
            // or "contracts" for managers.
            const from = localStorage.getItem("contract_back_to") || "profile";
            onNavigate(from);
          }}
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={20} color="#64748b" />
        </button>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#1e293b" }}>Chi tiết Hợp đồng</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
            Mã hợp đồng: <strong style={{ color: "#0f172a" }}>{contract.MA_HD || contract.MAHD}</strong>
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        {/* Cột trái: Thông tin hợp đồng */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card style={{ overflow: "visible", zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, borderBottom: "1px solid #f1f5f9", paddingBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={20} color="#3b82f6" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1e293b" }}>Thông tin cơ bản</h3>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Nhân viên và Loại hợp đồng</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b", fontWeight: 500 }}>Nhân viên</p>
                <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
                  {contract.TEN_NHAN_VIEN} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({contract.MA_NV})</span>
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b", fontWeight: 500 }}>Loại hợp đồng</p>
                <div style={{ marginTop: 4 }}>
                  <Badge color={loai === "Thử việc" ? "yellow" : "blue"}>{loai}</Badge>
                </div>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b", fontWeight: 500 }}>Trạng thái</p>
                <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 12 }}>
                  <Badge color={
                    status === "DANG THUC HIEN" ? "green" :
                    status === "HET HAN" ? "red" :
                    status === "HUY" ? "gray" :
                    "blue"
                  }>
                    {status === "CHUA BAT DAU" ? "Chưa bắt đầu" :
                     status === "DANG THUC HIEN" ? "Đang thực hiện" :
                     status === "HET HAN" ? "Hết hạn" :
                     status === "HUY" ? "Hủy" : status}
                  </Badge>
                  {isDirectorOrAdmin && (
                    <div style={{ width: 160 }}>
                      <CustomSelect 
                        options={STATUS_TYPES}
                        value={status}
                        onChange={handleStatusChange}
                        disabled={updating}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b", fontWeight: 500 }}>Lương cơ bản</p>
                <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: 6 }}>
                  <DollarSign size={16} />
                  {contract.LUONG_CO_BAN ? parseInt(contract.LUONG_CO_BAN).toLocaleString() : 0} VNĐ
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, borderBottom: "1px solid #f1f5f9", paddingBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Calendar size={20} color="#f59e0b" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1e293b" }}>Thời hạn hợp đồng</h3>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Ngày bắt đầu và ngày kết thúc</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b", fontWeight: 500 }}>Ngày bắt đầu</p>
                <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{formatDate(contract.TU_NGAY)}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b", fontWeight: 500 }}>Ngày kết thúc</p>
                <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
                  {contract.DEN_NGAY ? formatDate(contract.DEN_NGAY) : "Vô thời hạn"}
                </p>
              </div>
              <div style={{ gridColumn: "1 / -1", paddingTop: 8, marginTop: 8, borderTop: "1px dashed #e2e8f0" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                  <PenTool size={14} /> Ngày ký hợp đồng
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
                  {contract.NGAY_KY ? formatDate(contract.NGAY_KY) : "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </Card>

          {contract.GHI_CHU && (
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <StickyNote size={18} color="#8b5cf6" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1e293b" }}>Ghi chú thêm</h3>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>{contract.GHI_CHU}</p>
            </Card>
          )}

          {isDirectorOrAdmin && (
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, borderBottom: "1px solid #f1f5f9", paddingBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Activity size={20} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1e293b" }}>Lịch sử cập nhật</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Nhật ký thay đổi hợp đồng</p>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {history.length > 0 ? (
                  history.map((h, i) => (
                    <div key={i} style={{ paddingLeft: 12, borderLeft: "2px solid #e2e8f0", position: "relative" }}>
                      <div style={{ position: "absolute", left: -5, top: 4, width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }} />
                      <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{formatDate(h.THOI_GIAN)}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 14, color: "#0f172a", fontWeight: 500 }}>
                        <span style={{ color: "#3b82f6" }}>{h.TEN_NGUOI_THAY_DOI || h.NGUOI_THAY_DOI}</span> đã sửa:
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: 14, color: "#475569" }}>{h.NOI_DUNG_THAY_DOI}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ margin: 0, fontSize: 14, color: "#94a3b8", fontStyle: "italic" }}>Chưa có lịch sử cập nhật nào.</p>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Cột phải: Khung hiển thị file PDF */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Card style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={18} color="#ef4444" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1e293b" }}>Bản mềm Hợp đồng (PDF)</h3>
              </div>
              {contract.URL_CHI_TIET && (
                <Btn size="sm" variant="secondary" onClick={() => window.open(contract.URL_CHI_TIET, "_blank")}>Mở tab mới</Btn>
              )}
            </div>
            
            <div style={{ flex: 1, minHeight: 600, background: "#e2e8f0", position: "relative" }}>
              {contract.URL_CHI_TIET ? (
                <iframe
                  src={contract.URL_CHI_TIET}
                  width="100%"
                  height="100%"
                  style={{ border: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  title="PDF Viewer"
                />
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <FileText size={48} color="#94a3b8" />
                  <p style={{ margin: 0, color: "#64748b", fontSize: 15, fontWeight: 500 }}>Chưa có file đính kèm</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContractDetails;
