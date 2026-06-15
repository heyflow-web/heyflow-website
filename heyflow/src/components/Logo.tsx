import React from 'react';

export default function Logo({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', ...style }}>
      <svg width="34" height="20" viewBox="0 0 40 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        {/* Square */}
        <rect x="0" y="0" width="22" height="24" />
        {/* Half Circle (flat on left, curved on right) */}
        <path d="M 28 0 A 12 12 0 0 1 28 24 Z" />
      </svg>
      <span style={{ 
        fontFamily: 'serif', 
        fontSize: '1.5rem', 
        lineHeight: 1,
        letterSpacing: '0.02em',
        fontWeight: 500
      }}>
        Hey<span style={{ fontStyle: 'italic', fontWeight: 500 }}>Flow</span>
      </span>
    </div>
  );
}
