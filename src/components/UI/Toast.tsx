import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Info, X, AlertTriangle } from "lucide-react";
import { registerToast } from "../../utils/helpers";

const TOAST_STYLE: Record<string, any> = {
  success: {
    background: "#111",
    color: "#fff",
    icon: <CheckCircle size={16} />,
  },
  error: { background: "#ef4444", color: "#fff", icon: <XCircle size={16} /> },
  info: { background: "#3b82f6", color: "#fff", icon: <Info size={16} /> },
  warning: {
    background: "#f59e0b",
    color: "#111",
    icon: <AlertTriangle size={16} />,
  },
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = useCallback((type: string, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    registerToast(addToast);
  }, [addToast]);

  return (
    <div className="toast-container">
      {toasts.map((t) => {
        const s = TOAST_STYLE[t.type] || TOAST_STYLE.info;
        return (
          <div
            key={t.id}
            style={{ background: s.background, color: s.color }}
            className="toast"
            role="status"
            aria-live="polite"
          >
            {s.icon}
            <p style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>
              {t.message}
            </p>
            <button
              onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
              style={{
                color:
                  t.type === "warning"
                    ? "rgba(17,17,17,0.7)"
                    : "rgba(255,255,255,0.65)",
                background: "none",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
