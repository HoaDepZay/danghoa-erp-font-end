import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { ChevronDown } from "lucide-react";

export interface CustomSelectOption {
  label: string;
  value: string | number;
}

export interface CustomSelectProps {
  value: string | number;
  onChange: (e: any) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  variant?: "default" | "ghost";
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "-- Chọn --",
  className = "",
  style = {},
  disabled = false,
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const updatePosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleScrollOrResize = (e: Event) => {
      if (e.target && (e.target as HTMLElement).closest && (e.target as HTMLElement).closest(".custom-select-portal-menu")) {
        return;
      }
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const handleSelect = (val: string | number) => {
    if (disabled) return;
    onChange({ target: { value: val } } as any);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        ...style,
        position: "relative",
        width: style.width || "100%",
        userSelect: "none",
      }}
    >
      <div
        className={variant === "default" ? `form-input ${className}`.trim() : className}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          backgroundColor: variant === "default" ? "var(--input-bg, #fff)" : "transparent",
          color: "var(--text-primary, #334155)",
          minHeight: variant === "default" ? "42px" : "auto",
          borderRadius: variant === "default" ? "10px" : undefined,
          border: variant === "ghost" ? "none" : "1px solid var(--border-color, #e2e8f0)",
          padding: variant === "ghost" ? 0 : "10px 14px",
          boxShadow: variant === "default" ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)" : "none",
          transition: "all 0.2s ease",
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) {
            if (!isOpen) updatePosition();
            setIsOpen((prev) => !prev);
          }
        }}
      >
        <span style={{ color: selectedOption ? "var(--text-primary, #1e293b)" : "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "14px" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={variant === "ghost" ? 14 : 18} color={variant === "ghost" ? "currentColor" : "#64748b"} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", marginLeft: 8 }} />
      </div>

      {isOpen && !disabled && ReactDOM.createPortal(
        <ul
          ref={menuRef}
          className="custom-select-portal-menu"
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            width: coords.width,
            padding: "6px",
            backgroundColor: "var(--card-bg, #fff)",
            border: "1px solid var(--border-color, #e2e8f0)",
            borderRadius: 12,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            zIndex: 9999999,
            maxHeight: 260,
            overflowY: "auto",
            listStyle: "none",
          }}
        >
          {options.length === 0 ? (
            <li style={{ padding: "10px 14px", color: "#94a3b8", textAlign: "center", fontSize: 14 }}>
              Không có dữ liệu
            </li>
          ) : (
            options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "var(--hover-bg, #f1f5f9)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    fontSize: 14,
                    borderRadius: 8,
                    marginBottom: 2,
                    backgroundColor: isSelected ? "var(--primary-color, #3b82f6)" : "transparent",
                    color: isSelected ? "#fff" : "var(--text-primary, #334155)",
                    fontWeight: isSelected ? 600 : 400,
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{opt.label}</span>
                </li>
              );
            })
          )}
        </ul>,
        document.body
      )}
    </div>
  );
};

export default CustomSelect;
