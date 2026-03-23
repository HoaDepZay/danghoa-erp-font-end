import React, { ReactNode, CSSProperties } from "react";

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

// ── Avatar ────────────────────────────────────────────────────────────────────
export const Avatar = ({ name = "", size = "md" }: { name?: string, size?: "sm" | "md" | "lg" | "xl" }) => {
  const letter = name?.split(" ").pop()?.charAt(0)?.toUpperCase() || "?";
  const sizeClass = { sm: "avatar-sm", md: "avatar-md", lg: "avatar-lg", xl: "avatar-xl" }[size] || "avatar-md";
  return <div className={`avatar ${sizeClass}`}>{letter}</div>;
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
export const StatCard = ({ label, value, icon, trend }: { label: string, value: string | number | null, icon?: ReactNode, trend?: string }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div>
      <div className="stat-value">{value ?? "—"}</div>
      <div className="stat-label">{label}</div>
      {trend && <div style={{ fontSize: 11, color: "#10b981", fontWeight: 600, marginTop: 2 }}>{trend}</div>}
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
