// ErrorBanner.jsx
import { AlertTriangle, X } from "lucide-react";

export default function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">
      <AlertTriangle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="shrink-0 hover:text-red-100 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
}
