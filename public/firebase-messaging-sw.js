// Firebase Messaging Service Worker for FruitDabba
// This file must be at the root of /public for FCM to find it

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config — values injected at build/runtime; use NEXT_PUBLIC_ vars on client
// Service worker cannot access process.env, so we use a self-contained config
firebase.initializeApp({
  apiKey: self.__FIREBASE_API_KEY__ || 'PLACEHOLDER_API_KEY',
  authDomain: self.__FIREBASE_AUTH_DOMAIN__ || 'PLACEHOLDER_AUTH_DOMAIN',
  projectId: self.__FIREBASE_PROJECT_ID__ || 'PLACEHOLDER_PROJECT_ID',
  storageBucket: self.__FIREBASE_STORAGE_BUCKET__ || 'PLACEHOLDER_STORAGE_BUCKET',
  messagingSenderId: self.__FIREBASE_MESSAGING_SENDER_ID__ || 'PLACEHOLDER_SENDER_ID',
  appId: self.__FIREBASE_APP_ID__ || 'PLACEHOLDER_APP_ID',
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'FruitDabba 🍎';
  const notificationOptions = {
    body: payload.notification?.body || 'Your fresh delivery is on its way!',
    icon: '/images/hero-fruit-box.png',
    badge: '/images/hero-fruit-box.png',
    tag: payload.data?.tag || 'fruitdabba-notification',
    data: payload.data || {},
    actions: [
      { action: 'view', title: '📦 View Order' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    requireInteraction: false,
    silent: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const data = event.notification.data;

  let url = '/';
  if (action === 'view' && data.orderId) {
    url = `/orders/${data.orderId}`;
  } else if (data.url) {
    url = data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
