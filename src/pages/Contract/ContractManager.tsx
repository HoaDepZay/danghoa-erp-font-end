import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast, formatDate } from "../../utils/helpers";
import { AlertTriangle, FilePlus, X, Building2 } from "lucide-react";
import {
  Badge,
  Spinner,
  Card,
  Btn,
  FormField,
} from "../../components/UI/index";

const CONTRACT_TYPES = ["Thử việc", "1 năm", "3 năm", "Vô thời hạn"];

const ContractManager = ({ user }: { user: any }) => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMaNv, setSelectedMaNv] = useState("");

  // 🌟 ĐÃ CHUẨN HÓA STATE FORM SANG ĐỊNH DẠNG TEN_TRUONG
  const [form, setForm] = useState({
    MA_NV: "",
    LOAI_HOP_DONG: "Thử việc",
    TU_NGAY: "",
    DEN_NGAY: "",
    LUONG_CO_BAN: "",
    NGAY_KY: "",
    GHI_CHU: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

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

  // 🌟 ĐÃ CHUẨN HÓA HÀM KHỞI TẠO FORM
  const openForm = (MA_NV = "") => {
    setSelectedMaNv(MA_NV);
    setForm({
      MA_NV,
      LOAI_HOP_DONG: "1 năm",
      TU_NGAY: "",
      DEN_NGAY: "",
      LUONG_CO_BAN: "",
      NGAY_KY: "",
      GHI_CHU: "",
    });
    setShowForm(true);
  };

  const set = (k: string) => (e: any) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // 🌟 ĐÃ CHUẨN HÓA LOGIC SAVE & PAYLOAD GỬI LÊN API
  const handleSave = async () => {
    if (!form.MA_NV || !form.TU_NGAY || !form.LUONG_CO_BAN) {
      return toast.error("Vui lòng điền đầy đủ: Mã NV, Từ ngày, Lương cơ bản");
    }
    setSaving(true);
    try {
      await api.createContract({
        MA_NV: form.MA_NV,
        LOAI_HOP_DONG: form.LOAI_HOP_DONG,
        TU_NGAY: form.TU_NGAY,
        DEN_NGAY: form.DEN_NGAY || undefined,
        LUONG_CO_BAN: Number(form.LUONG_CO_BAN),
        NGAY_KY: form.NGAY_KY || undefined,
        GHI_CHU: form.GHI_CHU || undefined,
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
          <Btn
            variant="primary"
            onClick={() => openForm()}
            icon={<FilePlus size={16} />}
          >
            Tạo hợp đồng mới
          </Btn>
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
                        <Btn
                          variant="primary"
                          onClick={() => openForm(c.MA_NV)}
                          icon={<FilePlus size={14} />}
                        >
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
          <div
            className="modal-box modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Tạo / Gia hạn hợp đồng</h3>
              <button
                className="modal-close"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div
              className="modal-body"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <FormField label="Mã nhân viên *">
                <input
                  className="form-input"
                  value={form.MA_NV}
                  onChange={set("MA_NV")}
                  placeholder="VD: NV001"
                />
              </FormField>
              <FormField label="Loại hợp đồng *">
                <select
                  className="form-input"
                  value={form.LOAI_HOP_DONG}
                  onChange={set("LOAI_HOP_DONG")}
                >
                  {CONTRACT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Ngày bắt đầu *">
                <input
                  className="form-input"
                  type="date"
                  value={form.TU_NGAY}
                  onChange={set("TU_NGAY")}
                />
              </FormField>
              <FormField label="Ngày hết hạn">
                <input
                  className="form-input"
                  type="date"
                  value={form.DEN_NGAY}
                  onChange={set("DEN_NGAY")}
                  placeholder="Bỏ trống nếu vô thời hạn"
                />
              </FormField>
              <FormField label="Lương cơ bản *">
                <input
                  className="form-input"
                  type="number"
                  value={form.LUONG_CO_BAN}
                  onChange={set("LUONG_CO_BAN")}
                  placeholder="VD: 10000000"
                />
              </FormField>
              <FormField label="Ngày ký">
                <input
                  className="form-input"
                  type="date"
                  value={form.NGAY_KY}
                  onChange={set("NGAY_KY")}
                />
              </FormField>
              <div style={{ gridColumn: "1 / -1" }}>
                <FormField label="Ghi chú">
                  <textarea
                    className="form-input"
                    rows={3}
                    value={form.GHI_CHU}
                    onChange={set("GHI_CHU")}
                    placeholder="Ghi chú thêm..."
                  />
                </FormField>
              </div>
            </div>
            <div
              className="modal-footer"
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <Btn variant="secondary" onClick={() => setShowForm(false)}>
                Hủy
              </Btn>
              <Btn variant="primary" loading={saving} onClick={handleSave}>
                Lưu hợp đồng
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManager;
