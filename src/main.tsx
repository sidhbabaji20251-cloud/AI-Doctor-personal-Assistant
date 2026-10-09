import {createRoot} from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register Service Worker for offline functionality in remote areas
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[AI Doctor Personal Assistant SW] New offline cache available.');
  },
  onOfflineReady() {
    console.log('[AI Doctor Personal Assistant SW] App ready for offline access in remote regions.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
