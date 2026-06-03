'use client';

import { useEffect, useState } from 'react';

export default function SectionScore({ label, score, icon }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), 400);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#6366f1';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="section-score" id={`section-score-${label?.toLowerCase()}`}>
      <div className="section-score-header">
        <span className="section-score-label">
          {icon && <span style={{ marginRight: '0.5rem' }}>{icon}</span>}
          {label}
        </span>
        <span className="section-score-value" style={{ color: getColor(score) }}>
          {score}/100
        </span>
      </div>
      <div className="section-score-bar">
        <div
          className="section-score-fill"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${getColor(score)}88, ${getColor(score)})`
          }}
        />
      </div>
    </div>
  );
}
