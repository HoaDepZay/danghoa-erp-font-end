// ─── Toast ──────────────────────────────────────────────────────────────────
let _toastFn = null;
export const registerToast = (fn) => { _toastFn = fn; };
export const toast = {
  success: (msg) => _toastFn?.("success", msg),
  error: (msg) => _toastFn?.("error", msg),
  info: (msg) => _toastFn?.("info", msg),
};

// ─── Format Date ─────────────────────────────────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch { return dateStr; }
};

// ─── Format Currency ─────────────────────────────────────────────────────────
export const formatCurrency = (amount) => {
  if (amount == null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency", currency: "VND",
  }).format(amount);
};

// ─── Role Level ──────────────────────────────────────────────────────────────
export const ROLE_LEVELS = {
  "Cộng tác viên": 1,
  "Nhân viên": 2,
  "Quản lý": 3,
  "Admin": 4,
};
export const getRoleLevel = (chucvu) => ROLE_LEVELS[chucvu] || 1;

// ─── Export CSV ──────────────────────────────────────────────────────────────
export const exportToCsv = (filename, headers, rows) => {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) =>
        String(cell ?? "").includes(",") ? `"${cell}"` : (cell ?? "")
      ).join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// ─── Get Month/Year ──────────────────────────────────────────────────────────
export const getCurrentMonthYear = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};
