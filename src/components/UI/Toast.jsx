import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { registerToast } from "../../utils/helpers";

const ICONS = {
  success: <CheckCircle size={18} className="text-green-600 flex-shrink-0" />,
  error: <XCircle size={18} className="text-red-600 flex-shrink-0" />,
  info: <Info size={18} className="text-blue-600 flex-shrink-0" />,
};

const BG = {
  success: "border-green-200 bg-green-50",
  error: "border-red-200 bg-red-50",
  info: "border-blue-200 bg-blue-50",
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
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
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-toast pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${BG[t.type]}`}
        >
          {ICONS[t.type]}
          <p className="text-sm font-medium text-gray-800 flex-1">{t.message}</p>
          <button
            onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
