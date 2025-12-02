// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: 'your-firebase-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Advent Calendar';
  const notificationOptions = {
    body: payload.notification?.body || 'New tile available!',
    icon: '/vite.svg', // Replace with your app icon
    badge: '/vite.svg', // Small icon for notification badge
    data: payload.data,
    tag: payload.data?.type || 'advent-calendar', // Group similar notifications
    requireInteraction: false, // Auto-dismiss after a few seconds
    actions: [
      {
        action: 'open',
        title: 'Open Calendar'
      }
    ]
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  // Handle the action
  if (event.action === 'open') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/').then((windowClient) => {
        if (windowClient) {
          windowClient.focus();
        }
      })
    );
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/').then((windowClient) => {
        if (windowClient) {
          windowClient.focus();
        }
      })
    );
  }
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Service worker installing');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service worker activating');
  // Clean up old caches if needed
  event.waitUntil(
    clients.claim().then(() => {
      console.log('Service worker activated and claimed all clients');
    })
  );
});