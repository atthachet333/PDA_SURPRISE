import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/app/App';
import { AudioProvider } from '@/app/AudioProvider';
import '@/styles/global.css';

/*
 * A tab left open across a deploy still holds the previous build's chunk
 * names; its next lazy route asks for a file the server no longer has. Load
 * the new build once instead of dropping the visitor on the error panel. The
 * session flag stops a genuinely missing chunk from reloading forever.
 */
const CHUNK_RELOAD_KEY = 'pdabliss.chunk-reload';
window.addEventListener('vite:preloadError', (event) => {
  try {
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});
window.addEventListener('load', () => {
  window.setTimeout(() => {
    try { sessionStorage.removeItem(CHUNK_RELOAD_KEY); } catch { /* storage unavailable */ }
  }, 10_000);
});

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root was not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AudioProvider>
        <App />
      </AudioProvider>
    </BrowserRouter>
  </StrictMode>
);
