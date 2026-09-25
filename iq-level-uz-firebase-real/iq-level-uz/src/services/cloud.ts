/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Real, shared, persistent data layer backed by Cloud Firestore.
// Nothing here is faked or pre-seeded: every counter starts at 0 in a brand
// new Firebase project and only grows from genuine user actions. Data is
// keyed by the real Telegram user id, so it is remembered forever -
// across page reloads, phones, and bot sessions.
import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  increment,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, DuelOutcome } from '../types';

export interface GlobalStats {
  totalUsers: number;
  totalTestsCompleted: number;
  totalDuels: number;
  totalGamesPlayed: number;
}

export const EMPTY_GLOBAL_STATS: GlobalStats = {
  totalUsers: 0,
  totalTestsCompleted: 0,
  totalDuels: 0,
  totalGamesPlayed: 0,
};

const DEVICE_ID_KEY = 'iq_level_uz_device_id_v1';

/**
 * Resolve a stable, real identity for this visitor.
 * Inside Telegram this is the REAL Telegram user id (so the bot truly
 * remembers the person). Outside Telegram (plain browser testing) we fall
 * back to a random id that is saved once and reused, so refreshes don't
 * create a "new" user.
 */
export function resolveRealUserId(): { id: string; telegramUser?: any } {
  try {
    const tg = (window as any).Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;
    if (tgUser?.id) {
      return { id: `tg-${tgUser.id}`, telegramUser: tgUser };
    }
  } catch {
    // Telegram WebApp not present (e.g. testing in a normal browser tab)
  }

  let saved = localStorage.getItem(DEVICE_ID_KEY);
  if (!saved) {
    saved = `web-${crypto.randomUUID()}`;
    localStorage.setItem(DEVICE_ID_KEY, saved);
  }
  return { id: saved };
}

// ---- User profile: one real, permanent document per real user ----
export function subscribeToUserProfile(
  id: string,
  onData: (profile: UserProfile | null) => void
) {
  return onSnapshot(doc(db, 'users', id), (snap) => {
    onData(snap.exists() ? (snap.data() as UserProfile) : null);
  });
}

export async function saveUserProfile(profile: UserProfile) {
  if (!profile?.id) return;
  await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
}

export async function userExistsInCloud(id: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'users', id));
  return snap.exists();
}

// ---- Leaderboard / admin: the REAL list of every registered user ----
export function subscribeToUsersList(onData: (users: UserProfile[]) => void) {
  const q = query(collection(db, 'users'), orderBy('iqScore', 'desc'), limit(500));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => d.data() as UserProfile));
  });
}

// ---- Recent duels feed: only real duels that really happened ----
export function subscribeToRecentDuels(onData: (duels: DuelOutcome[]) => void) {
  const q = query(collection(db, 'duels'), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => d.data() as DuelOutcome));
  });
}

export async function recordDuel(outcome: DuelOutcome) {
  await addDoc(collection(db, 'duels'), { ...outcome, createdAt: serverTimestamp() });
  await incrementGlobalStat('totalDuels');
}

// ---- Global live counters (site-wide "real statistics") ----
export function subscribeToGlobalStats(onData: (stats: GlobalStats) => void) {
  return onSnapshot(doc(db, 'stats', 'global'), (snap) => {
    onData(snap.exists() ? ({ ...EMPTY_GLOBAL_STATS, ...snap.data() } as GlobalStats) : EMPTY_GLOBAL_STATS);
  });
}

export async function incrementGlobalStat(field: keyof GlobalStats, amount = 1) {
  await setDoc(
    doc(db, 'stats', 'global'),
    { [field]: increment(amount) },
    { merge: true }
  );
}
