import React, { useState } from "react";
import { Wallet, ChevronLeft, ChevronRight, Clock, TrendingUp, ShieldCheck, Receipt } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import { Btn, Card, SectionHeader, EmptyState, Badge, Spinner, Drawer } from "../../components/UI/index";
import { usePayroll, MONTHS } from "./usePayroll";
import { PayrollTable } from "./PayrollTable";

// ─── Modal phiếu lương chi tiết ────────────────────────────────────────────────
const PayslipModal: React.FC<{ isOpen: boolean; onClose: () => void; data: any; isHR?: boolean; onSave?: (data: any) => Promise<void> }> = ({ isOpen, onClose, data, isHR, onSave }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (isOpen && data) {
      setIsEdit(false);
      setEditData({
        SO_NGAY_CONG_THUC_TE: data.SO_NGAY_CONG_THUC_TE ?? data.giolamViec ?? 0,
        PHU_CAP: data.PHU_CAP ?? data.phucap ?? 0,
        THUONG: data.THUONG ?? data.thuong ?? 0,
        KHAU_TRU_BHXH: data.KHAU_TRU_BHXH ?? data.bhxh ?? 0,
      });
    }
  }, [isOpen, data]);

  if (!data) return null;

  const handleSave = async () => {
    if (onSave) {
      setSaving(true);
      await onSave({ ...data, ...editData });
      setSaving(false);
      setIsEdit(false);
    }
  };

  const net = data.THUC_LANH ?? data.thucLanh ?? 0;

  const renderField = (label: string, field: string, icon: any, color?: string, isNegative: boolean = false) => {
    return (
      <div className="drawer-field" key={label}>
        <span className="drawer-field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>{icon} {label}</span>
        {isEdit ? (
          <input
            type="number"
            className="input"
            style={{ width: 120, padding: "4px 8px", fontSize: 13, textAlign: "right", color: color ?? "#111" }}
            value={editData[field]}
            onChange={(e) => setEditData({ ...editData, [field]: Number(e.target.value) })}
          />
        ) : (
          <span className="drawer-field-value" style={{ color: color ?? "#111" }}>
            {isNegative ? "- " : ""}{field === "SO_NGAY_CONG_THUC_TE" ? `${editData[field]} ngày` : formatCurrency(editData[field])}
          </span>
        )}
      </div>
    );
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Phiếu lương chi tiết"
      subtitle={`Mã NV: ${data.MA_NV} · ${MONTHS[(data.thang ?? 1) - 1]} ${data.nam}`}
      icon={<Wallet size={18} />}
      size="sm"
      footer={
        <div style={{ display: "flex", gap: 8, width: "100%", justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={onClose} disabled={saving}>Đóng</Btn>
          {isHR && !isEdit && <Btn variant="primary" onClick={() => setIsEdit(true)}>Sửa</Btn>}
          {isHR && isEdit && <Btn variant="primary" onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Btn>}
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Header tổng quát */}
        <div style={{ background: "#111", borderRadius: 14, padding: "18px 20px", marginBottom: 20, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Tổng thực lãnh</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0 }}>{formatCurrency(net)}</p>
          {isEdit && <p style={{ fontSize: 11, color: "#f59e0b", marginTop: 6 }}>Thực lãnh sẽ được tính toán lại sau khi lưu.</p>}
        </div>

        {/* Các dòng chi tiết */}
        <div className="drawer-section">
          <p className="drawer-section-title">Chi tiết khoản</p>
          {renderField("Ngày công", "SO_NGAY_CONG_THUC_TE", <Clock size={14} />)}
          {renderField("Phụ cấp", "PHU_CAP", <TrendingUp size={14} />)}
          {renderField("Thưởng", "THUONG", <TrendingUp size={14} />, "#10b981")}
          {renderField("Khấu trừ (BHXH)", "KHAU_TRU_BHXH", <ShieldCheck size={14} />, "#ef4444", true)}
          
          <div className="drawer-field">
            <span className="drawer-field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}><Receipt size={14} /> Thuế thu nhập cá nhân</span>
            <span className="drawer-field-value" style={{ color: "#f59e0b" }}>- {formatCurrency(data.THUE_TNCN ?? data.thueTNCN ?? 0)}</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

// ─── Card thống kê nhỏ ─────────────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: string; highlight?: boolean; color?: string }> = ({
  label, value, highlight, color,
}) => (
  <div style={{
    borderRadius: 14,
    padding: "14px 16px",
    background: highlight ? "#111" : "#f8f8f8",
  }}>
    <p style={{
      fontSize: 10, fontWeight: 600,
      color: highlight ? "rgba(255,255,255,0.55)" : "#888",
      textTransform: "uppercase", letterSpacing: "0.06em", margin: 0,
    }}>
      {label}
    </p>
    <p style={{
      fontSize: 16, fontWeight: 800, marginTop: 6,
      color: color ?? (highlight ? "#fff" : "#111"),
    }}>
      {value}
    </p>
  </div>
);

import { api } from "../../services/api";
// ─── Trang Payroll chính ────────────────────────────────────────────────────────
export const Payroll: React.FC<{ user: any }> = ({ user }) => {
  const {
    month, year, payroll, myPayroll, loading, modal, setModal,
    isHR, totalBudget, fetchPayroll, prevMonth, nextMonth,
  } = usePayroll(user);

  const [payslipOpen, setPayslipOpen] = useState(false);
  const [payslipData, setPayslipData] = useState<any>(null);

  const openPayslip = (data: any) => {
    setPayslipData(data);
    setPayslipOpen(true);
  };

  const handleSavePayslip = async (updatedData: any) => {
    try {
      const id = updatedData.MA_BL;
      if (!id) throw new Error("Không tìm thấy mã phiếu lương");
      await api.updatePayroll(id, updatedData);
      await fetchPayroll(); // Refresh data
      // Update local modal data slightly to show new numbers, or just close it
      setPayslipData(null);
      setPayslipOpen(false);
      alert("Cập nhật lương thành công!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi cập nhật lương");
    }
  };

  const MonthNav = () => (
    <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e0e0e0", borderRadius: 10, overflow: "hidden" }}>
      <Btn onClick={prevMonth} style={{ padding: "6px 10px", border: "none", background: "#fff", cursor: "pointer", color: "#666", display: "flex" }}>
        <ChevronLeft size={16} />
      </Btn>
      <span style={{
        padding: "6px 12px", fontSize: 13, fontWeight: 600,
        minWidth: 116, textAlign: "center",
        borderLeft: "1.5px solid #e0e0e0", borderRight: "1.5px solid #e0e0e0",
        background: "#fff",
      }}>
        {MONTHS[month - 1]} {year}
      </span>
      <Btn onClick={nextMonth} style={{ padding: "6px 10px", border: "none", background: "#fff", cursor: "pointer", color: "#666", display: "flex" }}>
        <ChevronRight size={16} />
      </Btn>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Bảng lương"
        subtitle={
          isHR
            ? `${payroll.length} nhân viên · Tổng thực lãnh: ${formatCurrency(totalBudget)}`
            : "Phiếu lương cá nhân"
        }
        actions={<MonthNav />}
      />

      {/* ── Nhân viên: Phiếu lương cá nhân ── */}
      {!isHR && (
        loading ? (
          <Card>
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <Spinner size={28} />
            </div>
          </Card>
        ) : myPayroll ? (
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>
                  {MONTHS[month - 1]} {year}
                </h3>
                <p style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>Phiếu lương cá nhân</p>
              </div>
              <Badge color="green">Đã cập nhật</Badge>
            </div>

            <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <StatCard label="Ngày công" value={`${myPayroll.SO_NGAY_CONG_THUC_TE ?? myPayroll.giolamViec ?? 0} ngày`} />
              <StatCard label="Phụ cấp" value={formatCurrency(myPayroll.PHU_CAP ?? myPayroll.phucap ?? 0)} />
              <StatCard label="Thưởng" value={formatCurrency(myPayroll.THUONG ?? myPayroll.thuong ?? 0)} color="#10b981" />
              <StatCard label="BHXH" value={formatCurrency(myPayroll.KHAU_TRU_BHXH ?? myPayroll.bhxh ?? 0)} color="#ef4444" />
              <StatCard label="Thuế TNCN" value={formatCurrency(myPayroll.THUE_TNCN ?? myPayroll.thueTNCN ?? 0)} color="#f59e0b" />
              <StatCard label="Thực lãnh" value={formatCurrency(myPayroll.THUC_LANH ?? myPayroll.thucLanh ?? 0)} highlight />
            </div>

            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Btn size="sm" variant="secondary" onClick={() => openPayslip(myPayroll)}>
                Xem phiếu lương đầy đủ
              </Btn>
            </div>
          </Card>
        ) : (
          <Card>
            <EmptyState
              icon={<Wallet size={48} />}
              title={`Chưa có phiếu lương ${MONTHS[month - 1]} ${year}`}
              description="Dữ liệu lương tháng này chưa được cập nhật từ hệ thống"
            />
          </Card>
        )
      )}

      {/* ── HR / Admin: Bảng lương toàn công ty ── */}
      {isHR && (
        payroll.length === 0 && !loading ? (
          <Card>
            <EmptyState
              icon={<Wallet size={48} />}
              title={`Chưa có dữ liệu lương ${MONTHS[month - 1]} ${year}`}
              description="Dữ liệu lương sẽ được cập nhật tự động sau khi chấm công được xử lý"
            />
          </Card>
        ) : (
          <Card padding={false}>
            <PayrollTable
              loading={loading}
              payroll={payroll}
              totalBudget={totalBudget}
              onViewDetail={openPayslip}
            />
          </Card>
        )
      )}

      {/* Modal phiếu lương */}
      <PayslipModal
        isOpen={payslipOpen}
        onClose={() => setPayslipOpen(false)}
        data={payslipData}
        isHR={isHR}
        onSave={handleSavePayslip}
      />
    </div>
  );
};

export default Payroll;
