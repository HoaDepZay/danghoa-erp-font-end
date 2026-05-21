// ─── Lấy MANV từ user object bất kể backend trả về key nào ──────────────────
// Backend login trả: { manv, hoten, email, role }  (lowercase)
// Backend employees trả: { MANV, HOTEN, EMAIL, CHUCVU }  (UPPERCASE)
export const getManv = (user) =>
  user?.MANV || user?.MaNV || user?.manv || user?.ma_nv || user?.MaVN || "";

// ─── Normalize response thành array ──────────────────────────────────────────
export const toArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (Array.isArray(val.data)) return val.data;
  if (Array.isArray(val.employees)) return val.employees;
  if (Array.isArray(val.projects)) return val.projects;
  if (Array.isArray(val.departments)) return val.departments;
  if (Array.isArray(val.messages)) return val.messages;
  if (Array.isArray(val.rooms)) return val.rooms;
  if (val.data && Array.isArray(val.data.messages)) return val.data.messages;
  if (val.data && Array.isArray(val.data.rooms)) return val.data.rooms;
  return [];
};

// ─── Lấy tên hiển thị từ user object ─────────────────────────────────────────
// Backend login: { hoten }  | Backend employees: { HOTEN }
export const getUserName = (user) =>
  user?.HoTen || user?.HOTEN || user?.hoten || user?.name || "Nhân viên";

// ─── Lấy giá trị payroll theo key (uppercase hoặc camelCase) ─────────────────
export const getPayValue = (payroll, key) => {
  if (!payroll) return 0;
  return payroll[key] ?? payroll[key.toUpperCase()] ?? 0;
};

// ─── Role level ───────────────────────────────────────────────────────────────
// Backend login: role = 'Quản lý' | Backend employees: CHUCVU = 'Quản lý'
export const ROLE_LEVELS = {
  "Cộng tác viên": 1,
  "Nhân viên": 2,
  "Quản lý": 3,
  Admin: 4,
};

const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const ROLE_LEVELS_NORMALIZED = {
  "cong tac vien": 1,
  "nhan vien": 2,
  "quan ly": 3,
  admin: 4,
};

const ROLE_LABELS = {
  "cong tac vien": "Cộng tác viên",
  "nhan vien": "Nhân viên",
  "quan ly": "Quản lý",
  admin: "Admin",
};

export const getUserLevel = (user) => {
  // handle lowercase (login) and uppercase (employee API)
  const role = user?.chuc_vu || user?.CHUCVU || user?.role || "";
  return ROLE_LEVELS[role] || ROLE_LEVELS_NORMALIZED[normalizeRole(role)] || 1;
};

export const getDisplayRole = (user) => {
  const role = user?.chuc_vu || user?.CHUCVU || user?.role || "";
  if (!role) return "Nhân viên";
  return ROLE_LABELS[normalizeRole(role)] || role;
};

// ─── Lấy email từ user object ─────────────────────────────────────────────────
export const getUserEmail = (user) =>
  user?.EMAIL || user?.Email || user?.email || "";

// ─── Lấy mã phòng ban từ user object ──────────────────────────────────────────
export const getMaPhg = (user) =>
  user?.MAPHG || user?.MaPhg || user?.maphg || user?.ma_phg || "";

