import React from 'react';

const bannerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  backgroundColor: '#ff6b35',
  color: '#fff',
  textAlign: 'center',
  padding: '6px 16px',
  fontSize: '13px',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  letterSpacing: '2px',
  textTransform: 'uppercase'
};

export default function DemoBanner() {
  return (
    <div style={bannerStyle}>
      DEMO MODE — This is a showcase of the Giveassist platform
    </div>
  );
}
