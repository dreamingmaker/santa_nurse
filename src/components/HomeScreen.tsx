import type { UserState } from '../types'
import { CATEGORY_META } from '../data/questions'

interface Props {
  state: UserState
  onStartDiagnostic: () => void
  onStartPractice: () => void
  onOpenDashboard: () => void
  onReset: () => void
}

export default function HomeScreen({ state, onStartDiagnostic, onStartPractice, onOpenDashboard, onReset }: Props) {
  const accuracy = state.totalAnswered > 0
    ? Math.round((state.totalCorrect / state.totalAnswered) * 100)
    : 0

  const avgSkill = Math.round(
    Object.values(state.topicStats).reduce((s, t) => s + t.skill, 0) / 8
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-nurse-600 to-nurse-800 flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🏥</span>
          <div>
            <h1 className="text-2xl font-bold">산타간호</h1>
            <p className="text-nurse-200 text-sm">신규 간호사 맞춤 학습</p>
          </div>
        </div>

        {state.diagnosticDone && (
          <div className="mt-5 bg-white/15 rounded-2xl p-4 flex gap-4">
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold">{avgSkill}</div>
              <div className="text-xs text-nurse-200 mt-0.5">평균 실력</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold">{accuracy}%</div>
              <div className="text-xs text-nurse-200 mt-0.5">정답률</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold">{state.streak}</div>
              <div className="text-xs text-nurse-200 mt-0.5">연속 정답</div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 bg-slate-50 rounded-t-3xl px-5 pt-6 pb-8">
        {!state.diagnosticDone ? (
          <>
            <h2 className="text-lg font-bold text-slate-800 mb-1">실력 진단 테스트</h2>
            <p className="text-slate-500 text-sm mb-6">
              10문제로 현재 수준을 파악하고 맞춤 문제를 받아보세요.
            </p>
            <button className="btn-primary w-full text-lg py-4" onClick={onStartDiagnostic}>
              진단 시작하기 →
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-slate-800 mb-4">오늘의 학습</h2>
            <button className="btn-primary w-full text-base py-4 mb-3" onClick={onStartPractice}>
              맞춤 문제 풀기 (10문제)
            </button>
            <button className="btn-secondary w-full text-base py-3 mb-6" onClick={onOpenDashboard}>
              실력 분석 보기
            </button>

            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              카테고리별 현황
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(state.topicStats).map(([cat, s]) => {
                const meta = CATEGORY_META[cat]
                return (
                  <div key={cat} className={`card border ${meta.color.split(' ').find(c => c.startsWith('border-')) || 'border-slate-100'} p-3`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span>{meta.icon}</span>
                      <span className="text-xs font-medium text-slate-700">{meta.label}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-nurse-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${s.skill}%` }}
                      />
                    </div>
                    <div className="text-right text-xs text-slate-500 mt-1">{s.skill}점</div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {state.totalAnswered > 0 && (
          <button
            className="mt-6 text-xs text-slate-400 underline w-full text-center"
            onClick={onReset}
          >
            처음부터 다시 시작
          </button>
        )}
      </div>
    </div>
  )
}
