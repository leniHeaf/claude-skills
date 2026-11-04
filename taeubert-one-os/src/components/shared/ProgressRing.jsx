import React from "react";

/**
 * Circular progress ring
 * Usage: <ProgressRing percent={75} size={56} stroke={4} color="#3b82f6" label="75%" />
 */
export default function ProgressRing({ percent = 0, size = 56, stroke = 4, color = "hsl(215,55%,40%)", label, sublabel }) {
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="hsl(230,10%,14%)" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      {label && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-heading text-foreground leading-none">{label}</span>
          {sublabel && <span className="text-[9px] text-muted-foreground mt-0.5">{sublabel}</span>}
        </div>
      )}
    </div>
  );
}