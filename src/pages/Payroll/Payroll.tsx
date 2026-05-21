import React, { useState } from "react";
import { Wallet, ChevronLeft, ChevronRight, Clock, TrendingUp, ShieldCheck, Receipt } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import { Btn, Card, SectionHeader, EmptyState, Badge, Spinner, Drawer } from "../../components/UI/index";
import { usePayroll, MONTHS } from "./usePayroll";
import { PayrollTable } from "./PayrollTable";

// ─── Modal phiếu lương chi tiết ────────────────────────────────────────────────
const PayslipModal: React.FC<{ isOpen: boolean; onClose: () => void; data: any }> = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  const rows = [
    { label: "Giờ làm việc", value: `${data.GiolamViec ?? 0} giờ`, icon: <Clock size={14} /> },
    { label: "Phụ cấp", value: formatCurrency(data.PhuCap ?? 0), icon: <TrendingUp size={14} /> },
    { label: "Thưởng", value: formatCurrency(data.Thuong ?? 0), icon: <TrendingUp size={14} />, color: "#10b981" },
    { label: "Bảo hiểm xã hội (BHXH)", value: `- ${formatCurrency(data.BHXH ?? 0)}`, icon: <ShieldCheck size={14} />, color: "#ef4444" },
    { label: "Thuế thu nhập cá nhân", value: `- ${formatCurrency(data.ThueTNCN ?? 0)}`, icon: <Receipt size={14} />, color: "#f59e0b" },
  ];

  const net = data.ThucLanh ?? 0;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Phiếu lương chi tiết"
      subtitle={`Mã NV: ${data.MaNV} · ${MONTHS[(data.Thang ?? 1) - 1]} ${data.Nam}`}
      icon={<Wallet size={18} />}
      size="sm"
      footer={<Btn variant="secondary" onClick={onClose}>Đóng</Btn>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Header tổng quát */}
        <div style={{ background: "#111", borderRadius: 14, padding: "18px 20px", marginBottom: 20, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Tổng thực lãnh</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0 }}>{formatCurrency(net)}</p>
        </div>

        {/* Các dòng chi tiết */}
        <div className="drawer-section">
          <p className="drawer-section-title">Chi tiết khoản</p>
          {rows.map(({ label, value, color }) => (
            <div className="drawer-field" key={label}>
              <span className="drawer-field-label">{label}</span>
              <span className="drawer-field-value" style={{ color: color ?? "#111" }}>{value}</span>
            </div>
          ))}
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

  const MonthNav = () => (
    <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e0e0e0", borderRadius: 10, overflow: "hidden" }}>
      <button onClick={prevMonth} style={{ padding: "6px 10px", border: "none", background: "#fff", cursor: "pointer", color: "#666", display: "flex" }}>
        <ChevronLeft size={16} />
      </button>
      <span style={{
        padding: "6px 12px", fontSize: 13, fontWeight: 600,
        minWidth: 116, textAlign: "center",
        borderLeft: "1.5px solid #e0e0e0", borderRight: "1.5px solid #e0e0e0",
        background: "#fff",
      }}>
        {MONTHS[month - 1]} {year}
      </span>
      <button onClick={nextMonth} style={{ padding: "6px 10px", border: "none", background: "#fff", cursor: "pointer", color: "#666", display: "flex" }}>
        <ChevronRight size={16} />
      </button>
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
              <StatCard label="Giờ làm việc" value={`${myPayroll.GiolamViec ?? 0} giờ`} />
              <StatCard label="Phụ cấp" value={formatCurrency(myPayroll.PhuCap ?? 0)} />
              <StatCard label="Thưởng" value={formatCurrency(myPayroll.Thuong ?? 0)} color="#10b981" />
              <StatCard label="BHXH" value={formatCurrency(myPayroll.BHXH ?? 0)} color="#ef4444" />
              <StatCard label="Thuế TNCN" value={formatCurrency(myPayroll.ThueTNCN ?? 0)} color="#f59e0b" />
              <StatCard label="Thực lãnh" value={formatCurrency(myPayroll.ThucLanh ?? 0)} highlight />
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
      />
    </div>
  );
};

export default Payroll;
