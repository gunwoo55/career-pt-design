'use client';

import { useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface Step4LoadingProps {
  onComplete: () => void;
}

export default function Step4Loading({ onComplete }: Step4LoadingProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-success-100 flex items-center justify-center">
          <Sparkles size={40} className="text-primary-600" />
        </div>
        <div className="absolute -bottom-2 -right-2">
          <Loader2 size={24} className="animate-spin text-success-500" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-slate-800">
          AI가 로드맵을 생성하고 있어요
        </h3>
        <p className="text-slate-500">
          입력하신 정보를 바탕으로 최적의 학습 계획을 준비하고 있습니다
        </p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <div className="flex items-center gap-3 text-sm text-slate-600 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-success-500" />
          목표 직무 분석 중...
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="w-2 h-2 rounded-full bg-success-500" />
          현재 스펙 평가 중...
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600 animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          맞춤형 로드맵 생성 중...
        </div>
      </div>
    </div>
  );
}
