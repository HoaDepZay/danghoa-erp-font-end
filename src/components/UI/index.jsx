// Spinner
export const Spinner = ({ size = 20, className = "" }) => (
  <svg
    className={`animate-spin ${className}`}
    style={{ width: size, height: size }}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Btn primary
export const Btn = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  className = "",
  icon,
}) => {
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-black",
    secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-gray-600 hover:bg-gray-100",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 font-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? <Spinner size={16} /> : icon}
      {children}
    </button>
  );
};

// Badge
export const Badge = ({ children, color = "gray" }) => {
  const colors = {
    gray: "bg-gray-100 text-gray-700",
    black: "bg-gray-900 text-white",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
  };
  return (
    <span className={`badge ${colors[color]}`}>{children}</span>
  );
};

// Avatar
export const Avatar = ({ name = "", size = "md" }) => {
  const letter = name?.split(" ").pop()?.charAt(0)?.toUpperCase() || "?";
  const sizes = { sm: "w-8 h-8 text-sm", md: "w-10 h-10 text-base", lg: "w-14 h-14 text-xl", xl: "w-20 h-20 text-3xl" };
  return (
    <div className={`${sizes[size]} rounded-xl bg-gray-900 text-white font-800 flex items-center justify-center flex-shrink-0`}>
      {letter}
    </div>
  );
};

// Empty state
export const EmptyState = ({ icon, title, description }) => (
  <div className="text-center py-16">
    <div className="text-gray-300 mb-4 flex justify-center">{icon}</div>
    <p className="text-gray-500 font-500">{title}</p>
    {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
  </div>
);

// Loading skeleton rows
export const SkeletonRows = ({ cols = 4, rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} className="p-4">
            <div className="skeleton h-4 w-full rounded" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

// Section header
export const SectionHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div>
      <h2 className="text-xl font-700 text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </div>
);

// Card
export const Card = ({ children, className = "", padding = true }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${padding ? "p-6" : ""} ${className}`}>
    {children}
  </div>
);

// Form field wrapper
export const FormField = ({ label, children, error }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="form-label">{label}</label>}
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// Divider
export const Divider = ({ className = "" }) => (
  <hr className={`border-gray-100 ${className}`} />
);

// Stat card
export const StatCard = ({ label, value, icon, trend }) => (
  <Card className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-800 text-gray-900">{value ?? "—"}</p>
      <p className="text-sm text-gray-500 font-500">{label}</p>
      {trend && <p className="text-xs text-emerald-600 font-600 mt-0.5">{trend}</p>}
    </div>
  </Card>
);

// Pagination
export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Btn
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Trước
      </Btn>
      <span className="text-sm font-500 text-gray-600 px-3">
        {page} / {totalPages}
      </span>
      <Btn
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Sau →
      </Btn>
    </div>
  );
};
