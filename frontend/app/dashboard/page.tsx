'use client';

import { useEffect } from 'react';
import Layout from '@/components/Layout';
import ProgressBar from '@/components/ProgressBar';
import CategoryBadge from '@/components/CategoryBadge';
import StreakBadge from '@/components/StreakBadge';
import { useDashboardStore, useRoadmapStore } from '@/store';
import { CheckCircle2, Circle, Target, Calendar, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { todayMissions, progress, toggleMission, generateDailyMissions } = useDashboardStore();
  const { getProgress, roadmap } = useRoadmapStore();
  const roadmapProgress = getProgress();

  useEffect(() => {
    generateDailyMissions();
  }, [generateDailyMissions]);

  const completedCount = todayMissions.filter((m) => m.completed).length;
  const completionRate = todayMissions.length > 0 
    ? Math.round((completedCount / todayMissions.length) * 100) 
    : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">오늘의 미션</h1>
              <p className="text-primary-100 text-sm mt-1">
                {new Date().toLocaleDateString('ko-KR', { 
                  month: 'long', 
                  day: 'numeric', 
                  weekday: 'long' 
                })}
              </p>
            </div>
            <StreakBadge days={progress.streakDays} size="md" />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
              <div className="flex items-center gap-2 text-primary-100 text-xs">
                <Target size={14} /> 오늘 진행률
              </div>
              <div className="text-2xl font-bold mt-1">{completionRate}%</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
              <div className="flex items-center gap-2 text-primary-100 text-xs">
                <Calendar size={14} /> 총 완료
              </div>
              <div className="text-2xl font-bold mt-1">{progress.totalCompletedTasks}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
              <div className="flex items-center gap-2 text-primary-100 text-xs">
                <TrendingUp size={14} /> 전체 진행률
              </div>
              <div className="text-2xl font-bold mt-1">{roadmapProgress}%</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Today's Missions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-slate-800">오늘의 미션</h2>
              <span className="text-sm text-slate-500">
                {completedCount} / {todayMissions.length} 완료
              </span>
            </div>

            <div className="space-y-3">
              {todayMissions.map((mission) => (
                <button
                  key={mission.id}
                  onClick={() => toggleMission(mission.id)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    mission.completed
                      ? 'border-success-200 bg-success-50'
                      : 'border-slate-200 hover:border-primary-300'
                  }`}
                >
                  <div className="mt-0.5">
                    {mission.completed ? (
                      <CheckCircle2 size={22} className="text-success-500" />
                    ) : (
                      <Circle size={22} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${mission.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {mission.title}
                    </div>
                    <div className="mt-1">
                      <CategoryBadge category={mission.category} size="sm" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {completionRate === 100 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-success-500 to-success-600 rounded-xl text-white text-center">
                <div className="font-bold text-lg">🎉 오늘의 미션 완료!</div>
                <div className="text-success-100 text-sm mt-1">훌륭해요! 내일도 함께해요</div>
              </div>
            )}
          </div>

          {/* Weekly Progress */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-lg text-slate-800 mb-4">이번 주 진행 상황</h2>
            <ProgressBar 
              current={progress.totalCompletedTasks} 
              total={progress.totalTasks} 
              size="md"
            />
          </div>

          {/* Quick Tip */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <div className="font-semibold text-amber-900">오늘의 팁</div>
                <p className="text-amber-800 text-sm mt-1">
                  꾸준한 학습이 가장 중요해요! 하루 30분이라도 매일 학습하는 습관을 만들어보세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
