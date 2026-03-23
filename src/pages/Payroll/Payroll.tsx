import React, { useState, useEffect } from "react";
import { Wallet, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../../services/api";
import { toast, formatCurrency } from "../../utils/helpers";
import { Btn, Card, SectionHeader, EmptyState, Badge, Spinner, FormField } from "../../components/UI/index";
import Modal from "../../components/UI/Modal";
import { usePayroll, MONTHS } from "./usePayroll";
import { PayrollTable } from "./PayrollTable";

const UpdatePayrollModal: React.FC<any> = ({ isOpen, onClose, record, onSuccess }) => {
  const [form, setForm] = useState({ Thuong: "", KhauTruBH: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (record) setForm({ Thuong: record.THUONG ?? record.Thuong ?? "", KhauTruBH: record.KHAUTRUBH ?? record.KhauTruBH ?? "" });
  }, [record, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.updatePayroll(record.MABL || record.MaBl, {
        Thuong: Number(form.Thuong) || 0, KhauTruBH: Number(form.KhauTruBH) || 0,
      });
      toast.success("Cập nhật phiếu lương thành công!");
      onSuccess(); onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || "Lỗi cập nhật!"); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cập nhật phiếu lương" footer={<><Btn variant="secondary" onClick={onClose}>Hủy</Btn><Btn loading={loading} onClick={handleSubmit}>Lưu</Btn></>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#f8f8f8", borderRadius: 12, padding: "12px 16px" }}>
          <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{record?.HOTEN || record?.HoTen}</p>
          <p style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{record?.MANV || record?.MaNV}</p>
        </div>
        <FormField label="Thưởng (VNĐ)"><input className="form-input" type="number" placeholder="0" value={form.Thuong} onChange={(e) => setForm((f) => ({ ...f, Thuong: e.target.value }))} /></FormField>
        <FormField label="Khấu trừ bảo hiểm (VNĐ)"><input className="form-input" type="number" placeholder="0" value={form.KhauTruBH} onChange={(e) => setForm((f) => ({ ...f, KhauTruBH: e.target.value }))} /></FormField>
      </div>
    </Modal>
  );
};

const PayslipModal: React.FC<any> = ({ isOpen, onClose, data }) => {
  if (!data) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Phiếu lương" size="sm" footer={<Btn variant="secondary" onClick={onClose}>Đóng</Btn>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ textAlign: "center", paddingBottom: 16, borderBottom: "1px solid #f0f0f0", marginBottom: 16 }}>
          <p style={{ fontWeight: 700, fontSize: 17, margin: 0 }}>{data.HOTEN || data.HoTen}</p>
          <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{MONTHS[(data.THANG || data.Thang || 1) - 1]} / {data.NAM || data.Nam}</p>
        </div>
        {[
          { label: "Lương cơ bản", value: formatCurrency(data.LUONGCOBAN || data.LuongCoBan) },
          { label: "Phụ cấp", value: formatCurrency(data.PHUCAP || data.PhuCap) },
          { label: "Ngày công", value: `${data.SONGAYCONGTHUCTE || data.SoNgayCongThucTe || 0} ngày` },
          { label: "Thưởng", value: formatCurrency(data.THUONG || data.Thuong || 0) },
          { label: "Khấu trừ BH", value: `- ${formatCurrency(data.KHAUTRUBH || data.KhauTruBH || 0)}` },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13 }}>
            <span style={{ color: "#888" }}>{label}</span>
            <span style={{ fontWeight: 600 }}>{value}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", marginTop: 8, borderTop: "2px solid #f0f0f0", fontSize: 15 }}>
          <span style={{ fontWeight: 700 }}>Tổng thực nhận</span>
          <span style={{ fontWeight: 800 }}>{formatCurrency(data.TONGLUONG || data.TongLuong)}</span>
        </div>
      </div>
    </Modal>
  );
};

export const Payroll: React.FC<{ user: any }> = ({ user }) => {
  const { month, year, payroll, myPayroll, loading, generating, modal, setModal, isHR, totalBudget, fetchPayroll, handleGenerate, prevMonth, nextMonth } = usePayroll(user);

  const MonthNav = () => (
    <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e0e0e0", borderRadius: 10, overflow: "hidden" }}>
      <button onClick={prevMonth} style={{ padding: "6px 10px", border: "none", background: "#fff", cursor: "pointer", color: "#666", display: "flex" }}><ChevronLeft size={16} /></button>
      <span style={{ padding: "6px 12px", fontSize: 13, fontWeight: 600, minWidth: 116, textAlign: "center", borderLeft: "1.5px solid #e0e0e0", borderRight: "1.5px solid #e0e0e0", background: "#fff" }}>
        {MONTHS[month - 1]} {year}
      </span>
      <button onClick={nextMonth} style={{ padding: "6px 10px", border: "none", background: "#fff", cursor: "pointer", color: "#666", display: "flex" }}><ChevronRight size={16} /></button>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Bảng lương"
        subtitle={isHR ? `${payroll.length} nhân viên · Tổng: ${formatCurrency(totalBudget)}` : "Phiếu lương cá nhân"}
        actions={
          <>
            <MonthNav />
            {isHR && <Btn size="sm" loading={generating} icon={<Play size={14} />} variant="success" onClick={handleGenerate}>Chốt lương</Btn>}
          </>
        }
      />

       {!isHR && (
        loading ? (
          <Card><div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner size={28} /></div></Card>
        ) : myPayroll ? (
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>{MONTHS[month - 1]} {year}</h3>
                <p style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>Phiếu lương cá nhân</p>
              </div>
              <Badge color="green">Đã chốt</Badge>
            </div>
             <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {[
                { label: "Lương cơ bản", value: formatCurrency(myPayroll.LUONGCOBAN || myPayroll.LuongCoBan) },
                { label: "Phụ cấp", value: formatCurrency(myPayroll.PHUCAP || myPayroll.PhuCap) },
                { label: "Ngày công", value: `${myPayroll.SONGAYCONGTHUCTE || myPayroll.SoNgayCongThucTe || 0} ngày` },
                { label: "Thưởng", value: formatCurrency(myPayroll.THUONG || myPayroll.Thuong || 0) },
                { label: "Khấu trừ BH", value: formatCurrency(myPayroll.KHAUTRUBH || myPayroll.KhauTruBH || 0) },
                { label: "Thực nhận", value: formatCurrency(myPayroll.TONGLUONG || myPayroll.TongLuong), highlight: true },
              ].map(({ label, value, highlight }) => (
                <div key={label} style={{ borderRadius: 14, padding: "14px 16px", background: highlight ? "#111" : "#f8f8f8" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: highlight ? "rgba(255,255,255,0.6)" : "#888", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 16, fontWeight: 800, marginTop: 6, color: highlight ? "#fff" : "#111" }}>{value}</p>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card><EmptyState icon={<Wallet size={48} />} title={`Chưa có phiếu lương ${MONTHS[month - 1]} ${year}`} description="Lương chưa được chốt cho tháng này" /></Card>
        )
      )}

      {isHR && (
        payroll.length === 0 && !loading ? (
           <Card><EmptyState icon={<Wallet size={48} />} title={`Chưa chốt lương ${MONTHS[month - 1]} ${year}`} description="Nhấn Chốt lương để tính lương tháng này" /></Card>
        ) : (
          <Card padding={false}>
            <PayrollTable loading={loading} payroll={payroll} totalBudget={totalBudget} setModal={setModal} />
          </Card>
        )
      )}

       <UpdatePayrollModal isOpen={modal.type === "update"} onClose={() => setModal({ type: "", data: null })} record={modal.data} onSuccess={fetchPayroll} />
      <PayslipModal isOpen={modal.type === "payslip"} onClose={() => setModal({ type: "", data: null })} data={modal.data} />
    </div>
  );
};

export default Payroll;

