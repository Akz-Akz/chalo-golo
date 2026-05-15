import React from 'react';
import { APP_LOGO } from '../services/assets.js';

export default function AppLogo({ size = 38, showText = true, compact = false }) {
  return (
    <div className="cg-logo-mark" style={{ gap: compact ? 8 : 10 }}>
      <img src={APP_LOGO} alt="Chalo Golo" style={{ width: size, height: size, objectFit: 'contain' }} />
      {showText ? <span>Chalo Golo</span> : null}
    </div>
  );
}
