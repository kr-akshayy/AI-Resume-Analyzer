'use client';

import { useEffect, useState, useRef } from 'react';

export default function ScoreCard({ score, label, size = 180 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const ref = useRef(null);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    // Animate score counting up
    const timer = setTimeout(() => {
      const duration = 1500;
      const start = performance.now();
      const animate = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedScore(Math.round(score * eased));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, 300);

    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#6366f1';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const color = getColor(score);

  return (
    <div className="score-card" ref={ref} id="score-card">
      <div className="score-gauge" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            className="score-gauge-bg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
          />
          <circle
            className="score-gauge-fill"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="score-gauge-value">
          <div className="score-number" style={{ color }}>
            {animatedScore}
          </div>
          <div className="score-label">{label || 'Overall Score'}</div>
        </div>
      </div>
    </div>
  );
}
