// ProgressBar.jsx
export default function ProgressBar({ current, total, labels }) {
  return (
    <div className="hidden md:flex items-center gap-1">
      {Array.from({ length: total + 1 }).map((_, i) => (
        <div key={i} className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              i < current ? "bg-amber-400" : i === current ? "bg-amber-400 ring-2 ring-amber-400/30" : "bg-white/20"
            }`}
          />
          {i < total && (
            <div className={`h-px w-8 ${i < current ? "bg-amber-400" : "bg-white/15"}`} />
          )}
        </div>
      ))}
      {labels?.[current] && (
        <span className="text-xs text-white/40 ml-2">{labels[current]}</span>
      )}
    </div>
  );
}
