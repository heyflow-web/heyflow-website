import React from 'react';

export default function Logo({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
      <div 
        style={{
          width: '114px', // 227/48 ratio relative to 24px height
          height: '24px',
          backgroundColor: 'var(--logo-color, #171719)',
          WebkitMaskImage: 'url(/logo.png)',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center left',
          maskImage: 'url(/logo.png)',
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center left',
          flexShrink: 0
        }}
        aria-label="HeyFlow Logo"
      />
    </div>
  );
}
