export type Category =
  | 'vital_signs'
  | 'medication'
  | 'infection_control'
  | 'basic_nursing'
  | 'emergency'
  | 'medical_terms'
  | 'patient_safety'
  | 'documentation'

export type Difficulty = 1 | 2 | 3

export interface Question {
  id: string
  category: Category
  difficulty: Difficulty
  question: string
  options: string[]
  answer: number
  explanation: string
}

export interface TopicStat {
  category: Category
  attempted: number
  correct: number
  // ELO-like skill score 0-100
  skill: number
}

export interface UserState {
  phase: 'home' | 'diagnostic' | 'practice' | 'result' | 'dashboard'
  diagnosticDone: boolean
  topicStats: Record<Category, TopicStat>
  history: AnswerRecord[]
  streak: number
  totalAnswered: number
  totalCorrect: number
}

export interface AnswerRecord {
  questionId: string
  category: Category
  correct: boolean
  timestamp: number
}

export interface QuizSession {
  questions: Question[]
  currentIndex: number
  answers: (number | null)[]
  startTime: number
}
