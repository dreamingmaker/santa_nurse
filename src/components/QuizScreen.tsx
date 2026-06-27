import { useState } from 'react'
import type { Question, QuizSession } from '../types'
import { CATEGORY_META } from '../data/questions'

interface Props {
  session: QuizSession
  isDiagnostic: boolean
  onAnswer: (questionIndex: number, answerIndex: number) => void
  onFinish: () => void
}

export default function QuizScreen({ session, isDiagnostic, onAnswer, onFinish }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)

  const { questions, currentIndex, answers } = session
  const question: Question = questions[currentIndex]
  const isAnswered = answers[currentIndex] !== null
  const isLast = currentIndex === questions.length - 1
  const progress = ((currentIndex) / questions.length) * 100

  const meta = CATEGORY_META[question.category]

  function handleSelect(idx: number) {
    if (isAnswered) return
    setSelected(idx)
    onAnswer(currentIndex, idx)
    setShowExplanation(true)
  }

  function handleNext() {
    setSelected(null)
    setShowExplanation(false)
    if (isLast) {
      onFinish()
    } else {
      // parent will update currentIndex
      onFinish()
    }
  }

  const chosenAnswer = answers[currentIndex]
  const isCorrect = chosenAnswer === question.answer

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 px-5 pt-10 pb-4">
        <div className="flex justify-between items-center mb-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${meta.color}`}>
            {meta.icon} {meta.label}
          </span>
          <span className="text-sm text-slate-500">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div
            className="bg-nurse-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {isDiagnostic && (
          <p className="text-xs text-nurse-600 font-medium mt-2">진단 테스트 진행 중</p>
        )}
      </div>

      {/* Question */}
      <div className="flex-1 px-5 py-6 overflow-y-auto">
        <div className="mb-1">
          <span className="text-xs text-slate-400 font-medium">
            난이도 {'★'.repeat(question.difficulty)}{'☆'.repeat(3 - question.difficulty)}
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-800 leading-snug mb-6">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            let style = 'border-slate-200 bg-white text-slate-700 hover:border-nurse-300 hover:bg-nurse-50'
            if (isAnswered) {
              if (idx === question.answer) {
                style = 'border-green-400 bg-green-50 text-green-800'
              } else if (idx === chosenAnswer && !isCorrect) {
                style = 'border-red-400 bg-red-50 text-red-800'
              } else {
                style = 'border-slate-200 bg-slate-50 text-slate-400'
              }
            } else if (selected === idx) {
              style = 'border-nurse-400 bg-nurse-50 text-nurse-800'
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 font-medium text-sm ${style}`}
              >
                <span className="font-bold mr-2 text-slate-400">
                  {['①', '②', '③', '④'][idx]}
                </span>
                {opt}
                {isAnswered && idx === question.answer && (
                  <span className="float-right text-green-600">✓</span>
                )}
                {isAnswered && idx === chosenAnswer && !isCorrect && idx !== question.answer && (
                  <span className="float-right text-red-500">✗</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className={`mt-5 p-4 rounded-xl border-l-4 ${isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{isCorrect ? '🎉' : '💡'}</span>
              <span className={`font-bold text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? '정답입니다!' : '오답입니다'}
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{question.explanation}</p>
          </div>
        )}
      </div>

      {/* Next button */}
      {isAnswered && (
        <div className="px-5 pb-8 pt-3 bg-white border-t border-slate-100">
          <button className="btn-primary w-full" onClick={handleNext}>
            {isLast ? '결과 보기' : '다음 문제 →'}
          </button>
        </div>
      )}
    </div>
  )
}
