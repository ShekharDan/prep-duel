export default function StatRing({ value, label, pct = 0, color = "var(--primary)" }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, pct)) / 100);

  return (
    <div className="stat-ring-chip">
      <svg className="stat-ring-svg" viewBox="0 0 56 56" aria-hidden="true">
        <circle className="stat-ring-bg" cx="28" cy="28" r={r} />
        <circle
          className="stat-ring-fg"
          cx="28"
          cy="28"
          r={r}
          style={{ stroke: color, strokeDasharray: c, strokeDashoffset: offset }}
        />
      </svg>
      <div className="stat-ring-center">
        <div className="value">{value}</div>
        <div className="label">{label}</div>
      </div>
    </div>
  );
}
