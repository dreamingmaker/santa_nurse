import { useState, useCallback } from 'react'
import type { UserState, QuizSession } from './types'
import { loadState, saveState, clearState } from './utils/storage'
import { pickDiagnosticQuestions, pickPracticeQuestions, updateSkill } from './utils/adaptive'
import HomeScreen from './components/HomeScreen'
import QuizScreen from './components/QuizScreen'
import ResultScreen from './components/ResultScreen'
import DashboardScreen from './components/DashboardScreen'

type Screen = 'home' | 'diagnostic' | 'practice' | 'result_diagnostic' | 'result_practice' | 'dashboard'

export default function App() {
  const [state, setState] = useState<UserState>(() => loadState())
  const [screen, setScreen] = useState<Screen>('home')
  const [session, setSession] = useState<QuizSession | null>(null)

  const persist = useCallback((next: UserState) => {
    setState(next)
    saveState(next)
  }, [])

  function startDiagnostic() {
    const questions = pickDiagnosticQuestions()
    setSession({
      questions,
      currentIndex: 0,
      answers: Array(questions.length).fill(null),
      startTime: Date.now(),
    })
    setScreen('diagnostic')
  }

  function startPractice() {
    const questions = pickPracticeQuestions(state, 10)
    setSession({
      questions,
      currentIndex: 0,
      answers: Array(questions.length).fill(null),
      startTime: Date.now(),
    })
    setScreen('practice')
  }

  function handleAnswer(questionIndex: number, answerIndex: number) {
    if (!session) return
    const question = session.questions[questionIndex]
    const correct = answerIndex === question.answer

    // Update session answers
    const newAnswers = [...session.answers]
    newAnswers[questionIndex] = answerIndex

    // Update state
    const newStats = { ...state.topicStats }
    newStats[question.category] = updateSkill(newStats[question.category], correct)

    const newHistory = [
      ...state.history,
      { questionId: question.id, category: question.category, correct, timestamp: Date.now() },
    ]

    const newStreak = correct ? state.streak + 1 : 0

    const nextState: UserState = {
      ...state,
      topicStats: newStats,
      history: newHistory,
      streak: newStreak,
      totalAnswered: state.totalAnswered + 1,
      totalCorrect: state.totalCorrect + (correct ? 1 : 0),
    }
    persist(nextState)

    setSession((s) => s ? { ...s, answers: newAnswers } : s)
  }

  function advanceQuestion() {
    if (!session) return
    if (session.currentIndex < session.questions.length - 1) {
      setSession((s) => s ? { ...s, currentIndex: s.currentIndex + 1 } : s)
    } else {
      // Quiz done — show results
      if (screen === 'diagnostic') {
        const nextState: UserState = { ...state, diagnosticDone: true }
        persist(nextState)
        setScreen('result_diagnostic')
      } else {
        setScreen('result_practice')
      }
    }
  }

  function handleReset() {
    if (!confirm('모든 학습 데이터를 초기화할까요?')) return
    clearState()
    const fresh = loadState()
    setState(fresh)
    setSession(null)
    setScreen('home')
  }

  if (screen === 'dashboard') {
    return (
      <DashboardScreen
        state={state}
        onBack={() => setScreen('home')}
      />
    )
  }

  if ((screen === 'diagnostic' || screen === 'practice') && session) {
    return (
      <QuizScreen
        session={session}
        isDiagnostic={screen === 'diagnostic'}
        onAnswer={handleAnswer}
        onFinish={advanceQuestion}
      />
    )
  }

  if ((screen === 'result_diagnostic' || screen === 'result_practice') && session) {
    return (
      <ResultScreen
        questions={session.questions}
        answers={session.answers}
        isDiagnostic={screen === 'result_diagnostic'}
        state={state}
        onContinue={() => setScreen('home')}
      />
    )
  }

  return (
    <HomeScreen
      state={state}
      onStartDiagnostic={startDiagnostic}
      onStartPractice={startPractice}
      onOpenDashboard={() => setScreen('dashboard')}
      onReset={handleReset}
    />
  )
}
