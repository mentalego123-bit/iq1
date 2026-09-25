/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Real Firebase project connection for IQ Level Uz.
// This makes ALL statistics (users count, tests taken, duels, leaderboard)
// live in Cloud Firestore instead of the browser's localStorage, so:
//  - Every real visitor is counted for real (starts at 0, grows with real usage)
//  - Data is remembered across devices / app restarts / bot sessions
//  - The admin panel sees the TRUE global numbers, not just "this phone's" data
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBkOiZ_XXSZE_OJCOlbZw5Cvnu6xlarIh4',
  authDomain: 'iqbot-c1b8c.firebaseapp.com',
  projectId: 'iqbot-c1b8c',
  storageBucket: 'iqbot-c1b8c.firebasestorage.app',
  messagingSenderId: '1072747237634',
  appId: '1:1072747237634:web:0ab5c888ef04024696b21b',
  measurementId: 'G-HCJWW9307P',
};

// Avoid re-initializing during hot-reload
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
