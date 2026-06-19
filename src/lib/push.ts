/**
 * FruitDabba Push Notification Library
 * Handles FCM registration, permission requests, and subscription management.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Lazily initialise Firebase so it only runs on client
function getFirebaseApp() {
  if (typeof window === 'undefined') return null;
  if (getApps().length > 0) return getApps()[0];
  return initializeApp(firebaseConfig);
}

/**
 * Request notification permission and return an FCM token.
 * Returns null if permission denied or not supported.
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const app = getFirebaseApp();
    if (!app) return null;

    // Register the Firebase messaging service worker
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
      { scope: '/' }
    );

    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return token || null;
  } catch (err) {
    console.error('[FCM] Failed to get token:', err);
    return null;
  }
}

/**
 * Subscribe foreground message listener (while the page is open).
 */
export function onForegroundMessage(
  callback: (payload: MessagePayload) => void
): (() => void) | null {
  if (typeof window === 'undefined') return null;

  const app = getFirebaseApp();
  if (!app) return null;

  const messaging = getMessaging(app);
  // onMessage returns an unsubscribe function
  return onMessage(messaging, callback);
}

/**
 * Save the FCM token to Supabase via the API route.
 */
export async function saveFcmToken(
  userId: string,
  token: string
): Promise<void> {
  await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, token }),
  });
}

/**
 * Full flow: request permission → get token → save to DB.
 * Call this after user signs in.
 */
export async function registerForPushNotifications(userId: string): Promise<boolean> {
  const token = await requestNotificationPermission();
  if (!token) return false;

  await saveFcmToken(userId, token);
  return true;
}
