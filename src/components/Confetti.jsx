import { useEffect, useState } from "react";

const COLORS = ["#2ec4b6", "#9b8afb", "#e9c46a", "#3dd68c", "#f4a4b8"];

export default function Confetti({ burst }) {
  const [bits, setBits] = useState([]);

  useEffect(() => {
    if (!burst) return;
    setBits(
      Array.from({ length: 18 }, (_, i) => ({
        id: `${burst}-${i}`,
        color: COLORS[i % COLORS.length],
        x: (Math.random() - 0.5) * 120,
        y: -(20 + Math.random() * 80),
        rot: Math.random() * 360,
        delay: Math.random() * 0.15,
        size: 4 + Math.random() * 4,
      }))
    );
    const t = setTimeout(() => setBits([]), 900);
    return () => clearTimeout(t);
  }, [burst]);

  if (!bits.length) return null;

  return (
    <div className="confetti-layer" aria-hidden="true">
      {bits.map((b) => (
        <span
          key={b.id}
          className="confetti-bit"
          style={{
            "--cx": `${b.x}px`,
            "--cy": `${b.y}px`,
            "--rot": `${b.rot}deg`,
            "--delay": `${b.delay}s`,
            "--size": `${b.size}px`,
            background: b.color,
          }}
        />
      ))}
    </div>
  );
}
