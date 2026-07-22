import React, { useEffect, useState } from 'react';
import { onWarmingChange, isWarming } from '../lib/api';

/**
 * Thin top banner shown only while the backend is cold-starting (Render free
 * tier). Driven by authFetch's retry state so the app never looks frozen.
 */
export default function WarmingBanner() {
  const [warming, setWarming] = useState(isWarming());

  useEffect(() => onWarmingChange(setWarming), []);

  if (!warming) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#fff',
        background: 'linear-gradient(90deg, #ff4d00, #ff8a00)',
        boxShadow: '0 4px 20px -6px rgba(255,77,0,0.6)',
      }}
    >
      <span
        style={{
          width: '12px',
          height: '12px',
          border: '2px solid rgba(255,255,255,0.4)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          animation: 'mi-warm-spin 0.7s linear infinite',
        }}
      />
      Waking up the server… first load can take up to a minute.
      <style>{`@keyframes mi-warm-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
