import React from 'react';
import { useAuth } from './AuthProvider';

const ReloadPromptBanner: React.FC = () => {
  const { showReloadPrompt, confirmReload } = useAuth();

  if (!showReloadPrompt) return null;

  return (
    <div style={{
      background: '#fde047',
      color: '#1f2937',
      padding: '12px 24px',
      textAlign: 'center',
      position: 'fixed',
      bottom: 0,
      width: '100%',
      zIndex: 9999,
      fontWeight: 'bold',
      boxShadow: '0 -2px 6px rgba(0,0,0,0.1)',
    }}>
      Please refresh the page to complete sign-out.
      <button
        style={{
          marginLeft: '12px',
          padding: '6px 12px',
          background: '#1f2937',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={confirmReload}
      >
        Refresh now
      </button>
    </div>
  );
};

export default ReloadPromptBanner;

