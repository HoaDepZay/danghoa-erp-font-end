import { useState, useEffect, useCallback } from "react";
import { Wallet, Play, Edit3, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../services/api";
import { toast, formatCurrency, getCurrentMonthYear } from "../utils/helpers";
import { getManv, toArray } from "../utils/user";
import {
  Btn, Card, SectionHeader, EmptyState, SkeletonRows, Badge, Spinner, FormField,
} from "../components/UI/index";
import Modal from "../components/UI/Modal";

const MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
  "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

// ── Update Payroll Modal ──────────────────────────────────────────────────────
const UpdatePayrollModal = ({ isOpen, onClose, record, onSuccess }) => {
  const [form, setForm] = useState({ Thuong: "", KhauTruBH: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (record) {
      setForm({
        Thuong: record.THUONG ?? record.Thuong ?? "",
        KhauTruBH: record.KHAUTRUBH ?? record.KhauTruBH ?? "",
      });
    }
  }, [record, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.updatePayroll(record.MABL || record.MaBl, {
        Thuong: Number(form.Thuong) || 0,
        KhauTruBH: Number(form.KhauTruBH) || 0,
      });
      toast.success("Cập nhật phiếu lương thành công!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cập nhật phiếu lương"
      footer={<><Btn variant="secondary" onClick={onClose}>Hủy</Btn><Btn loading={loading} onClick={handleSubmit}>Lưu</Btn></>}>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-4 text-sm">
          <p className="font-600">{record?.HOTEN || record?.HoTen}</p>
          <p className="text-gray-500 text-xs mt-0.5">{record?.MANV || record?.MaNV}</p>
        </div>
        <FormField label="Thưởng (VNĐ)">
          <input className="form-input" type="number" placeholder="0" value={form.Thuong}
            onChange={(e) => setForm((f) => ({ ...f, Thuong: e.target.value }))} />
        </FormField>
        <FormField label="Khấu trừ bảo hiểm (VNĐ)">
          <input className="form-input" type="number" placeholder="0" value={form.KhauTruBH}
            onChange={(e) => setForm((f) => ({ ...f, KhauTruBH: e.target.value }))} />
        </FormField>
      </div>
    </Modal>
  );
};

// ── My Payslip Modal ──────────────────────────────────────────────────────────
const PayslipModal = ({ isOpen, onClose, data }) => {
  if (!data) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Phiếu lương" size="sm"
      footer={<Btn variant="secondary" onClick={onClose}>Đóng</Btn>}>
      <div className="space-y-4">
        <div className="text-center pb-4 border-b border-gray-100">
          <p className="font-700 text-lg">{data.HOTEN || data.HoTen}</p>
          <p className="text-sm text-gray-400">{MONTHS[(data.THANG || data.Thang || 1) - 1]} / {data.NAM || data.Nam}</p>
        </div>
        {[
          { label: "Lương cơ bản", value: formatCurrency(data.LUONGCOBAN || data.LuongCoBan), bold: false },
          { label: "Phụ cấp", value: formatCurrency(data.PHUCAP || data.PhuCap), bold: false },
          { label: "Ngày công thực tế", value: `${data.SONGAYCONGTHUCTE || data.SoNgayCongThucTe || 0} ngày`, bold: false },
          { label: "Thưởng", value: formatCurrency(data.THUONG || data.Thuong || 0), bold: false },
          { label: "Khấu trừ BH", value: `- ${formatCurrency(data.KHAUTRUBH || data.KhauTruBH || 0)}`, bold: false },
          { label: "Tổng thực nhận", value: formatCurrency(data.TONGLUONG || data.TongLuong), bold: true },
        ].map(({ label, value, bold }) => (
          <div key={label} className={`flex justify-between text-sm ${bold ? "pt-3 border-t border-gray-100 font-700 text-base" : ""}`}>
            <span className={bold ? "text-gray-900" : "text-gray-500"}>{label}</span>
            <span className={bold ? "text-gray-900" : ""}>{value}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const PayrollPage = ({ user }) => {
  const { month: curMonth, year: curYear } = getCurrentMonthYear();
  const [month, setMonth] = useState(curMonth);
  const [year, setYear] = useState(curYear);
  const [payroll, setPayroll] = useState([]);
  const [myPayroll, setMyPayroll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [modal, setModal] = useState({ type: "", data: null });

  const ROLE_LEVELS = { "Cộng tác viên": 1, "Nhân viên": 2, "Quản lý": 3, "Admin": 4 };
  const userLevel = ROLE_LEVELS[user?.chuc_vu] || 1;
  const manv = getManv(user);
  const isHR = userLevel >= 3;

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    try {
      if (isHR) {
          const res = await api.getPayroll(year, month);
          const data = res.data;
          // normalize: có thể là array hoặc { data: [] }
          setPayroll(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
        } else {
          const res = await api.getMyPayroll(manv, year, month);
          setMyPayroll(res.data || null);
        }
    } catch (err) {
      if (err.response?.status === 404) {
        setPayroll([]);
        setMyPayroll(null);
      } else {
        toast.error("Không thể tải bảng lương!");
      }
    } finally {
      setLoading(false);
    }
  }, [isHR, manv, month, year]);

  useEffect(() => { fetchPayroll(); }, [fetchPayroll]);

  const handleGenerate = async () => {
    if (!window.confirm(`Chốt lương tháng ${month}/${year}? Thao tác này không thể hoàn tác ngay.`)) return;
    setGenerating(true);
    try {
      await api.generatePayroll({ month, year });
      toast.success(`Đã chốt lương tháng ${month}/${year} thành công!`);
      fetchPayroll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi chốt lương!");
    } finally {
      setGenerating(false);
    }
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    const now = new Date();
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)) return;
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const totalBudget = payroll.reduce((sum, r) => sum + (r.TONGLUONG || r.TongLuong || 0), 0);

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Bảng lương"
        subtitle={isHR ? `${payroll.length} nhân viên · Tổng: ${formatCurrency(totalBudget)}` : "Phiếu lương cá nhân"}
        actions={
          <>
            {/* Month navigator */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-50 text-gray-600 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 text-sm font-600 min-w-[110px] text-center">
                {MONTHS[month - 1]} {year}
              </span>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-50 text-gray-600 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>

            {isHR && (
              <Btn
                size="sm"
                loading={generating}
                icon={<Play size={15} />}
                onClick={handleGenerate}
                variant="success"
              >
                Chốt lương
              </Btn>
            )}
          </>
        }
      />

      {/* Employee view - personal payslip */}
      {!isHR && (
        loading ? (
          <Card className="flex justify-center py-10">
            <Spinner size={28} className="text-gray-400" />
          </Card>
        ) : myPayroll ? (
          <Card>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-700 text-lg text-gray-900">{MONTHS[month - 1]} {year}</h3>
                <p className="text-sm text-gray-400 mt-0.5">Phiếu lương cá nhân</p>
              </div>
              <Badge color="green">Đã chốt</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Lương cơ bản", value: formatCurrency(myPayroll.LUONGCOBAN || myPayroll.LuongCoBan) },
                { label: "Phụ cấp", value: formatCurrency(myPayroll.PHUCAP || myPayroll.PhuCap) },
                { label: "Ngày công", value: `${myPayroll.SONGAYCONGTHUCTE || myPayroll.SoNgayCongThucTe || 0} ngày` },
                { label: "Thưởng", value: formatCurrency(myPayroll.THUONG || myPayroll.Thuong || 0) },
                { label: "Khấu trừ BH", value: formatCurrency(myPayroll.KHAUTRUBH || myPayroll.KhauTruBH || 0) },
                { label: "Thực nhận", value: formatCurrency(myPayroll.TONGLUONG || myPayroll.TongLuong), highlight: true },
              ].map(({ label, value, highlight }) => (
                <div key={label} className={`rounded-xl p-4 ${highlight ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
                  <p className={`text-xs font-500 ${highlight ? "text-white/60" : "text-gray-500"}`}>{label}</p>
                  <p className={`text-lg font-700 mt-1 ${highlight ? "text-white" : "text-gray-900"}`}>{value}</p>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card>
            <EmptyState
              icon={<Wallet size={48} />}
              title={`Chưa có phiếu lương ${MONTHS[month - 1]} ${year}`}
              description="Lương chưa được chốt cho tháng này"
            />
          </Card>
        )
      )}

      {/* HR view - full payroll table */}
      {isHR && (
        loading ? (
          <Card padding={false}>
            <table className="data-table">
              <thead><tr><th>Mã NV</th><th>Họ tên</th><th>Ngày công</th><th>Lương CB</th><th>Thưởng</th><th>Khấu trừ</th><th>Tổng nhận</th><th></th></tr></thead>
              <tbody><SkeletonRows cols={8} rows={8} /></tbody>
            </table>
          </Card>
        ) : payroll.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Wallet size={48} />}
              title={`Chưa chốt lương ${MONTHS[month - 1]} ${year}`}
              description="Nhấn nút Chốt lương để tự động tính lương tháng này"
            />
          </Card>
        ) : (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã NV</th>
                    <th>Họ tên</th>
                    <th>Ngày công</th>
                    <th>Lương cơ bản</th>
                    <th>Phụ cấp</th>
                    <th>Thưởng</th>
                    <th>Khấu trừ BH</th>
                    <th className="text-right">Tổng thực nhận</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((r) => (
                    <tr key={r.MABL || r.MaBl}>
                      <td className="font-600 text-xs">{r.MANV || r.MaNV}</td>
                      <td className="font-600">{r.HOTEN || r.HoTen}</td>
                      <td>{r.SONGAYCONGTHUCTE || r.SoNgayCongThucTe || 0}</td>
                      <td className="text-gray-600">{formatCurrency(r.LUONGCOBAN || r.LuongCoBan)}</td>
                      <td className="text-gray-600">{formatCurrency(r.PHUCAP || r.PhuCap || 0)}</td>
                      <td className="text-emerald-600">{formatCurrency(r.THUONG || r.Thuong || 0)}</td>
                      <td className="text-red-500">{formatCurrency(r.KHAUTRUBH || r.KhauTruBH || 0)}</td>
                      <td className="text-right font-700 text-gray-900">{formatCurrency(r.TONGLUONG || r.TongLuong)}</td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setModal({ type: "payslip", data: r })}
                            className="text-xs text-gray-400 hover:text-gray-700 hover:underline"
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => setModal({ type: "update", data: r })}
                            className="text-xs text-gray-400 hover:text-gray-700 ml-2"
                          >
                            <Edit3 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-900">
                    <td colSpan={7} className="p-4 text-sm font-700 text-white">Tổng ngân sách tháng</td>
                    <td className="p-4 text-right font-800 text-white">{formatCurrency(totalBudget)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        )
      )}

      <UpdatePayrollModal
        isOpen={modal.type === "update"}
        onClose={() => setModal({ type: "", data: null })}
        record={modal.data}
        onSuccess={fetchPayroll}
      />
      <PayslipModal
        isOpen={modal.type === "payslip"}
        onClose={() => setModal({ type: "", data: null })}
        data={modal.data}
      />
    </div>
  );
};

export default PayrollPage;
