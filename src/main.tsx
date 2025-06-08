import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeNotifications } from './utils/notifications';

// 🧹 Cleanup leftover Firebase IndexedDB on fresh load (post-logout)
const cleanupFirebaseIndexedDB = async () => {
  if (localStorage.getItem('clearIndexedDBOnLoad') === 'true') {
    console.log('🧹 Detected cleanup flag — attempting hard Firebase IndexedDB clear');

    localStorage.removeItem('clearIndexedDBOnLoad');

    const deleteDB = (name: string) => new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase(name);
      req.onsuccess = req.onerror = req.onblocked = () => {
        console.log(`✅ IndexedDB cleanup complete for ${name}`);
        resolve();
      };
    });

    try {
      await deleteDB('firebaseLocalStorageDb');
      await deleteDB('firebase-heartbeat-database');
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      console.error('❌ Failed during IndexedDB cleanup', err);
    }

    return true;
  }
  return false;
};

const setDynamicTitle = () => {
  const title = 'BrainBounce – Your Focus Space';
  if (document.title !== title) document.title = title;
  const titleMeta = document.querySelector('meta[property="og:title"]');
  if (titleMeta) titleMeta.setAttribute('content', title);
};

setDynamicTitle();
setInterval(setDynamicTitle, 5000);

console.log('📱 Device info:', {
  userAgent: navigator.userAgent,
  viewport: { width: innerWidth, height: innerHeight },
  online: navigator.onLine,
  connection: (navigator as any).connection?.effectiveType || 'unknown'
});

window.addEventListener('error', e => console.error('🚨 Global error:', e));
window.addEventListener('unhandledrejection', e => console.error('🚨 Unhandled rejection:', e));

window.addEventListener('online', () => {
  console.log('🌐 Back online');
  setDynamicTitle();
});
window.addEventListener('offline', () => {
  console.log('🌐 Offline');
  setDynamicTitle();
});

initializeNotifications().catch(err => {
  console.warn('Notification init failed:', err);
});

const init = async () => {
  const didCleanup = await cleanupFirebaseIndexedDB();
  if (didCleanup) {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: sans-serif;">
          <h2 style="color: #2563eb;">Refresh Required</h2>
          <p>We've cleared old sign-in data. Please refresh to continue.</p>
          <button onclick="location.reload()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">Refresh</button>
        </div>
      `;
    } else {
      document.body.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif; text-align: center;">
          <h2>Refresh Needed</h2>
          <p>We've cleared old sign-in data. Please refresh to continue.</p>
          <button id="refreshBtn" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">Refresh Now</button>
        </div>
      `;
      document.getElementById('refreshBtn')?.addEventListener('click', () => location.reload());
    }
    return;
  }

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: sans-serif;">
        <h2 style="color: red;">App Load Error</h2>
        <p>Could not find root element. Please refresh the page.</p>
        <button onclick="location.reload()" style="padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">Refresh</button>
      </div>
    `;
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('✅ App rendered');
  } catch (err) {
    console.error('❌ Render error', err);
    rootElement.innerHTML = '<p style="color:red">App failed to render.</p>';
  }
};

init();
