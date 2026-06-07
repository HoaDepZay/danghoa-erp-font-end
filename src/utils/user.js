import { getProp } from "./helpers";

// ─── Lấy MANV từ user object bất kể backend trả về key nào ──────────────────
// Backend login trả: { MA_NV, HO_TEN, EMAIL, role }  (lowercase)
// Backend employees trả: { MANV, HOTEN, EMAIL, CHUCVU }  (UPPERCASE)
export const getManv = (user) =>
  user?.MANV || user?.MaNV || user?.MA_NV || user?.ma_nv || user?.MaVN || "";

// ─── Normalize response thành array ──────────────────────────────────────────
export const toArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;

  const data = getProp(val, "data");
  if (Array.isArray(data)) return data;

  const employees = getProp(val, "employees");
  if (Array.isArray(employees)) return employees;

  const projects = getProp(val, "projects");
  if (Array.isArray(projects)) return projects;

  const departments = getProp(val, "departments");
  if (Array.isArray(departments)) return departments;

  const messages = getProp(val, "messages");
  if (Array.isArray(messages)) return messages;

  const rooms = getProp(val, "rooms");
  if (Array.isArray(rooms)) return rooms;

  if (data) {
    const dataMessages = getProp(data, "messages");
    if (Array.isArray(dataMessages)) return dataMessages;

    const dataRooms = getProp(data, "rooms");
    if (Array.isArray(dataRooms)) return dataRooms;
  }

  return [];
};

// ─── Lấy tên hiển thị từ user object ─────────────────────────────────────────
// Backend login: { HO_TEN }  | Backend employees: { HOTEN }
export const getUserName = (user) =>
  user?.HoTen || user?.HOTEN || user?.HO_TEN || user?.name || "Nhân viên";

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
  "Nhân viên mới": 1,  // alias
  "Quản lý": 3,
  Admin: 4,
  admin: 4,  // lowercase từ backend login
  "Giám đốc": 4,
};

const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d");

const ROLE_LEVELS_NORMALIZED = {
  "cong tac vien": 1,
  "nhan vien": 2,
  "nhan vien moi": 1,
  "quan ly": 3,
  admin: 4,
  giamdoc: 4,
};

const ROLE_LABELS = {
  "cong tac vien": "Cộng tác viên",
  "nhan vien": "Nhân viên",
  "quan ly": "Quản lý",
  admin: "Admin",
  giamdoc: "Giám đốc",
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

// ─── Lấy EMAIL từ user object ─────────────────────────────────────────────────
export const getUserEmail = (user) =>
  user?.EMAIL || user?.Email || user?.EMAIL || "";

// ─── Lấy mã phòng ban từ user object ──────────────────────────────────────────
export const getMaPhg = (user) =>
  user?.MAPHG || user?.MaPhg || user?.MA_PHG || user?.ma_phg || "";

