import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Dynamic title fallback
const setDynamicTitle = () => {
  const title = 'BrainBounce – Your Focus Space';
  
  // Set document title as fallback
  if (document.title !== title) {
    document.title = title;
  }
  
  // Also update any existing title meta tags
  const titleMeta = document.querySelector('meta[property="og:title"]');
  if (titleMeta) {
    titleMeta.setAttribute('content', title);
  }
};

// Set title immediately
setDynamicTitle();

// Enhanced error handling for debugging
window.addEventListener('error', (event) => {
  console.error('🚨 Global error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    stack: event.error?.stack
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', {
    reason: event.reason,
    promise: event.promise
  });
});

// Device and environment info
const deviceInfo = {
  userAgent: navigator.userAgent,
  viewport: { width: window.innerWidth, height: window.innerHeight },
  localStorage: typeof Storage !== 'undefined',
  crypto: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function',
  online: navigator.onLine,
  connection: (navigator as any).connection?.effectiveType || 'unknown'
};

console.log('📱 Device info:', deviceInfo);

// Polyfill for crypto.randomUUID
if (typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') {
  console.warn('⚠️ crypto.randomUUID not available, using polyfill');
  if (typeof crypto === 'undefined') {
    (window as any).crypto = {};
  }
  (crypto as any).randomUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

// Network status monitoring
window.addEventListener('online', () => {
  console.log('🌐 Network: Online');
  setDynamicTitle(); // Refresh title when coming back online
});

window.addEventListener('offline', () => {
  console.log('🌐 Network: Offline');
  setDynamicTitle(); // Refresh title when going offline
});

// Periodic title check (in case it gets overridden)
setInterval(setDynamicTitle, 5000);

// Safe app rendering with comprehensive error handling
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found');
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: Arial, sans-serif; text-align: center;">
      <h2>App Loading Error</h2>
      <p>Could not find root element. Please refresh the page.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
        Reload Page
      </button>
    </div>
  `;
} else {
  try {
    console.log('🚀 Starting app render...');
    const root = createRoot(rootElement);
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log('✅ App rendered successfully');
    
    // Monitor for render completion
    setTimeout(() => {
      const appContent = document.querySelector('[data-testid="app-content"]') || 
                        document.querySelector('.min-h-screen') ||
                        document.querySelector('main');
      
      if (appContent) {
        console.log('✅ App content loaded successfully');
        setDynamicTitle(); // Ensure title is set after app loads
      } else {
        console.warn('⚠️ App content may not have loaded properly');
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: Arial, sans-serif; text-align: center; max-width: 600px; margin: 0 auto;">
        <h2>App Failed to Load</h2>
        <p><strong>Error:</strong> ${error}</p>
        <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px; text-align: left;">
          <h3>Troubleshooting:</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
            <li>Clear your browser cache</li>
            <li>Try a different browser</li>
          </ul>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Reload Page
          </button>
          <button onclick="localStorage.clear(); window.location.reload()" style="padding: 10px 20px; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Clear Data & Reload
          </button>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          Device: ${deviceInfo.userAgent.substring(0, 100)}...
        </p>
      </div>
    `;
  }
}