export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.variant || "success"}`} role="status" aria-live="polite">
      <span className="toast-icon">
        {toast.variant === "celebrate" ? "🏆" : toast.variant === "error" ? "!" : "✓"}
      </span>
      <span className="toast-msg">{toast.message}</span>
    </div>
  );
}
