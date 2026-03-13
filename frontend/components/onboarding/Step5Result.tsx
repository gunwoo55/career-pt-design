'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Map, Target, Calendar } from 'lucide-react';

interface Step5ResultProps {
  targetJob: string;
  remainingMonths: number;
}

export default function Step5Result({ targetJob, remainingMonths }: Step5ResultProps) {
  const router = useRouter();

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
    <div className="space-y-6">
      <div className="text-center space-y-4 py-6">
        <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-success-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            로드맵 생성 완료!
          </h2>
          <p className="text-slate-500 mt-2">
            이제 목표를 향해 함께 달려봐요
          </p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <Target size={24} className="text-primary-600" />
          </div>
          <div>
            <div className="text-sm text-slate-500">목표 직무</div>
            <div className="font-semibold text-slate-800">{jobLabels[targetJob] || targetJob}</div>
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
            <Calendar size={24} className="text-success-600" />
          </div>
          <div>
            <div className="text-sm text-slate-500">준비 기간</div>
            <div className="font-semibold text-slate-800">{remainingMonths}개월</div>
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Map size={24} className="text-amber-600" />
          </div>
          <div>
            <div className="text-sm text-slate-500">생성된 단계</div>
            <div className="font-semibold text-slate-800">4개 단계, 14개 미션</div>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full px-6 py-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
        >
          대시보드로 이동
          <ArrowRight size={20} />
        </button>
        <button
          onClick={() => router.push('/roadmap')}
          className="w-full px-6 py-4 border border-slate-300 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
        >
          로드맵 먼저 확인하기
        </button>
      </div>
    </div>
  );
}
