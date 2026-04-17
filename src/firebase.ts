// src/firebase.ts
// ─────────────────────────────────────────────────────────────────────────────
// Firebase configuration for HEAL platform.
// Replace the placeholder values below with your actual Firebase project credentials.
//
// HOW TO GET THESE VALUES:
//   1. Go to https://console.firebase.google.com
//   2. Create or open your project
//   3. Project Settings → Your apps → Add app (Web)
//   4. Copy the firebaseConfig object shown
//   5. In Firebase Console → Authentication → Sign-in method → Enable "Google"
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Request only the minimal scopes needed
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Always show account picker, even if user is already signed in
googleProvider.setCustomParameters({ prompt: 'select_account' });
