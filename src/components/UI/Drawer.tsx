import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** "sm" = 400px | "md" = 520px (default) | "lg" = 680px | "xl" = 820px */
  size?: "sm" | "md" | "lg" | "xl";
  /** Icon hiển thị cạnh title */
  icon?: ReactNode;
}

const Drawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  icon,
}: DrawerProps) => {
  // Lock scroll khi mở
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Đóng bằng Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const sizeVar: Record<string, string> = {
    sm: "400px", md: "520px", lg: "680px", xl: "820px",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop${isOpen ? " open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`drawer-panel${isOpen ? " open" : ""}`}
        style={{ "--drawer-w": sizeVar[size] } as React.CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            {icon && <span className="drawer-icon">{icon}</span>}
            <div>
              {title && <h3 className="drawer-title">{title}</h3>}
              {subtitle && <p className="drawer-subtitle">{subtitle}</p>}
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Đóng">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">{children}</div>

        {/* Footer */}
        {footer && <div className="drawer-footer">{footer}</div>}
      </aside>
    </>
  );
};

export default Drawer;
