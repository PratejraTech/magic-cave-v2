import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';
import { initSentry } from './lib/sentry';

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase App
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Messaging (only in browser environment)
let messaging: any = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  messaging = getMessaging(firebaseApp);

  // Handle foreground messages
  onMessage(messaging, (payload) => {
    console.log('Received foreground message:', payload);

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(payload.notification?.title || 'Advent Calendar', {
        body: payload.notification?.body || 'New tile available!',
        icon: '/vite.svg', // You can replace with your app icon
        data: payload.data,
      });
    }
  });
}

// Make Firebase instances available globally for other modules
(window as any).firebaseApp = firebaseApp;
(window as any).firebaseMessaging = messaging;

// Initialize error tracking
initSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
