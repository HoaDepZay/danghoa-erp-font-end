import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast, formatDate } from "../../utils/helpers";
import { AlertTriangle, FilePlus, X, Building2, PenTool } from "lucide-react";
import {
Badge,
  Spinner,
  Card,
  Btn,
  FormField,
} from "../../components/UI/index";
import { getUserLevel } from "../../utils/user";

const CONTRACT_TYPES = ["Thử việc", "1 năm", "3 năm", "Vô thời hạn"];

const ContractManager = ({ user, onNavigate }: { user: any; onNavigate: (page: string) => void }) => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userLevel = getUserLevel(user);
  const isDirectorOrAdmin = userLevel >= 4;

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const maNV = user.MA_NV || user.ma_nv;
      const res = isDirectorOrAdmin 
        ? await api.getContracts() 
        : await api.getContractByMaNV(maNV);
      setContracts(res.data?.data || []);
    } catch {
      toast.error("Không thể lấy danh sách hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const urgencyColor = (days: number) => {
    if (days <= 7) return "#ef4444";
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
          {isDirectorOrAdmin && (
            <Btn
              variant="primary"
              onClick={() => {
                localStorage.removeItem("edit_contract_data");
                onNavigate("contract_create");
              }}
              icon={<FilePlus size={16} />}
            >
              Tạo hợp đồng mới
            </Btn>
          )}
        </div>
      </div>

      <Card>
        {loading ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 40 }}
          >
            <Spinner size={28} />
          </div>
        ) : contracts.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <Building2 size={40} color="#e2e8f0" />
            <p style={{ color: "#94a3b8", marginTop: 12 }}>
              Không có hợp đồng nào trong hệ thống 🎉
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th>Loại hợp đồng</th>
                  <th>Trạng thái</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày hết hạn</th>
                  <th>Còn lại</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c: any) => {
                  const days = c.SO_NGAY_CON_LAI;
                  const loai = c.LOAI_HOP_DONG;
                  return (
                    // Loại bỏ hoàn toàn fallback cũ, dùng đồng nhất MA_HD
                    <tr key={c.MA_HD || c.MAHD}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.TEN_NHAN_VIEN}</div>
                        <small style={{ color: "#64748b" }}>{c.MA_NV}</small>
                      </td>

                      <td>
                        <Badge color={loai === "Thử việc" ? "yellow" : "blue"}>
                          {loai}
                        </Badge>
                      </td>
                      <td>
                        <Badge color={
                          c.TRANG_THAI === "DANG THUC HIEN" ? "green" :
                          c.TRANG_THAI === "HET HAN" ? "red" :
                          c.TRANG_THAI === "HUY" ? "gray" :
                          "blue"
                        }>
                          {c.TRANG_THAI === "CHUA BAT DAU" ? "Chưa bắt đầu" :
                           c.TRANG_THAI === "DANG THUC HIEN" ? "Đang thực hiện" :
                           c.TRANG_THAI === "HET HAN" ? "Hết hạn" :
                           c.TRANG_THAI === "HUY" ? "Hủy" : c.TRANG_THAI}
                        </Badge>
                      </td>
                      <td>{formatDate(c.TU_NGAY)}</td>
                      <td>{formatDate(c.DEN_NGAY)}</td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color:
                              days > 10000 ? "#3b82f6" : urgencyColor(days),
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
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
                        <div style={{ display: "flex", gap: 8 }}>
                          {isDirectorOrAdmin && (
                            <Btn
                              variant="primary"
                              onClick={() => {
                                localStorage.setItem("edit_contract_data", JSON.stringify(c));
                                onNavigate("contract_create");
                              }}
                              icon={<PenTool size={14} />}
                            >
                              Chỉnh sửa
                            </Btn>
                          )}
                          <Btn
                            variant="secondary"
                            onClick={() => {
                              localStorage.setItem("selected_contract", JSON.stringify(c));
                              localStorage.setItem("contract_back_to", "contracts");
                              onNavigate("contract_details");
                            }}
                          >
                            Chi tiết
                          </Btn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>


    </div>
  );
};

export default ContractManager;
