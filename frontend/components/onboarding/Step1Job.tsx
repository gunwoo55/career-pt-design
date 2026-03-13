'use client';

import { useForm } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';

interface Step1JobProps {
  defaultValue?: string;
  onSubmit: (data: { targetJob: string }) => void;
  onBack?: () => void;
}

const jobOptions = [
  { value: '', label: '목표 직무를 선택해주세요' },
  { value: 'frontend', label: '프론트엔드 개발자' },
  { value: 'backend', label: '백엔드 개발자' },
  { value: 'fullstack', label: '풀스택 개발자' },
  { value: 'mobile', label: '모바일 개발자' },
  { value: 'ai-ml', label: 'AI/ML 엔지니어' },
  { value: 'data', label: '데이터 엔지니어/분석가' },
  { value: 'devops', label: 'DevOps 엔지니어' },
  { value: 'security', label: '정병보안 전문가' },
  { value: 'product', label: '프로덕트 매니저' },
  { value: 'ux-ui', label: 'UX/UI 디자이너' },
  { value: 'marketing', label: '디지털 마케터' },
  { value: 'consultant', label: '컨설턴트' },
  { value: 'finance', label: '금융/회계' },
  { value: 'others', label: '기타' },
];

export default function Step1Job({ defaultValue = '', onSubmit, onBack }: Step1JobProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ targetJob: string }>({
    defaultValues: { targetJob: defaultValue },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-lg font-semibold text-slate-800">
          목표 직무를 선택해주세요
        </label>
        <p className="text-sm text-slate-500">
          AI가 직무에 맞는 최적의 로드맵을 생성해드립니다
        </p>
      </div>

      <div className="relative">
        <select
          {...register('targetJob', { required: '목표 직무를 선택해주세요' })}
          className="w-full px-4 py-4 pr-12 bg-white border border-slate-300 rounded-xl text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        >
          {jobOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
      </div>

      {errors.targetJob && (
        <p className="text-sm text-red-500">{errors.targetJob.message}</p>
      )}

      <div className="flex gap-3 pt-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-4 border border-slate-300 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            이전
          </button>
        )}
        <button
          type="submit"
          className="flex-1 px-6 py-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
        >
          다음
        </button>
      </div>
    </form>
  );
}
