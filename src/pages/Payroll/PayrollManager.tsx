import React, { useState, useEffect, useCallback } from "react";
import {
  Users, Search, DollarSign, Clock, ChevronLeft, ChevronRight,
  LogIn, LogOut, CheckCircle, XCircle, CalendarDays, RefreshCw,
  AlertCircle,
} from "lucide-react";
import { api } from "../../services/api";
import { toast, formatCurrency } from "../../utils/helpers";
import {
  Btn, Card, SectionHeader, EmptyState, Badge, Spinner,
  SkeletonRows, Avatar, FormField,
} from "../../components/UI/index";
import Modal from "../../components/UI/Modal";
import { MONTHS } from "./usePayroll";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Employee {
  manv: string;
  hoten: string;
  email: string;
  chucvu?: string;
  tenpb?: string;
  luong?: number;
  [key: string]: any;
}

interface AttendanceRecord {
  macc?: string;
  giovao?: string;
  giora?: string;
  ngay?: string;
  trangthai?: string;
  [key: string]: any;
}

// ─── Field helpers ──────────────────────────────────────────────────────────────
const getManv = (e: Employee) => e?.manv || "";
const getHoTen = (e: Employee) => e?.hoten || "";
const getEmail = (e: Employee) => e?.email || "";
const getChucVu = (e: Employee) => e?.chucvu || "";
const getPhongBan = (e: Employee) => e?.tenpb || "";
const getLuong = (e: Employee) => e?.luong || 0;

const getCI = (r: AttendanceRecord) => r?.giovao || "";
const getCO = (r: AttendanceRecord) => r?.giora || "";
const getDate = (r: AttendanceRecord) => r?.ngay || "";
const getStatus = (r: AttendanceRecord) => r?.trangthai || "";

const fmt = (iso?: string, mode: "time" | "date" = "time") => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  if (mode === "time")
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const normalizeList = (res: any): any[] => {
  const candidates = [
    res?.data?.data, res?.data?.records, res?.data?.attendance,
    res?.data?.list, res?.data, res,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
};

// ─── Attendance status badge ────────────────────────────────────────────────────
const AttBadge: React.FC<{ ci?: string; co?: string; status?: string }> = ({ ci, co, status }) => {
  const s = (status || "").toLowerCase();
  if (s.includes("hoàn thành") || s.includes("đầy đủ") || s.includes("full") || (ci && co))
    return <Badge color="green">{status || "Đầy đủ"}</Badge>;
  if (s.includes("đang") || s.includes("in progress") || (ci && !co))
    return <Badge color="blue">{status || "Đang làm"}</Badge>;
  if (s.includes("muộn") || s.includes("late"))
    return <Badge color="yellow">{status || "Muộn"}</Badge>;
  if (s.includes("vắng") || s.includes("absent"))
    return <Badge color="red">{status || "Vắng"}</Badge>;
  if (ci && co) return <Badge color="green">Đầy đủ</Badge>;
  if (ci && !co) return <Badge color="blue">Đang làm</Badge>;
  return <Badge color="gray">{status || "Vắng"}</Badge>;
};

// ─── Attendance table inside modal ─────────────────────────────────────────────
const AttendanceTable: React.FC<{ data: AttendanceRecord[]; loading: boolean }> = ({ data, loading }) => {
  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
        <Spinner size={28} />
      </div>
    );
  if (!data.length)
    return (
      <EmptyState
        icon={<CalendarDays size={36} />}
        title="Chưa có dữ liệu chấm công"
        description="Nhân viên này chưa có bản ghi trong kỳ này"
      />
    );

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Ngày</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => {
            const ci = getCI(r);
            const co = getCO(r);
            const d = getDate(r);
            const st = getStatus(r);
            return (
              <tr key={r.MaCC ?? i}>
                <td style={{ color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                <td style={{ fontWeight: 500 }}>{d ? fmt(d, "date") : "—"}</td>
                <td>
                  {ci ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#10b981", fontWeight: 600, fontSize: 13 }}>
                      <LogIn size={12} /> {fmt(ci)}
                    </span>
                  ) : <span style={{ color: "#ccc" }}>—</span>}
                </td>
                <td>
                  {co ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#ef4444", fontWeight: 600, fontSize: 13 }}>
                      <LogOut size={12} /> {fmt(co)}
                    </span>
                  ) : <span style={{ color: "#ccc" }}>—</span>}
                </td>
                <td><AttBadge ci={ci} co={co} status={st} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── Payroll Result Card ────────────────────────────────────────────────────────
const PayrollResult: React.FC<{ data: any; month: number; year: number }> = ({ data, month, year }) => {
  if (!data) return null;
  const payslip = data.payslip || data;
  const thucLanh =
    payslip?.ThucLanh ?? payslip?.THUCLANH ?? payslip?.tongLuong ??
    payslip?.TongLuong ?? payslip?.TONGLUONG ?? data?.ThucLanh ?? 0;
  return (
    <div style={{
      borderRadius: 16, overflow: "hidden", border: "1.5px solid #d1fae5",
      marginTop: 16, animation: "fadeIn .3s ease",
    }}>
      <div style={{ background: "linear-gradient(135deg,#10b981,#059669)", padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle size={18} color="#fff" />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Chốt lương thành công</span>
        </div>
        <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,.8)", fontSize: 12 }}>
          {MONTHS[(month || 1) - 1]} / {year}
        </p>
      </div>
      <div style={{ padding: "14px 20px", background: "#f0fdf4" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#555" }}>Thực lãnh</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#059669" }}>
            {formatCurrency(thucLanh)}
          </span>
        </div>
        {data.thuong > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12 }}>
            <span style={{ color: "#888" }}>Thưởng đã tính</span>
            <span style={{ color: "#10b981", fontWeight: 600 }}>{formatCurrency(data.thuong)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Employee Payroll Modal ─────────────────────────────────────────────────────
const EmployeePayrollModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  month: number;
  year: number;
  onSuccess?: () => void;
}> = ({ isOpen, onClose, employee, month, year }) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [attLoading, setAttLoading] = useState(false);
  const [payslipData, setPayslipData] = useState<any>(null);
  const [payslipLoading, setPayslipLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"attendance" | "payslip">("attendance");

  const maNV = getManv(employee || {});

  // Fetch attendance theo tháng
  const fetchAttendance = useCallback(async () => {
    if (!maNV) return;
    setAttLoading(true);
    try {
      const fromDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const toDate = `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;
      const res = await api.getAttendanceEmployee(maNV, { fromDate, toDate });
      setAttendance(normalizeList(res));
    } catch { setAttendance([]); }
    finally { setAttLoading(false); }
  }, [maNV, month, year]);

  // Fetch phiếu lương
  const fetchPayslip = useCallback(async () => {
    if (!maNV) return;
    setPayslipLoading(true);
    try {
      const res = await api.getMyPayroll(maNV, year, month);
      const d = res.data?.data || res.data;
      setPayslipData(d || null);
    } catch { setPayslipData(null); }
    finally { setPayslipLoading(false); }
  }, [maNV, month, year]);

  useEffect(() => {
    if (isOpen && maNV) {
      setActiveTab("attendance");
      fetchAttendance();
      fetchPayslip();
    }
  }, [isOpen, maNV, fetchAttendance, fetchPayslip]);

  const fullPresent = attendance.filter(r => getCI(r) && getCO(r)).length;
  const hasCI = attendance.filter(r => !!getCI(r)).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <Btn variant="secondary" onClick={onClose}>Đóng</Btn>
        </div>
      }
    >
      {/* ── Employee header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        paddingBottom: 16, borderBottom: "1.5px solid #f0f0f0", marginBottom: 16,
      }}>
        <Avatar name={getHoTen(employee || {})} size="lg" />
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{getHoTen(employee || {})}</h3>
          <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>{maNV}</span>
            {getChucVu(employee || {}) && (
              <span style={{ fontSize: 12, color: "#555" }}>{getChucVu(employee || {})}</span>
            )}
            {getPhongBan(employee || {}) && (
              <span style={{
                fontSize: 11, padding: "2px 8px", borderRadius: 20,
                background: "#f0f0f0", color: "#555", fontWeight: 600,
              }}>{getPhongBan(employee || {})}</span>
            )}
          </div>
          {getLuong(employee || {}) > 0 && (
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#aaa" }}>
              Lương cơ bản: <strong style={{ color: "#111" }}>{formatCurrency(getLuong(employee || {}))}</strong>
            </p>
          )}
        </div>
        {/* Stats nhanh */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{
            textAlign: "center", padding: "8px 14px", borderRadius: 12,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
          }}>
            {payslipLoading ? <Spinner size={16} /> : (
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#10b981" }}>
                {payslipData?.giolamViec ?? "—"}
              </p>
            )}
            <p style={{ margin: "2px 0 0", fontSize: 10, color: "#888" }}>giờ / tháng</p>
          </div>
          <div style={{
            textAlign: "center", padding: "8px 14px", borderRadius: 12,
            background: "#f8f8f8", border: "1px solid #f0f0f0",
          }}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111" }}>
              {attLoading ? "—" : fullPresent}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 10, color: "#888" }}>ngày đủ</p>
          </div>
        </div>
      </div>

      {/* ── Kỳ lương ── */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "#f3f4f6", borderRadius: 8, padding: "4px 12px",
        fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 16,
      }}>
        <CalendarDays size={13} />
        Kỳ lương: {MONTHS[month - 1]} / {year}
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: "flex", gap: 0, borderBottom: "2px solid #f0f0f0",
        marginBottom: 20,
      }}>
        {[
          { key: "attendance", label: "Bảng chấm công", icon: <Clock size={14} /> },
          { key: "payslip", label: "Phiếu lương", icon: <DollarSign size={14} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 18px", border: "none", background: "none",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
              color: activeTab === tab.key ? "#111" : "#aaa",
              borderBottom: activeTab === tab.key ? "2px solid #111" : "2px solid transparent",
              marginBottom: -2, transition: "all .15s",
            }}
          >
            {tab.icon} {tab.label}
            {tab.key === "attendance" && !attLoading && attendance.length > 0 && (
              <span style={{
                fontSize: 10, padding: "1px 6px", borderRadius: 10,
                background: "#f0f0f0", color: "#666", fontWeight: 700,
              }}>
                {attendance.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Chấm công ── */}
      {activeTab === "attendance" && (
        <div>
          {!attLoading && attendance.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              {[
                { label: "Tổng bản ghi", value: attendance.length, color: "#111" },
                { label: "Đầy đủ", value: fullPresent, color: "#10b981" },
                { label: "Chỉ check-in", value: hasCI - fullPresent, color: "#f59e0b" },
                { label: "Vắng", value: attendance.length - hasCI, color: "#ef4444" },
              ].map(s => (
                <div key={s.label} style={{
                  flex: "1 1 80px", borderRadius: 12, padding: "10px 14px",
                  background: s.color + "0f", border: `1px solid ${s.color}22`,
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
          <AttendanceTable data={attendance} loading={attLoading} />
          {!attLoading && (
            <div style={{ textAlign: "right", marginTop: 10 }}>
              <button
                onClick={fetchAttendance}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 12, color: "#888", background: "none", border: "none",
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={12} /> Làm mới
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Phiếu lương ── */}
      {activeTab === "payslip" && (
        <div>
          {payslipLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <Spinner size={28} />
            </div>
          ) : payslipData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Header tổng quát */}
              <div style={{ background: "#111", borderRadius: 14, padding: "18px 20px", textAlign: "center" }}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>
                  Tổng thực lãnh tạm tính
                </p>
                <p style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0 }}>
                  {formatCurrency(payslipData.thucLanh ?? 0)}
                </p>
              </div>

              {/* Chi tiết các khoản */}
              <div style={{
                borderRadius: 14, border: "1.5px solid #f0f0f0", padding: "16px 18px",
                background: "#fdfdfd", display: "flex", flexDirection: "column", gap: 10,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
                  <span style={{ color: "#888" }}>Lương cơ bản</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(getLuong(employee || {}))}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
                  <span style={{ color: "#888" }}>Tổng giờ làm việc</span>
                  <span style={{ fontWeight: 600 }}>{payslipData.giolamViec ?? 0} giờ</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
                  <span style={{ color: "#888" }}>Phụ cấp</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(payslipData.phucap ?? 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
                  <span style={{ color: "#888" }}>Thưởng (OT)</span>
                  <span style={{ fontWeight: 600, color: "#10b981" }}>{formatCurrency(payslipData.thuong ?? 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
                  <span style={{ color: "#888" }}>Bảo hiểm xã hội (BHXH)</span>
                  <span style={{ fontWeight: 600, color: "#ef4444" }}>- {formatCurrency(payslipData.bhxh ?? 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
                  <span style={{ color: "#888" }}>Thuế TNCN</span>
                  <span style={{ fontWeight: 600, color: "#f59e0b" }}>- {formatCurrency(payslipData.thueTNCN ?? 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, paddingTop: 6 }}>
                  <span style={{ fontWeight: 700, color: "#111" }}>Thực lãnh thực tế</span>
                  <span style={{ fontWeight: 800, color: "#111" }}>{formatCurrency(payslipData.thucLanh ?? 0)}</span>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<DollarSign size={40} />}
              title="Chưa có thông tin lương"
              description="Không thể tải hoặc tính toán thông tin lương cho nhân viên này"
            />
          )}
        </div>
      )}
    </Modal>
  );
};

// ─── Employee List Card ─────────────────────────────────────────────────────────
const EmployeeCard: React.FC<{
  employee: Employee;
  onClick: () => void;
  isClosed?: boolean;
}> = ({ employee, onClick, isClosed }) => {
  const name = getHoTen(employee);
  const maNV = getManv(employee);
  const chucVu = getChucVu(employee);
  const phongBan = getPhongBan(employee);
  const luong = getLuong(employee);

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 14, border: "1.5px solid #f0f0f0", padding: "14px 16px",
        cursor: "pointer", background: "#fff", transition: "all .18s",
        display: "flex", alignItems: "center", gap: 14,
      }}
      className="payroll-emp-card"
    >
      <Avatar name={name} size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {name}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>{maNV}</span>
          {chucVu && <span style={{ fontSize: 11, color: "#555" }}>· {chucVu}</span>}
        </div>
        {phongBan && (
          <span style={{
            display: "inline-block", marginTop: 4, fontSize: 10,
            padding: "2px 7px", borderRadius: 20, background: "#f3f4f6", color: "#666", fontWeight: 600,
          }}>{phongBan}</span>
        )}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        {luong > 0 && (
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{formatCurrency(luong)}</div>
        )}
        {isClosed ? (
          <Badge color="green">Đã chốt</Badge>
        ) : (
          <Badge color="yellow">Tạm tính</Badge>
        )}
        <div style={{
          marginTop: 6, fontSize: 11, color: "#10b981", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end",
        }}>
          <DollarSign size={11} /> Phiếu lương
        </div>
      </div>
    </div>
  );
};

// ─── Month Navigator ────────────────────────────────────────────────────────────
const MonthNav: React.FC<{ month: number; year: number; onPrev: () => void; onNext: () => void }> = ({
  month, year, onPrev, onNext,
}) => (
  <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e0e0e0", borderRadius: 10, overflow: "hidden" }}>
    <button onClick={onPrev} style={{ padding: "6px 10px", border: "none", background: "#fff", cursor: "pointer", color: "#666", display: "flex" }}>
      <ChevronLeft size={16} />
    </button>
    <span style={{
      padding: "6px 14px", fontSize: 13, fontWeight: 600,
      minWidth: 120, textAlign: "center",
      borderLeft: "1.5px solid #e0e0e0", borderRight: "1.5px solid #e0e0e0", background: "#fff",
    }}>
      {MONTHS[month - 1]} {year}
    </span>
    <button onClick={onNext} style={{ padding: "6px 10px", border: "none", background: "#fff", cursor: "pointer", color: "#666", display: "flex" }}>
      <ChevronRight size={16} />
    </button>
  </div>
);

// ─── Main PayrollManager Page ───────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const PayrollManager: React.FC<{ user: any }> = ({ user: _user }) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Employee | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [closingMonth, setClosingMonth] = useState(false);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)) return;
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Load danh sách nhân viên
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getEmployees({ pageSize: 200 });
      const raw = res.data;
      const list: Employee[] = Array.isArray(raw) ? raw
        : Array.isArray(raw?.data) ? raw.data
        : [];
      setEmployees(list);
    } catch { toast.error("Không thể tải danh sách nhân viên!"); }
    finally { setLoading(false); }
  }, []);

  // Kiểm tra trạng thái chốt lương của tháng
  const fetchClosedStatus = useCallback(async () => {
    try {
      const res = await api.checkIfPayrollClosed(year, month);
      setIsClosed(!!res.data?.isClosed);
    } catch {
      setIsClosed(false);
    }
  }, [year, month]);

  const handleClosePayrollForMonth = async () => {
    if (!window.confirm(`Xác nhận chốt bảng lương cho toàn bộ công ty tháng ${month}/${year}? Thao tác này sẽ khóa dữ liệu lương của tháng này.`)) return;
    setClosingMonth(true);
    try {
      const res = await api.closePayrollForMonth(year, month);
      toast.success(res.data?.message || "Chốt lương thành công!");
      setIsClosed(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi chốt lương tháng!");
    } finally {
      setClosingMonth(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { fetchClosedStatus(); }, [fetchClosedStatus]);

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    return (
      getManv(e).toLowerCase().includes(q) ||
      getHoTen(e).toLowerCase().includes(q) ||
      getEmail(e).toLowerCase().includes(q) ||
      getPhongBan(e).toLowerCase().includes(q)
    );
  });

  const openModal = (emp: Employee) => {
    setSelected(emp);
    setModalOpen(true);
  };

  return (
    <div className="animate-fade-in">
      {/* Inline style for card hover */}
      <style>{`
        .payroll-emp-card:hover {
          border-color: #111 !important;
          box-shadow: 0 4px 20px rgba(0,0,0,.08);
          transform: translateY(-1px);
        }
      `}</style>

      <SectionHeader
        title="Tính lương"
        subtitle={isClosed ? `Kỳ lương Tháng ${month}/${year} đã khóa` : `Kỳ lương Tháng ${month}/${year} tạm tính`}
        actions={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <MonthNav month={month} year={year} onPrev={prevMonth} onNext={nextMonth} />
            {!isClosed ? (
              <Btn
                size="sm"
                variant="success"
                loading={closingMonth}
                icon={<DollarSign size={14} />}
                onClick={handleClosePayrollForMonth}
              >
                Chốt lương tháng
              </Btn>
            ) : (
              <Badge color="green">Đã chốt lương</Badge>
            )}
            <Btn size="sm" variant="secondary" icon={<RefreshCw size={14} />} onClick={() => { fetchEmployees(); fetchClosedStatus(); }}>
              Làm mới
            </Btn>
          </div>
        }
      />

      {/* Stats summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Tổng nhân viên", value: employees.length, icon: <Users size={18} />, color: "#111" },
          { label: "Đã chốt lương", value: isClosed ? employees.length : 0, icon: <CheckCircle size={18} />, color: "#10b981" },
          { label: "Chưa chốt (Tạm tính)", value: isClosed ? 0 : employees.length, icon: <XCircle size={18} />, color: "#f59e0b" },
        ].map(s => (
          <Card key={s.label} style={{ margin: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: s.color + "15", display: "flex", alignItems: "center",
                justifyContent: "center", color: s.color,
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="mb-4">
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
          <input
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Tìm theo tên, mã NV, phòng ban..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {/* Employee List */}
      <Card padding={false}>
        {loading ? (
          <div style={{ padding: 16 }}>
            <table className="data-table" style={{ width: "100%" }}>
              <tbody><SkeletonRows cols={1} rows={6} /></tbody>
            </table>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40 }}>
            <EmptyState icon={<Users size={40} />} title="Không tìm thấy nhân viên" description="Thử thay đổi từ khoá tìm kiếm" />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {filtered.map((emp, i) => {
              const maNV = getManv(emp);
              return (
                <div key={maNV || i} style={{
                  padding: "10px 16px",
                  borderBottom: i < filtered.length - 1 ? "1px solid #f5f5f5" : "none",
                }}>
                  <EmployeeCard
                    employee={emp}
                    onClick={() => openModal(emp)}
                    isClosed={isClosed}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal chi tiết chấm công + phiếu lương */}
      <EmployeePayrollModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null); }}
        employee={selected}
        month={month}
        year={year}
      />
    </div>
  );
};

export default PayrollManager;
