/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// REAL 1v1 online duel engine, backed by Cloud Firestore.
//
// There is no game server / Cloud Function in this project, so matchmaking
// and duel-round scoring happen on the two players' own devices, kept safe
// and consistent with Firestore *transactions*:
//   - Two players can never both "claim" the same waiting opponent (the
//     transaction only succeeds for the first one to commit).
//   - A duel round can never be scored twice, even if both players' devices
//     try to resolve it at the same moment (guarded by a `resolved` flag
//     that is only flipped inside a transaction).
// Both players are real people, matched from a real, shared Firestore
// "waiting room" (`duelQueue`). Nothing here is simulated.
import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  where,
  limit,
  runTransaction,
  serverTimestamp,
  increment,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { DuelOutcome } from '../types';

export const ROUND_TIME_MS = 15000;
export const TOTAL_ROUNDS = 5;

export interface QueueEntry {
  userId: string;
  name: string;
  avatar: string;
  rating: number;
  status: 'waiting' | 'matched';
  matchId: string | null;
}

export interface MatchPlayer {
  id: string;
  name: string;
  avatar: string;
  rating: number;
}

export interface MatchRound {
  p1Answer: number | null;
  p1AnswerAt: number | null; // ms elapsed since round start
  p2Answer: number | null;
  p2AnswerAt: number | null;
  resolved: boolean;
  p1Points: number;
  p2Points: number;
}

export interface DuelMatch {
  id: string;
  player1: MatchPlayer;
  player2: MatchPlayer;
  questionIds: string[];
  currentRound: number;
  rounds: MatchRound[];
  scores: { p1: number; p2: number };
  status: 'active' | 'finished';
  winner: 'p1' | 'p2' | 'draw' | null;
  roundStartedAt: number;
}

const emptyRound = (): MatchRound => ({
  p1Answer: null,
  p1AnswerAt: null,
  p2Answer: null,
  p2AnswerAt: null,
  resolved: false,
  p1Points: 0,
  p2Points: 0,
});

// ---- Waiting room ----

export async function joinDuelQueue(profile: MatchPlayer) {
  await setDoc(doc(db, 'duelQueue', profile.id), {
    userId: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    rating: profile.rating,
    status: 'waiting',
    matchId: null,
    joinedAt: serverTimestamp(),
  });
}

export async function leaveDuelQueue(userId: string) {
  try {
    await deleteDoc(doc(db, 'duelQueue', userId));
  } catch {
    // already gone - fine
  }
}

export function subscribeToMyQueueEntry(
  userId: string,
  onData: (entry: QueueEntry | null) => void
) {
  return onSnapshot(doc(db, 'duelQueue', userId), (snap) => {
    onData(snap.exists() ? (snap.data() as QueueEntry) : null);
  });
}

export function subscribeToWaitingPlayers(onData: (entries: QueueEntry[]) => void) {
  // Filtered by a single field only (no orderBy on a second field), so this
  // never needs a Firestore composite index to be created manually - it
  // works out of the box on a brand new project. We sort the small result
  // client-side instead.
  const q = query(collection(db, 'duelQueue'), where('status', '==', 'waiting'), limit(25));
  return onSnapshot(q, (snap) => {
    const entries = snap.docs.map((d) => ({ ...(d.data() as any), _joinedAtMs: d.data().joinedAt?.toMillis?.() ?? 0 }));
    entries.sort((a, b) => a._joinedAtMs - b._joinedAtMs);
    onData(entries as QueueEntry[]);
  });
}

/**
 * Try to lock in a real match with `opponent`. Safe to call from both
 * players at once - Firestore's transaction guarantees only one match gets
 * created even if two people try to claim each other simultaneously.
 * Returns the new matchId, or null if the opponent was already taken.
 */
export async function tryMatchWith(
  me: MatchPlayer,
  opponent: QueueEntry,
  questionIds: string[]
): Promise<string | null> {
  const matchRef = doc(collection(db, 'matches'));
  const myQueueRef = doc(db, 'duelQueue', me.id);
  const oppQueueRef = doc(db, 'duelQueue', opponent.userId);

  try {
    await runTransaction(db, async (tx) => {
      const [mySnap, oppSnap] = await Promise.all([tx.get(myQueueRef), tx.get(oppQueueRef)]);
      const myStatus = mySnap.exists() ? (mySnap.data() as QueueEntry).status : null;
      const oppStatus = oppSnap.exists() ? (oppSnap.data() as QueueEntry).status : null;
      if (myStatus !== 'waiting' || oppStatus !== 'waiting') {
        throw new Error('taken');
      }

      const rounds = Array.from({ length: TOTAL_ROUNDS }, emptyRound);
      const match: Omit<DuelMatch, 'id'> = {
        player1: opponent.userId < me.id
          ? { id: opponent.userId, name: opponent.name, avatar: opponent.avatar, rating: opponent.rating }
          : me,
        player2: opponent.userId < me.id
          ? me
          : { id: opponent.userId, name: opponent.name, avatar: opponent.avatar, rating: opponent.rating },
        questionIds,
        currentRound: 0,
        rounds,
        scores: { p1: 0, p2: 0 },
        status: 'active',
        winner: null,
        roundStartedAt: Date.now(),
      };

      tx.set(matchRef, match);
      tx.set(myQueueRef, { status: 'matched', matchId: matchRef.id }, { merge: true });
      tx.set(oppQueueRef, { status: 'matched', matchId: matchRef.id }, { merge: true });
    });
    return matchRef.id;
  } catch {
    return null;
  }
}

export function subscribeToMatch(matchId: string, onData: (match: DuelMatch | null) => void) {
  return onSnapshot(doc(db, 'matches', matchId), (snap) => {
    onData(snap.exists() ? ({ id: snap.id, ...snap.data() } as DuelMatch) : null);
  });
}

function computePoints(answer: number | null, correctIndex: number, elapsedMs: number): number {
  if (answer === null || answer !== correctIndex) return 0;
  const remainingSeconds = Math.max(0, Math.round((ROUND_TIME_MS - elapsedMs) / 1000));
  return 100 + remainingSeconds * 5;
}

/**
 * Resolve the current round: only actually applies once (guarded by the
 * `resolved` flag inside a transaction), so it is safe for both clients -
 * or the same client's answer-submit and its timeout-timer - to call this.
 */
async function resolveRound(
  matchId: string,
  roundIndex: number,
  correctIndex: number
) {
  const matchRef = doc(db, 'matches', matchId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(matchRef);
    if (!snap.exists()) return;
    const match = snap.data() as DuelMatch;
    if (match.status !== 'active' || match.currentRound !== roundIndex) return;
    const round = match.rounds[roundIndex];
    if (!round || round.resolved) return;

    const p1Points = computePoints(round.p1Answer, correctIndex, round.p1AnswerAt ?? ROUND_TIME_MS);
    const p2Points = computePoints(round.p2Answer, correctIndex, round.p2AnswerAt ?? ROUND_TIME_MS);

    const newRounds = [...match.rounds];
    newRounds[roundIndex] = { ...round, resolved: true, p1Points, p2Points };

    const newScores = { p1: match.scores.p1 + p1Points, p2: match.scores.p2 + p2Points };
    const isLastRound = roundIndex >= TOTAL_ROUNDS - 1;

    if (!isLastRound) {
      tx.set(
        matchRef,
        {
          rounds: newRounds,
          scores: newScores,
          currentRound: roundIndex + 1,
          roundStartedAt: Date.now(),
        },
        { merge: true }
      );
      return;
    }

    // Final round just resolved - finish the match, write the ONE real
    // shared duel record, and bump the ONE real global counter. All inside
    // this same transaction, so it happens exactly once no matter which
    // player's device gets here first.
    const winner: DuelMatch['winner'] =
      newScores.p1 === newScores.p2 ? 'draw' : newScores.p1 > newScores.p2 ? 'p1' : 'p2';

    tx.set(
      matchRef,
      { rounds: newRounds, scores: newScores, status: 'finished', winner },
      { merge: true }
    );

    const outcome: Omit<DuelOutcome, 'id'> = {
      player1: {
        name: match.player1.name,
        avatar: match.player1.avatar,
        score: newScores.p1,
        rating: match.player1.rating + (winner === 'p1' ? 25 : winner === 'draw' ? 0 : -15),
        isWinner: winner === 'p1',
      },
      player2: {
        name: match.player2.name,
        avatar: match.player2.avatar,
        score: newScores.p2,
        rating: match.player2.rating + (winner === 'p2' ? 25 : winner === 'draw' ? 0 : -15),
        isWinner: winner === 'p2',
      },
      winnerId: winner === 'draw' ? 'draw' : winner === 'p1' ? 'player1' : 'player2',
      timestamp: new Date().toISOString(),
    };
    const duelRef = doc(collection(db, 'duels'));
    tx.set(duelRef, { ...outcome, id: duelRef.id, createdAt: serverTimestamp() });
    tx.set(doc(db, 'stats', 'global'), { totalDuels: increment(1) }, { merge: true });
  });
}

export async function submitAnswer(
  matchId: string,
  mySlot: 'p1' | 'p2',
  roundIndex: number,
  answerIndex: number,
  correctIndex: number
) {
  const matchRef = doc(db, 'matches', matchId);
  let elapsed = ROUND_TIME_MS;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(matchRef);
    if (!snap.exists()) return;
    const match = snap.data() as DuelMatch;
    if (match.status !== 'active' || match.currentRound !== roundIndex) return;
    const round = match.rounds[roundIndex];
    if (!round || round.resolved) return;
    if ((mySlot === 'p1' && round.p1Answer !== null) || (mySlot === 'p2' && round.p2Answer !== null)) {
      return; // already answered this round
    }

    elapsed = Math.max(0, Date.now() - match.roundStartedAt);
    const newRounds = [...match.rounds];
    newRounds[roundIndex] = {
      ...round,
      [mySlot === 'p1' ? 'p1Answer' : 'p2Answer']: answerIndex,
      [mySlot === 'p1' ? 'p1AnswerAt' : 'p2AnswerAt']: elapsed,
    };
    tx.set(matchRef, { rounds: newRounds }, { merge: true });
  });

  // If the opponent has already answered, resolve immediately; otherwise
  // the round's own 15s timeout (driven by the UI) will resolve it once
  // time is up.
  const freshSnap = await getDoc(matchRef);
  const current = freshSnap.exists() ? (freshSnap.data() as DuelMatch) : undefined;
  const round = current?.rounds?.[roundIndex];
  if (round && round.p1Answer !== null && round.p2Answer !== null) {
    await resolveRound(matchId, roundIndex, correctIndex);
  }
}

export async function resolveRoundOnTimeout(matchId: string, roundIndex: number, correctIndex: number) {
  await resolveRound(matchId, roundIndex, correctIndex);
}
