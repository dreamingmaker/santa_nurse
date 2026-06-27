import type { UserState } from '../types'
import { makeInitialStats } from './adaptive'

const KEY = 'santa_nurse_state'

export function loadState(): UserState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as UserState
  } catch {
    // ignore
  }
  return {
    phase: 'home',
    diagnosticDone: false,
    topicStats: makeInitialStats(),
    history: [],
    streak: 0,
    totalAnswered: 0,
    totalCorrect: 0,
  }
}

export function saveState(state: UserState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function clearState(): void {
  localStorage.removeItem(KEY)
}
