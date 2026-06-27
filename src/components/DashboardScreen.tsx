import type { UserState } from '../types'
import { CATEGORY_META } from '../data/questions'

interface Props {
  state: UserState
  onBack: () => void
}

export default function DashboardScreen({ state, onBack }: Props) {
  const totalAnswered = state.totalAnswered
  const accuracy = totalAnswered > 0
    ? Math.round((state.totalCorrect / totalAnswered) * 100)
    : 0

  const sorted = Object.values(state.topicStats).sort((a, b) => a.skill - b.skill)
  const avgSkill = Math.round(sorted.reduce((s, t) => s + t.skill, 0) / sorted.length)

  function levelLabel(skill: number) {
    if (skill < 30) return { label: '입문', color: 'text-slate-500' }
    if (skill < 50) return { label: '기초', color: 'text-blue-500' }
    if (skill < 70) return { label: '중급', color: 'text-green-500' }
    if (skill < 85) return { label: '고급', color: 'text-purple-500' }
    return { label: '전문가', color: 'text-yellow-500' }
  }

  const level = levelLabel(avgSkill)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-nurse-700 to-nurse-800 px-5 pt-12 pb-8 text-white">
        <button onClick={onBack} className="text-nurse-200 text-sm mb-4 flex items-center gap-1">
          ← 홈으로
        </button>
        <h1 className="text-xl font-bold mb-4">나의 실력 분석</h1>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{avgSkill}</div>
            <div className="text-xs text-nurse-200 mt-0.5">평균 점수</div>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{accuracy}%</div>
            <div className="text-xs text-nurse-200 mt-0.5">정답률</div>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{totalAnswered}</div>
            <div className="text-xs text-nurse-200 mt-0.5">총 문제 수</div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <span className={`text-lg font-bold ${level.color}`}>{level.label} 레벨</span>
        </div>
      </div>

      <div className="flex-1 px-5 py-5 space-y-4 overflow-y-auto">
        {/* Category breakdown */}
        <div className="card">
          <h3 className="font-bold text-slate-700 mb-4">카테고리별 실력</h3>
          <div className="space-y-4">
            {sorted.map((s) => {
              const meta = CATEGORY_META[s.category]
              const lv = levelLabel(s.skill)
              return (
                <div key={s.category}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span>{meta.icon}</span>
                      <span className="text-sm font-medium text-slate-700">{meta.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${lv.color}`}>{lv.label}</span>
                      <span className="text-sm font-bold text-slate-600">{s.skill}점</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${s.skill}%`,
                        background: s.skill < 50
                          ? 'linear-gradient(to right, #f97316, #fb923c)'
                          : s.skill < 75
                            ? 'linear-gradient(to right, #0ea5e9, #38bdf8)'
                            : 'linear-gradient(to right, #22c55e, #4ade80)',
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {s.attempted}문제 · 정답 {s.correct}개
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Streak */}
        <div className="card flex items-center gap-4">
          <div className="text-4xl">🔥</div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{state.streak}연속</div>
            <div className="text-sm text-slate-500">연속 정답 스트릭</div>
          </div>
        </div>

        {/* Study tip based on weakness */}
        {sorted[0].skill < 50 && (
          <div className="card bg-amber-50 border border-amber-200">
            <h3 className="font-bold text-amber-800 mb-2">💡 학습 추천</h3>
            <p className="text-sm text-amber-700">
              <strong>{CATEGORY_META[sorted[0].category].label}</strong> 영역이 가장 취약합니다.
              맞춤 문제에서 이 영역 문제가 더 많이 출제됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
