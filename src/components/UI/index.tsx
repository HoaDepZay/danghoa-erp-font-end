import React, { ReactNode, CSSProperties } from "react";
export { default as Drawer } from "./Drawer";
export { default as SharedCalendar } from "./SharedCalendar";

// ── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 20, color = "currentColor" }: { size?: number, color?: string }) => (
  <span
    className="spinner"
    style={{ width: size, height: size, color }}
    aria-label="loading"
  />
);

// ── Btn ───────────────────────────────────────────────────────────────────────
export interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}

export const Btn: React.FC<BtnProps> = ({
  children, onClick, type = "button", disabled = false,
  loading = false, variant = "primary", size = "md", className = "", icon, ...rest
}) => {
  const variantClass = {
    primary: "btn-primary", secondary: "btn-secondary",
    danger: "btn-danger", ghost: "btn-ghost", success: "btn-success",
  }[variant] || "btn-primary";

  const sizeClass = { sm: "btn-sm", md: "", lg: "btn-lg" }[size] || "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      {...rest}
    >
      {loading ? <Spinner size={14} /> : icon}
      {children}
    </button>
  );
};

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ children, color = "gray" }: { children: ReactNode, color?: string }) => {
  const colorClass: Record<string, string> = {
    gray: "badge-gray", black: "badge-black", green: "badge-green",
    red: "badge-red", blue: "badge-blue", yellow: "badge-yellow", purple: "badge-purple",
    orange: "badge-yellow",  // reuse yellow styles for orange
  };
  return <span className={`badge ${colorClass[color] || "badge-gray"}`}>{children}</span>;

};

// ── Color Hashing Helpers ───────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "#FEE2E2", text: "#991B1B" }, // Red
  { bg: "#FEF3C7", text: "#92400E" }, // Amber
  { bg: "#D1FAE5", text: "#065F46" }, // Emerald
  { bg: "#DBEAFE", text: "#1E40AF" }, // Blue
  { bg: "#E0F2FE", text: "#075985" }, // Sky
  { bg: "#F3E8FF", text: "#6B21A8" }, // Purple
  { bg: "#FCE7F3", text: "#9D174D" }, // Pink
  { bg: "#E0E7FF", text: "#3730A3" }, // Indigo
  { bg: "#ECFDF5", text: "#047857" }, // Teal
  { bg: "#E2E8F0", text: "#1E293B" }, // Slate
];

const stringToColorIndex = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % AVATAR_COLORS.length;
};

// ── Avatar ────────────────────────────────────────────────────────────────────
export const Avatar = ({ name = "", size = "md" }: { name?: string, size?: "sm" | "md" | "lg" | "xl" }) => {
  const letter = name?.split(" ").pop()?.charAt(0)?.toUpperCase() || "?";
  const sizeClass = { sm: "avatar-sm", md: "avatar-md", lg: "avatar-lg", xl: "avatar-xl" }[size] || "avatar-md";
  const colorIndex = name ? stringToColorIndex(name) : 0;
  const colors = AVATAR_COLORS[colorIndex];
  return (
    <div 
      className={`avatar ${sizeClass}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {letter}
    </div>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = "", padding = true, style }: { children: ReactNode, className?: string, padding?: boolean, style?: CSSProperties }) => (
  <div
    className={`card ${className}`.trim()}
    style={style}
  >
    <div className={padding ? "card-body" : ""}>{children}</div>
  </div>
);

// ── SectionHeader ─────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, actions }: { title: string, subtitle?: string, actions?: ReactNode }) => (
  <div className="section-header">
    <div>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {actions && <div className="section-header-actions">{actions}</div>}
  </div>
);

// ── FormField ─────────────────────────────────────────────────────────────────
export const FormField = ({ label, children, error }: { label?: string, children: ReactNode, error?: string }) => (
  <div className="form-field">
    {label && <label className="form-label">{label}</label>}
    {children}
    {error && <p className="form-error">{error}</p>}
  </div>
);

// ── EmptyState ────────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description }: { icon?: ReactNode, title: string, description?: string }) => (
  <div className="empty-state">
    <div className="icon">{icon}</div>
    <p className="title">{title}</p>
    {description && <p className="desc">{description}</p>}
  </div>
);

// ── SkeletonRows ──────────────────────────────────────────────────────────────
export const SkeletonRows = ({ cols = 4, rows = 5 }: { cols?: number, rows?: number }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} style={{ padding: "14px 16px" }}>
            <span className="skeleton" style={{ height: 14, display: "block", borderRadius: 4 }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

// ── StatCard ──────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, trend, color }: { label: string, value: string | number | null, icon?: ReactNode, trend?: string, color?: string }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
      <div className="stat-icon" style={color ? { backgroundColor: `${color}20`, color: color } : {}}>{icon}</div>
      {trend && <div style={{ fontSize: 12, color: "var(--secondary)", fontWeight: 600 }}>{trend}</div>}
    </div>
    <div style={{ marginTop: 4 }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? "—"}</div>
    </div>
  </div>
);

// ── Pagination ────────────────────────────────────────────────────────────────
export const Pagination = ({ page, totalPages, onPageChange }: { page: number, totalPages: number, onPageChange: (p: number) => void }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <Btn variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ← Trước
      </Btn>
      <span>{page} / {totalPages}</span>
      <Btn variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Sau →
      </Btn>
    </div>
  );
};

// ── Divider ───────────────────────────────────────────────────────────────────
export const Divider = ({ style }: { style?: CSSProperties }) => (
  <hr style={{ border: "none", borderTop: "1px solid #ebebeb", ...style }} />
);
