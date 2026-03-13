'use client';

import { useForm } from 'react-hook-form';

interface Step3PeriodProps {
  defaultValue?: number;
  onSubmit: (data: { remainingMonths: number }) => void;
  onBack?: () => void;
}

const periodOptions = [
  { value: 3, label: '3개월', description: '집중 취업 준비' },
  { value: 6, label: '6개월', description: '단기 목표 달성' },
  { value: 12, label: '1년', description: '중장기 계획' },
  { value: 18, label: '1년 6개월', description: '충분한 준비 기간' },
  { value: 24, label: '2년 이상', description: '장기적인 커리어 전환' },
];

export default function Step3Period({ defaultValue, onSubmit, onBack }: Step3PeriodProps) {
  const { register, handleSubmit, watch } = useForm<{ remainingMonths: number }>({
    defaultValues: { remainingMonths: defaultValue || 6 },
  });

  const selectedValue = watch('remainingMonths');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-lg font-semibold text-slate-800">
          취업까지 남은 기간은?
        </label>
        <p className="text-sm text-slate-500">
          기간에 맞춰 현실적인 로드맵을 생성해드립니다
        </p>
      </div>

      <div className="space-y-3">
        {periodOptions.map((option) => (
          <label
            key={option.value}
            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedValue === option.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              value={option.value}
              {...register('remainingMonths', { valueAsNumber: true })}
              className="sr-only"
            />
            <div className="flex-1">
              <div className="font-semibold text-slate-800">{option.label}</div>
              <div className="text-sm text-slate-500">{option.description}</div>
            </div>
            {selectedValue === option.value && (
              <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </label>
        ))}
      </div>

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
