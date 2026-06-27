import type { Category, Question, TopicStat, UserState } from '../types'
import { QUESTIONS } from '../data/questions'

const ALL_CATEGORIES: Category[] = [
  'vital_signs', 'medication', 'infection_control', 'basic_nursing',
  'emergency', 'medical_terms', 'patient_safety', 'documentation',
]

export function makeInitialStats(): Record<Category, TopicStat> {
  return Object.fromEntries(
    ALL_CATEGORIES.map((cat) => [
      cat,
      { category: cat, attempted: 0, correct: 0, skill: 50 },
    ])
  ) as Record<Category, TopicStat>
}

/** Pick 10 diagnostic questions: 1~2 per category, mixed difficulty */
export function pickDiagnosticQuestions(): Question[] {
  const result: Question[] = []
  const perCat = 1
  for (const cat of ALL_CATEGORIES) {
    const pool = QUESTIONS.filter((q) => q.category === cat)
    const mid = pool.filter((q) => q.difficulty === 2)
    const any = mid.length > 0 ? mid : pool
    const picked = shuffle(any).slice(0, perCat)
    result.push(...picked)
  }
  return shuffle(result).slice(0, 10)
}

/** Adaptive practice: weight by weakness, scale difficulty to skill */
export function pickPracticeQuestions(state: UserState, count = 10): Question[] {
  const weights = computeWeights(state.topicStats)
  const result: Question[] = []
  const used = new Set(state.history.slice(-50).map((h) => h.questionId))

  for (let i = 0; i < count; i++) {
    const cat = weightedPick(weights)
    const skill = state.topicStats[cat].skill
    const targetDiff = skill < 40 ? 1 : skill < 70 ? 2 : 3

    const pool = QUESTIONS.filter(
      (q) => q.category === cat && q.difficulty === targetDiff && !used.has(q.id)
    )
    const fallback = QUESTIONS.filter((q) => q.category === cat && !used.has(q.id))
    const candidates = pool.length > 0 ? pool : fallback.length > 0 ? fallback : QUESTIONS.filter((q) => q.category === cat)
    const q = shuffle(candidates)[0]
    if (q) {
      result.push(q)
      used.add(q.id)
    }
  }
  return result
}

/** Update skill score after answering */
export function updateSkill(stat: TopicStat, correct: boolean): TopicStat {
  const delta = correct ? 8 : -5
  const newSkill = Math.max(0, Math.min(100, stat.skill + delta))
  return {
    ...stat,
    attempted: stat.attempted + 1,
    correct: stat.correct + (correct ? 1 : 0),
    skill: newSkill,
  }
}

function computeWeights(stats: Record<Category, TopicStat>): Record<Category, number> {
  const weights: Record<string, number> = {}
  for (const [cat, s] of Object.entries(stats)) {
    // More weight to low-skill topics
    weights[cat] = Math.max(100 - s.skill, 10)
  }
  return weights as Record<Category, number>
}

function weightedPick(weights: Record<Category, number>): Category {
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (const [cat, w] of Object.entries(weights)) {
    rand -= w
    if (rand <= 0) return cat as Category
  }
  return Object.keys(weights)[0] as Category
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
