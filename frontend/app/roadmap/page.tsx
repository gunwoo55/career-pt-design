'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import ProgressBar from '@/components/ProgressBar';
import CategoryBadge from '@/components/CategoryBadge';
import { useRoadmapStore } from '@/store';
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Flag } from 'lucide-react';

export default function RoadmapPage() {
  const { roadmap, updateStepProgress, getProgress } = useRoadmapStore();
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const progress = getProgress();

  if (!roadmap) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Flag size={32} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">로드맵이 없습니다</h2>
          <p className="text-slate-500 text-center mt-2">
            온볼딩을 완료하여 맞춤형 로드맵을 생성해주세요
          </p>
        </div>
      </Layout>
    );
  }

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  };

  const totalTasks = roadmap.steps.reduce((sum, step) => sum + step.tasks.length, 0);
  const completedTasks = roadmap.steps.reduce(
    (sum, step) => sum + step.tasks.filter((t) => t.completed).length,
    0
  );

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white px-6 py-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">{roadmap.title}</h1>
          <p className="text-slate-500 text-sm mt-1">
            생성일: {new Date(roadmap.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Overall Progress */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg text-slate-800">전체 진행률</h2>
                <p className="text-sm text-slate-500">{completedTasks} / {totalTasks} 태스크 완료</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{progress}%</span>
              </div>
            </div>
            <ProgressBar current={completedTasks} total={totalTasks} size="lg" showLabel={false} />
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-slate-800 px-1">학습 단계</h2>

            {roadmap.steps.map((step, index) => {
              const isExpanded = expandedSteps.includes(step.id);
              const stepCompletedTasks = step.tasks.filter((t) => t.completed).length;
              const isStepComplete = stepCompletedTasks === step.tasks.length && step.tasks.length > 0;
              
              return (
                <div 
                  key={step.id} 
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all ${
                    isStepComplete ? 'ring-2 ring-success-200' : ''
                  }`}
                >
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="w-full px-5 py-4 flex items-center gap-4"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isStepComplete 
                        ? 'bg-success-100 text-success-600' 
                        : 'bg-primary-100 text-primary-600'
                    }`}>
                      {isStepComplete ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <span className="font-bold">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-slate-800">{step.title}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock size={12} /> {step.duration}
                        </span>
                        <span className="text-xs text-slate-400">
                          {stepCompletedTasks} / {step.tasks.length} 완료
                        </span>
                      </div>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4 animate-fade-in">
                      <p className="text-sm text-slate-600 mb-4 pl-14">{step.description}</p>
                      
                      <div className="space-y-2 pl-14">
                        {step.tasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => updateStepProgress(step.id, task.id, !task.completed)}
                            className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                              task.completed
                                ? 'border-success-200 bg-success-50'
                                : 'border-slate-200 hover:border-primary-300'
                            }`}
                          >
                            <div className="mt-0.5">
                              {task.completed ? (
                                <CheckCircle2 size={18} className="text-success-500" />
                              ) : (
                                <Circle size={18} className="text-slate-300" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className={`text-sm ${task.completed ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                                {task.title}
                              </div>
                            </div>
                            <CategoryBadge category={task.category} size="sm" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-primary-500 to-success-500 rounded-2xl p-5 text-white">
            <div className="font-bold text-lg mb-2">로드맵 진행 중 💪</div>
            <p className="text-primary-100 text-sm">
              꾸준한 노력이 취업으로 이어집니다. 오늘도 한 걸음 더 나아가요!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
