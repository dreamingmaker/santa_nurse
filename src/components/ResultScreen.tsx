import type { Question, UserState } from '../types'
import { CATEGORY_META } from '../data/questions'

interface Props {
  questions: Question[]
  answers: (number | null)[]
  isDiagnostic: boolean
  state: UserState
  onContinue: () => void
}

export default function ResultScreen({ questions, answers, isDiagnostic, state, onContinue }: Props) {
  const correctCount = answers.filter((a, i) => a === questions[i].answer).length
  const total = questions.length
  const pct = Math.round((correctCount / total) * 100)

  const weakCategories = Object.values(state.topicStats)
    .filter((s) => s.skill < 50)
    .sort((a, b) => a.skill - b.skill)
    .slice(0, 3)

  let grade = { label: '우수', emoji: '🏆', color: 'text-yellow-500' }
  if (pct < 40) grade = { label: '기초 단계', emoji: '🌱', color: 'text-green-600' }
  else if (pct < 60) grade = { label: '성장 중', emoji: '📈', color: 'text-blue-500' }
  else if (pct < 80) grade = { label: '양호', emoji: '⭐', color: 'text-purple-500' }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-gradient-to-b from-nurse-600 to-nurse-700 px-5 pt-14 pb-10 text-white text-center">
        <div className={`text-5xl mb-3 ${grade.color}`}>{grade.emoji}</div>
        <h2 className="text-xl font-bold mb-1">
          {isDiagnostic ? '진단 완료!' : '학습 완료!'}
        </h2>
        <div className="text-5xl font-bold mt-4 mb-1">{pct}점</div>
        <p className="text-nurse-200 text-sm">
          {total}문제 중 {correctCount}개 정답 · {grade.label}
        </p>
      </div>

      <div className="flex-1 px-5 py-6 space-y-5">
        {/* Wrong answers review */}
        <div className="card">
          <h3 className="font-bold text-slate-700 mb-3">틀린 문제 복습</h3>
          {questions.map((q, i) => {
            const correct = answers[i] === q.answer
            if (correct) return null
            const meta = CATEGORY_META[q.category]
            return (
              <div key={q.id} className="mb-4 last:mb-0 border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                <div className="flex gap-2 items-start mb-1">
                  <span className="text-red-500 text-sm font-bold shrink-0">✗</span>
                  <p className="text-sm font-medium text-slate-700">{q.question}</p>
                </div>
                <p className="text-xs text-slate-500 mb-1 ml-4">
                  내 답: {answers[i] !== null ? q.options[answers[i]] : '미선택'}
                </p>
                <p className="text-xs text-green-700 font-medium ml-4 mb-1">
                  정답: {q.options[q.answer]}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full border ml-4 ${meta.color}`}>
                  {meta.icon} {meta.label}
                </span>
              </div>
            )
          })}
          {correctCount === total && (
            <p className="text-center text-green-600 font-medium py-2">모두 정답! 🎉</p>
          )}
        </div>

        {/* Weak areas */}
        {weakCategories.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-slate-700 mb-3">집중 보완 영역</h3>
            <div className="space-y-3">
              {weakCategories.map((s) => {
                const meta = CATEGORY_META[s.category]
                return (
                  <div key={s.category} className="flex items-center gap-3">
                    <span className="text-xl">{meta.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{meta.label}</span>
                        <span className="text-sm text-slate-500">{s.skill}점</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-orange-400 h-2 rounded-full"
                          style={{ width: `${s.skill}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-8 pt-3 bg-white border-t border-slate-100">
        <button className="btn-primary w-full" onClick={onContinue}>
          {isDiagnostic ? '맞춤 학습 시작하기 →' : '홈으로 돌아가기'}
        </button>
      </div>
    </div>
  )
}
