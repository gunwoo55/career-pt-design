'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { useOnboardingStore } from '@/store';
import { User, Mail, Briefcase, Award, BookOpen, Settings, ChevronRight, Edit2, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const { userSpec } = useOnboardingStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

  const jobLabels: Record<string, string> = {
    frontend: '프론트엔드 개발자',
    backend: '백엔드 개발자',
    fullstack: '풀스택 개발자',
    mobile: '모바일 개발자',
    'ai-ml': 'AI/ML 엔지니어',
    data: '데이터 엔지니어/분석가',
    devops: 'DevOps 엔지니어',
    security: '정병보안 전문가',
    product: '프로덕트 매니저',
    'ux-ui': 'UX/UI 디자이너',
    marketing: '디지털 마케터',
    consultant: '컨설턴트',
    finance: '금융/회계',
    others: '기타',
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white px-6 py-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">프로필</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            내 정보
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            설정
          </button>
        </div>

        <div className="px-4 py-6 space-y-4">
          {activeTab === 'profile' ? (
            <>
              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center">
                      <User size={32} className="text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-slate-800">사용자</div>
                      <div className="text-sm text-slate-500">{jobLabels[userSpec.targetJob || ''] || '목표 미설정'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                  >
                    {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">이름</label>
                      <input
                        type="text"
                        defaultValue="사용자"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">이메일</label>
                      <input
                        type="email"
                        defaultValue="user@example.com"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save size={18} /> 저장하기
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Mail size={18} className="text-slate-400" />
                      <span>user@example.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Briefcase size={18} className="text-slate-400" />
                      <span>{jobLabels[userSpec.targetJob || ''] || '미설정'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Spec Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-lg text-slate-800 mb-4">내 스펙</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <BookOpen size={16} />
                      <span className="text-sm">학점</span>
                    </div>
                    <div className="font-semibold text-slate-800">
                      {userSpec.gpa ? `${userSpec.gpa} / 4.5` : '미입력'}
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div>
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <Award size={16} />
                      <span className="text-sm">자격증</span>
                    </div>
                    {userSpec.certifications && userSpec.certifications.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {userSpec.certifications.map((cert, index) => (
                          <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm">
                            {cert}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-400 text-sm">등록된 자격증이 없습니다</div>
                    )}
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div>
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <Briefcase size={16} />
                      <span className="text-sm">활동/경험</span>
                    </div>
                    {userSpec.activities && userSpec.activities.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {userSpec.activities.map((activity, index) => (
                          <span key={index} className="px-3 py-1 bg-success-100 text-success-700 rounded-lg text-sm">
                            {activity}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-400 text-sm">등록된 활동이 없습니다</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Roadmap Button */}
              <button className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between text-left hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Settings size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">로드맵 수정</div>
                    <div className="text-sm text-slate-500">목표 직무와 기간 변경</div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
              </button>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {[
                { label: '알림 설정', icon: '🔔', description: '푸시 알림 받기' },
                { label: '테마 설정', icon: '🎨', description: '라이트/다크 모드' },
                { label: '데이터 동기화', icon: '☁️', description: '클라우드 백업' },
                { label: '도움말', icon: '❓', description: 'FAQ 및 문의' },
                { label: '약관 및 정책', icon: '📄', description: '이용약관 확인' },
              ].map((item, index) => (
                <button
                  key={index}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{item.label}</div>
                    <div className="text-sm text-slate-500">{item.description}</div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
              ))}
            </div>
          )}

          {/* App Version */}
          <div className="text-center text-sm text-slate-400 pt-4">
            Career PT v1.0.0
          </div>
        </div>
      </div>
    </Layout>
  );
}
