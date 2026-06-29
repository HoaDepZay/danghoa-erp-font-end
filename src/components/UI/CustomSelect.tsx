import React, { useState, useRef, useEffect } from "react";
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string | number) => {
    if (disabled) return;
    onChange({ target: { value: val } } as any);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      style={{ ...style, position: "relative", width: style.width || "100%", userSelect: "none" }}
    >
      <div
        className={variant === "default" ? `form-input ${className}`.trim() : className}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          backgroundColor: variant === "default" ? "#fff" : "transparent",
          minHeight: variant === "default" ? "38px" : "auto",
          border: variant === "ghost" ? "none" : undefined,
          padding: variant === "ghost" ? 0 : undefined,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setIsOpen((prev) => !prev);
        }}
      >
        <span style={{ color: selectedOption ? "inherit" : (variant === "ghost" ? "inherit" : "#888"), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={variant === "ghost" ? 14 : 16} color={variant === "ghost" ? "currentColor" : "#888"} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", marginLeft: 4 }} />
      </div>

      {isOpen && !disabled && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            padding: "4px 0",
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            zIndex: 99999,
            maxHeight: 250,
            overflowY: "auto",
            listStyle: "none",
          }}
        >
          {options.length === 0 ? (
            <li style={{ padding: "8px 12px", color: "#888", textAlign: "center", fontSize: 14 }}>
              Không có dữ liệu
            </li>
          ) : (
            options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: 14,
                  backgroundColor: value === opt.value ? "#e2e8f0" : "transparent",
                  fontWeight: value === opt.value ? 600 : 400,
                  transition: "background-color 0.15s ease",
                  color: "#334155" // Keep ghost variant options readable
                }}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
