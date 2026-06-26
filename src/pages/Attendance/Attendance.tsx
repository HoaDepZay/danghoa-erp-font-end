import React, { useState, useEffect, useCallback } from "react";
import {
  LogIn, LogOut, Clock, CheckCircle, XCircle, Calendar,
  User, RefreshCw, Users, Search,
  AlarmClock, CalendarDays
} from "lucide-react";
import { api } from "../../services/api";
import { getManv, getUserName, getUserLevel } from "../../utils/user";
import { SectionHeader, Card, Spinner, Badge, Btn, EmptyState } from "../../components/UI/index";
// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Status = "idle" | "loading" | "success" | "error";
type FilterPeriod = "today" | "week" | "month" | "year" | "all";

interface CheckRecord {
  type: "in" | "out";
  timestamp: string;
  status: "success" | "error";
  message: string;
}

interface AttendanceRecord {
  MA_NV?: string;
  HO_TEN?: string;
  checkIn?: string;
  checkOut?: string;
  CHECK_IN?: string;
  CHECK_OUT?: string;
  date?: string;
  ngay?: string;
  soGio?: number;
  status?: string;
  TRANG_THAI?: string;
  [key: string]: any;
}

interface EmployeeInfo {
  maNV: string;
  HO_TEN: string;
  phongBan: string;
  CHUC_VU: string;
  EMAIL: string;
  avatar?: string;
}

// Cache toàn cục để tránh re-fetch khi switch tab
const _empCache: Record<string, EmployeeInfo> = {};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (iso: string | undefined | null, mode: "time" | "date" | "datetime" = "time") => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;

  // Backend lưu giờ vào/ra ở dạng ISO UTC (vd: "1970-01-01T16:34:48.201Z")
  // Phải dùng getUTC*() để tránh trình duyệt tự cộng offset UTC+7
  if (mode === "time") {
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    const ss = String(d.getUTCSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }
  if (mode === "date") {
    // Ngày thường là "2026-05-19T00:00:00.000Z" — cũng dùng UTC để đúng ngày
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
    const yy = d.getUTCFullYear();
    return `${dd}/${mo}/${yy}`;
  }
  // datetime
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yy = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${dd}/${mo}/${yy} ${hh}:${mm}`;
};

// Lấy mảng từ response bất kể cấu trúc
const normalizeAttendanceList = (res: any): AttendanceRecord[] => {
  // Thử tất cả cột data có thể
  const candidates = [
    res?.data?.data,
    res?.data?.records,
    res?.data?.attendance,
    res?.data?.list,
    res?.data?.rows,
    res?.data,
    res?.records,
    res?.attendance,
    res?.data,
    res,
  ];
  for (const c of candidates) {
    if (Array.isArray(c) && c.length >= 0) {
      // Log cấu trúc bản ghi đầu tiên để debug
      if (c.length > 0) {
        console.log("🔍 [Attendance] Raw record sample:", JSON.stringify(c[0], null, 2));
      }
      return c;
    }
  }
  console.warn("⚠️ [Attendance] Could not parse list from:", res);
  return [];
};

// Field getters mở rộng – cover mọi convention: camelCase, UPPERCASE, snake_case, Tiếng Việt
// Kết hợp date + time khi backend trả riêng (vd: Ngay="2026-05-19", GioVao="08:15:00")
const combineDateTime = (date: string | undefined, time: string | undefined): string | undefined => {
  if (!time) return undefined;
  if (!date) return time;
  // Nếu time là dạng "HH:MM" hoặc "HH:MM:SS" thì ghép với date
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(time)) return `${date}T${time}`;
  return time; // đã là ISO đầy đủ
};

const getCheckIn = (r: AttendanceRecord) => {
  const date = r.Ngay || r.ngay || r.NGAY || r.date || r.Date;
  const raw =
    r.checkIn || r.CHECK_IN || r.checkin || r.CheckIn
    || r.thoiGianVao || r.ThoiGianVao || r.THOIGIANVAO || r.thoi_gian_vao
    || r.gioVao || r.GioVao || r.GIOVAO || r.GIO_VAO || r.gio_vao
    || r.timeIn || r.time_in || r.TimeIn || r.TIMEIN
    || (r.loai === "check-in" || r.loai === "vào" || r.type === "in" || r.loaiChamCong === "IN" ? r.timestamp || r.THOI_GIAN || r.THOI_GIAN : undefined)
    || r.vao || r.VAO;
  return combineDateTime(date, raw);
};

const getCheckOut = (r: AttendanceRecord) => {
  const date = r.Ngay || r.ngay || r.NGAY || r.date || r.Date;
  const raw =
    r.checkOut || r.CHECK_OUT || r.checkout || r.CheckOut
    || r.thoiGianRa || r.ThoiGianRa || r.THOIGIANRA || r.thoi_gian_ra
    || r.gioRa || r.GioRa || r.GIORA || r.GIO_RA || r.gio_ra
    || r.timeOut || r.time_out || r.TimeOut || r.TIMEOUT
    || (r.loai === "check-out" || r.loai === "ra" || r.type === "out" || r.loaiChamCong === "OUT" ? r.timestamp || r.THOI_GIAN || r.THOI_GIAN : undefined)
    || r.ra || r.RA;
  return combineDateTime(date, raw);
};

const getDate = (r: AttendanceRecord) =>
  r.date || r.Date || r.DATE
  || r.ngay || r.Ngay || r.NGAY
  || r.ngayLamViec || r.NgayLamViec || r.NGAYLAMVIEC || r.ngay_lam_viec
  || r.ngayCC || r.NgayCC || r.NGAYCC
  || r.workDate || r.work_date || r.WorkDate
  || r.THOI_GIAN || r.THOI_GIAN || r.timestamp
  || getCheckIn(r); // fallback to checkIn timestamp

const getManvField = (r: AttendanceRecord) =>
  r.maNV || r.MA_NV || r.MA_NV || r.MA_NV || r.ma_nv
  || r.maNhanVien || r.MaNhanVien || r.MANHANVIEN
  || r.employeeId || r.EmployeeId || r.employee_id || r.EMPLOYEE_ID
  || r.NhanVien_ID || r.nhanVienId
  || r.id || r.ID;

const getHoTen = (r: AttendanceRecord) =>
  r.HO_TEN || r.HO_TEN || r.HO_TEN || r.HO_TEN || r.ho_ten
  || r.tenNhanVien || r.TenNhanVien || r.TENNHANVIEN
  || r.fullName || r.full_name || r.FullName || r.FULLNAME
  || r.name || r.Name || r.NAME;

const getStatus = (r: AttendanceRecord) =>
  r.status || r.Status || r.STATUS
  || r.TRANG_THAI || r.TRANG_THAI || r.TRANG_THAI || r.trang_thai
  || r.loai || r.Loai || r.LOAI;


// ─── normalize EmployeeInfo từ API response ────────────────────────────────
const normalizeEmployee = (d: any): EmployeeInfo => {
  console.log("👤 [Employee] Raw data:", JSON.stringify(d, null, 2));
  return {
    maNV: d?.MA_NV || d?.MA_NV || d?.MA_NV || d?.maNV || d?.maNhanVien || "",
    HO_TEN: d?.HO_TEN || d?.HO_TEN || d?.HO_TEN || d?.tenNhanVien || d?.TenNhanVien || d?.fullName || d?.name || "",
    // Phèng ban: thường phải join từ bảng phòng ban, thử tất cả keys có thể
    phongBan: d?.TEN_PB || d?.TEN_PB || d?.TEN_PB || d?.tenPB
      || d?.phongBan || d?.PhongBan || d?.PHONGBAN
      || d?.tenPhongBan || d?.TenPhongBan
      || d?.departmentName || d?.DepartmentName || d?.department_name
      || d?.department?.TEN_PB || d?.department?.TEN_PB || d?.department?.name
      || d?.phongHo?.TEN_PB || d?.phongHo?.TEN_PB
      || "",
    CHUC_VU: d?.CHUC_VU || d?.CHUC_VU || d?.CHUC_VU || d?.chuc_vu
      || d?.CHUC_VU || d?.position || d?.Position
      || d?.role || d?.Role
      || "",
    EMAIL: d?.EMAIL || d?.EMAIL || d?.EMAIL || "",
  };
};

const PERIOD_LABELS: Record<FilterPeriod, string> = {
  today: "Hôm nay",
  week: "Tuần này",
  month: "Tháng này",
  year: "Năm nay",
  all: "Tất cả",
};

// ─── Helper: tính fromDate / toDate theo period ────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);
const getDateRange = (period: FilterPeriod): { fromDate?: string; toDate?: string } => {
  const toDate = todayStr();
  if (period === "today") return { fromDate: toDate, toDate };
  if (period === "week") {
    const d = new Date(); d.setDate(d.getDate() - 6);
    return { fromDate: d.toISOString().slice(0, 10), toDate };
  }
  if (period === "month") {
    const d = new Date(); d.setDate(1);
    return { fromDate: d.toISOString().slice(0, 10), toDate };
  }
  if (period === "year") {
    const d = new Date(new Date().getFullYear(), 0, 1);
    return { fromDate: d.toISOString().slice(0, 10), toDate };
  }
  return {}; // "all" — không truyền params, lấy toàn bộ
};

// ─────────────────────────────────────────────────────────────────────────────
// RealtimeClock
// ─────────────────────────────────────────────────────────────────────────────
const RealtimeClock: React.FC = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="attendance-clock">
      <div className="clock-time">
        {now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </div>
      <div className="clock-date">
        {now.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CheckButton
// ─────────────────────────────────────────────────────────────────────────────
const CheckButton: React.FC<{ type: "in" | "out"; loading: boolean; onClick: () => void }> = ({ type, loading, onClick }) => {
  const isIn = type === "in";
  return (
    <Btn
      className={`attendance-btn ${isIn ? "btn-checkin" : "btn-checkout"}`}
      onClick={onClick}
      disabled={loading}
      id={isIn ? "btn-check-in" : "btn-check-out"}
    >
      {loading ? <Spinner size={22} /> : isIn ? <LogIn size={22} /> : <LogOut size={22} />}
      <span>{loading ? "Đang xử lý..." : isIn ? "Check In" : "Check Out"}</span>
    </Btn>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ResultBanner
// ─────────────────────────────────────────────────────────────────────────────
const ResultBanner: React.FC<{ record: CheckRecord | null; onDismiss: () => void }> = ({ record, onDismiss }) => {
  useEffect(() => {
    if (!record) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [record, onDismiss]);
  if (!record) return null;
  const ok = record.status === "success";
  return (
    <div className={`attendance-result ${ok ? "result-success" : "result-error"} animate-slide-in`}>
      {ok ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <div className="result-text">
        <p className="result-title">{record.type === "in" ? "Check In" : "Check Out"} {ok ? "thành công!" : "thất bại"}</p>
        <p className="result-msg">{record.message}</p>
        {ok && record.timestamp && (
          <p className="result-time"><Clock size={12} /> {fmt(record.timestamp, "time")} · {fmt(record.timestamp, "date")}</p>
        )}
      </div>
      <Btn className="result-close" onClick={onDismiss}>✕</Btn>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PeriodSelector
// ─────────────────────────────────────────────────────────────────────────────
const PeriodSelector: React.FC<{ value: FilterPeriod; onChange: (v: FilterPeriod) => void; showAll?: boolean }> = ({ value, onChange, showAll = true }) => {
  const periods: FilterPeriod[] = showAll ? ["today", "week", "month", "year", "all"] : ["today", "week", "month", "year"];
  return (
    <div className="period-selector">
      {periods.map((p) => (
        <Btn
          key={p}
          className={`period-btn${value === p ? " active" : ""}`}
          onClick={() => onChange(p)}
        >
          {PERIOD_LABELS[p]}
        </Btn>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string | undefined; checkIn: string | undefined; checkOut: string | undefined }> = ({ status, checkIn, checkOut }) => {
  const s = (status || "").toLowerCase();
  if (s.includes("đầy đủ") || s.includes("full") || (checkIn && checkOut)) return <Badge color="green">Đầy đủ</Badge>;
  if (s.includes("vắng") || s.includes("absent")) return <Badge color="red">Vắng</Badge>;
  if (s.includes("muộn") || s.includes("late")) return <Badge color="yellow">Muộn</Badge>;
  if (checkIn && !checkOut) return <Badge color="blue">Đang làm</Badge>;
  return <Badge color="gray">{status || "N/A"}</Badge>;
};

// ─────────────────────────────────────────────────────────────────────────────
// AttendanceTable – dùng cho cả 2 nhóm
// ─────────────────────────────────────────────────────────────────────────────
const AttendanceTable: React.FC<{ data: AttendanceRecord[]; loading: boolean; showEmployee?: boolean }> = ({ data, loading, showEmployee = false }) => {
  if (loading) return (
    <div className="at-loading"><Spinner size={28} /><span>Đang tải dữ liệu...</span></div>
  );
  if (!data.length) return (
    <EmptyState icon={<CalendarDays size={40} />} title="Không có dữ liệu" description="Chưa có bản ghi chấm công trong khoảng thời gian này" />
  );
  return (
    <div className="at-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            {showEmployee && <><th>Mã NV</th><th>Họ tên</th></>}
            <th>Ngày</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => {
            const ci = getCheckIn(r);
            const co = getCheckOut(r);
            const d = getDate(r);
            return (
              <tr key={i}>
                <td style={{ color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                {showEmployee && (
                  <>
                    <td><span className="at-MA_NV">{getManvField(r)}</span></td>
                    <td className="at-name">{getHoTen(r) || "—"}</td>
                  </>
                )}
                <td className="at-date">{d ? fmt(d, "date") : "—"}</td>
                <td>
                  {ci ? (
                    <span className="at-time at-in"><LogIn size={12} />{fmt(ci, "time")}</span>
                  ) : <span className="at-null">—</span>}
                </td>
                <td>
                  {co ? (
                    <span className="at-time at-out"><LogOut size={12} />{fmt(co, "time")}</span>
                  ) : <span className="at-null">—</span>}
                </td>
                <td><StatusBadge status={getStatus(r)} checkIn={ci} checkOut={co} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SummaryStats
// ─────────────────────────────────────────────────────────────────────────────
const SummaryStats: React.FC<{ data: AttendanceRecord[] }> = ({ data }) => {
  const total = data.length;
  const hasCI = data.filter(r => !!getCheckIn(r)).length;
  const hasBoth = data.filter(r => !!getCheckIn(r) && !!getCheckOut(r)).length;
  const statItems = [
    { label: "Tổng bản ghi", value: total, icon: <CalendarDays size={18} />, color: "#111" },
    { label: "Có Check In", value: hasCI, icon: <LogIn size={18} />, color: "#10b981" },
    { label: "Đầy đủ", value: hasBoth, icon: <CheckCircle size={18} />, color: "#3b82f6" },
    { label: "Chưa Check Out", value: hasCI - hasBoth, icon: <AlarmClock size={18} />, color: "#f59e0b" },
  ];
  return (
    <div className="at-stats-grid">
      {statItems.map(({ label, value, icon, color }) => (
        <div key={label} className="at-stat-card">
          <div className="at-stat-icon" style={{ background: color + "1a", color }}>{icon}</div>
          <div>
            <div className="at-stat-value" style={{ color }}>{value}</div>
            <div className="at-stat-label">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Module 1 – Employee History (Nhân viên xem lịch sử của chính họ)
// ─────────────────────────────────────────────────────────────────────────────
const EmployeeHistoryModule: React.FC<{ MA_NV: string }> = ({ MA_NV }) => {
  const [period, setPeriod] = useState<FilterPeriod>("today");
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [customDate, setCustomDate] = useState(new Date().toISOString().slice(0, 10));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchData = useCallback(async () => {
    if (!MA_NV) return;
    setLoading(true);
    try {
      const params = period !== "all" ? getDateRange(period) : undefined;
      const res = await api.getAttendanceEmployee(MA_NV, params);
      setData(normalizeAttendanceList(res));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [MA_NV, period]);

  const fetchCustomDate = useCallback(async () => {
    if (!MA_NV || !customDate) return;
    setLoading(true);
    try {
      const res = await api.getAttendanceEmployee(MA_NV, { fromDate: customDate, toDate: customDate });
      setData(normalizeAttendanceList(res));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [MA_NV, customDate]);

  useEffect(() => { if (!showDatePicker) fetchData(); }, [fetchData, showDatePicker]);

  return (
    <div className="at-module">
      <div className="at-module-header">
        <div className="at-module-title">
          <Clock size={16} />
          <span>Lịch sử chấm công</span>
          {!loading && data.length > 0 && <span className="at-badge">{data.length} bản ghi</span>}
        </div>
        <div className="at-module-actions">
          {showDatePicker ? (
            <div className="at-date-picker-row">
              <input
                type="date"
                className="form-input at-date-input"
                value={customDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={e => setCustomDate(e.target.value)}
              />
              <Btn size="sm" onClick={fetchCustomDate} loading={loading}>Xem</Btn>
              <Btn size="sm" variant="secondary" onClick={() => { setShowDatePicker(false); }}>Hủy</Btn>
            </div>
          ) : (
            <Btn className="at-date-toggle" onClick={() => setShowDatePicker(true)}>
              <Calendar size={14} /> Chọn ngày
            </Btn>
          )}
          <Btn className="at-refresh" onClick={fetchData} disabled={loading} title="Làm mới">
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </Btn>
        </div>
      </div>

      {!showDatePicker && (
        <PeriodSelector value={period} onChange={p => { setPeriod(p); setShowDatePicker(false); }} />
      )}

      {data.length > 0 && <SummaryStats data={data} />}

      <AttendanceTable data={data} loading={loading} showEmployee={false} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AdminAttendanceTable – bảng riêng cho admin, enrich employee info
// ─────────────────────────────────────────────────────────────────────────────
const AdminAttendanceTable: React.FC<{
  data: AttendanceRecord[];
  empMap: Record<string, EmployeeInfo>;
  loading: boolean;
  enriching: boolean;
}> = ({ data, empMap, loading, enriching }) => {
  if (loading) return (
    <div className="at-loading"><Spinner size={28} /><span>Đang tải dữ liệu...</span></div>
  );
  if (!data.length) return (
    <EmptyState icon={<CalendarDays size={40} />} title="Không có dữ liệu" description="Chưa có bản ghi chấm công trong khoảng thời gian này" />
  );

  return (
    <div className="at-table-wrap">
      {enriching && (
        <div className="at-enrich-bar">
          <Spinner size={12} />
          <span>Đang tải thông tin nhân viên...</span>
        </div>
      )}
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Mã NV</th>
            <th>Họ và tên</th>
            <th>Phòng ban</th>
            <th>Chức vụ</th>
            <th>Ngày</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => {
            const ci = getCheckIn(r);
            const co = getCheckOut(r);
            const d = getDate(r);
            const maNV = getManvField(r) || "";
            const emp = empMap[maNV];
            const HO_TEN = emp?.HO_TEN || getHoTen(r) || "—";
            const phongBan = emp?.phongBan || "—";
            const CHUC_VU = emp?.CHUC_VU || "—";
            return (
              <tr key={i}>
                <td style={{ color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                <td><span className="at-MA_NV">{maNV || "—"}</span></td>
                <td>
                  <div className="at-emp-cell">
                    <div className="at-emp-avatar">
                      {HO_TEN !== "—" ? HO_TEN.split(" ").pop()?.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <div className="at-emp-name">{HO_TEN}</div>
                      {emp?.EMAIL && <div className="at-emp-EMAIL">{emp.EMAIL}</div>}
                    </div>
                  </div>
                </td>
                <td>
                  {phongBan !== "—" ? (
                    <span className="at-dept-badge">{phongBan}</span>
                  ) : (
                    enriching ? <span className="at-skeleton-pill" /> : <span className="at-null">—</span>
                  )}
                </td>
                <td>
                  {CHUC_VU !== "—" ? (
                    <span className="at-role-text">{CHUC_VU}</span>
                  ) : (
                    enriching ? <span className="at-skeleton-pill" /> : <span className="at-null">—</span>
                  )}
                </td>
                <td className="at-date">{d ? fmt(d, "date") : "—"}</td>
                <td>
                  {ci ? (
                    <span className="at-time at-in"><LogIn size={12} />{fmt(ci, "time")}</span>
                  ) : <span className="at-null">—</span>}
                </td>
                <td>
                  {co ? (
                    <span className="at-time at-out"><LogOut size={12} />{fmt(co, "time")}</span>
                  ) : <span className="at-null">—</span>}
                </td>
                <td><StatusBadge status={getStatus(r)} checkIn={ci} checkOut={co} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Module 2 – Admin/Manager: Xem tất cả nhân viên
// ─────────────────────────────────────────────────────────────────────────────
const AdminHistoryModule: React.FC = () => {
  // Admin chỉ có thể xem theo ngày cụ thể (API: GET /attendance/:date)
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [empMap, setEmpMap] = useState<Record<string, EmployeeInfo>>({});
  const [search, setSearch] = useState("");

  // Sau khi có data, enrich thông tin nhân viên từ API
  const enrichEmployees = useCallback(async (records: AttendanceRecord[]) => {
    const uniqueMaNVs = [...new Set(records.map(r => getManvField(r)).filter(Boolean))] as string[];
    const missing = uniqueMaNVs.filter(id => !_empCache[id]);
    if (!missing.length) {
      const map: Record<string, EmployeeInfo> = {};
      uniqueMaNVs.forEach(id => { if (_empCache[id]) map[id] = _empCache[id]; });
      setEmpMap(map);
      return;
    }
    setEnriching(true);
    await Promise.allSettled(
      missing.map(async (maNV) => {
        try {
          const res = await api.getEmployee(maNV);
          const raw = res?.data?.data || res?.data || res;
          const info = normalizeEmployee(raw);
          if (info.maNV || info.HO_TEN) _empCache[maNV] = { ...info, maNV };
        } catch { /* bỏ qua */ }
      })
    );
    const map: Record<string, EmployeeInfo> = {};
    uniqueMaNVs.forEach(id => { if (_empCache[id]) map[id] = _empCache[id]; });
    setEmpMap(map);
    setEnriching(false);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAttendanceByDate(selectedDate);
      const list = normalizeAttendanceList(res);
      setData(list);
      enrichEmployees(list);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, enrichEmployees]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = search.trim()
    ? data.filter(r => {
        const maNV = getManvField(r) || "";
        const emp = empMap[maNV];
        const name = emp?.HO_TEN || getHoTen(r) || "";
        const dept = emp?.phongBan || "";
        const q = search.toLowerCase();
        return maNV.toLowerCase().includes(q) || name.toLowerCase().includes(q) || dept.toLowerCase().includes(q);
      })
    : data;

  return (
    <div className="at-module">
      <div className="at-module-header">
        <div className="at-module-title">
          <Users size={16} />
          <span>Tổng hợp chấm công toàn công ty</span>
          {!loading && data.length > 0 && <span className="at-badge">{filtered.length}/{data.length} bản ghi</span>}
        </div>
        <div className="at-module-actions">
          {/* Admin xem theo ngày cụ thể */}
          <div className="at-date-picker-row">
            <input
              type="date"
              className="form-input at-date-input"
              value={selectedDate}
              max={todayStr()}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
          <Btn className="at-refresh" onClick={fetchData} disabled={loading} title="Làm mới">
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </Btn>
        </div>
      </div>

      {data.length > 0 && <SummaryStats data={data} />}

      {/* Search */}
      <div className="at-search-row">
        <div className="at-search-box">
          <Search size={14} />
          <input
            className="at-search-input"
            placeholder="Tìm theo mã NV, tên, phòng ban..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <Btn className="at-search-clear" onClick={() => setSearch("")}>✕</Btn>}
        </div>
      </div>

      <AdminAttendanceTable data={filtered} empMap={empMap} loading={loading} enriching={enriching} />
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// Main Attendance Page
// ─────────────────────────────────────────────────────────────────────────────
export const Attendance: React.FC<{ user: any }> = ({ user }) => {
  const MA_NV = getManv(user);
  const userName = getUserName(user);
  const userLevel = getUserLevel(user);
  const isManager = userLevel >= 3;

  const [checkInStatus, setCheckInStatus] = useState<Status>("idle");
  const [checkOutStatus, setCheckOutStatus] = useState<Status>("idle");
  const [lastResult, setLastResult] = useState<CheckRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"mine" | "all">("mine");

  const handleCheckIn = useCallback(async () => {
    setCheckInStatus("loading");
    try {
      const res = await api.checkIn({ maNV: MA_NV });
      const data = res.data;
      const rec: CheckRecord = {
        type: "in",
        timestamp: data?.data?.timestamp || new Date().toISOString(),
        status: "success",
        message: data?.message || "Check-in thành công!",
      };
      setLastResult(rec);
      setCheckInStatus("success");
    } catch (err: any) {
      setLastResult({ type: "in", timestamp: new Date().toISOString(), status: "error", message: err.response?.data?.message || "Có lỗi xảy ra khi check-in." });
      setCheckInStatus("error");
    } finally {
      setTimeout(() => setCheckInStatus("idle"), 1500);
    }
  }, [MA_NV]);

  const handleCheckOut = useCallback(async () => {
    setCheckOutStatus("loading");
    try {
      const res = await api.checkOut({ maNV: MA_NV });
      const data = res.data;
      const rec: CheckRecord = {
        type: "out",
        timestamp: data?.data?.timestamp || new Date().toISOString(),
        status: "success",
        message: data?.message || "Check-out thành công!",
      };
      setLastResult(rec);
      setCheckOutStatus("success");
    } catch (err: any) {
      setLastResult({ type: "out", timestamp: new Date().toISOString(), status: "error", message: err.response?.data?.message || "Có lỗi xảy ra khi check-out." });
      setCheckOutStatus("error");
    } finally {
      setTimeout(() => setCheckOutStatus("idle"), 1500);
    }
  }, [MA_NV]);

  return (
    <div className="animate-fade-in attendance-page">
      <SectionHeader
        title="Chấm công"
        subtitle={`Mã nhân viên: ${MA_NV || "—"}`}
      />

      <ResultBanner record={lastResult} onDismiss={() => setLastResult(null)} />

      <div className="attendance-layout">
        {/* LEFT – Clock panel */}
        <div className="attendance-main">
          <Card>
            <div className="attendance-emp-info">
              <div className="emp-avatar"><User size={24} /></div>
              <div>
                <div className="emp-name">{userName}</div>
                <div className="emp-id">{MA_NV}</div>
              </div>
            </div>

            <RealtimeClock />

            <div className="attendance-actions">
              <CheckButton type="in" loading={checkInStatus === "loading"} onClick={handleCheckIn} />
              <CheckButton type="out" loading={checkOutStatus === "loading"} onClick={handleCheckOut} />
            </div>

            <p className="attendance-hint">
              <Clock size={12} /> Nhấn <strong>Check In</strong> khi bắt đầu và <strong>Check Out</strong> khi kết thúc ca
            </p>
          </Card>
        </div>

        {/* RIGHT – History modules */}
        <div className="attendance-history-panel">
          {/* Tabs – chỉ manager/admin mới thấy tab "Tất cả NV" */}
          {isManager && (
            <div className="at-tabs">
              <Btn
                className={`at-tab${activeTab === "mine" ? " active" : ""}`}
                onClick={() => setActiveTab("mine")}
              >
                <Clock size={14} /> Của tôi
              </Btn>
              <Btn
                className={`at-tab${activeTab === "all" ? " active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                <Users size={14} /> Toàn công ty
              </Btn>
            </div>
          )}

          <Card>
            {(!isManager || activeTab === "mine") && <EmployeeHistoryModule MA_NV={MA_NV} />}
            {isManager && activeTab === "all" && <AdminHistoryModule />}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
