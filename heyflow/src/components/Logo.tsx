import React from 'react';

export default function Logo({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="HeyFlow Logo" style={{ height: '24px', width: 'auto', flexShrink: 0 }} />
    </div>
  );
}
