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
  "Admin": 4,
};

export const getUserLevel = (user) => {
  // handle lowercase (login) and uppercase (employee API)
  const role = user?.chuc_vu || user?.CHUCVU || user?.role || "";
  return ROLE_LEVELS[role] || 1;
};

// ─── Lấy email từ user object ─────────────────────────────────────────────────
export const getUserEmail = (user) =>
  user?.EMAIL || user?.Email || user?.email || "";
