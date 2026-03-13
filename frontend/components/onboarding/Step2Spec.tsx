'use client';

import { useForm } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface Step2SpecProps {
  defaultValues?: {
    gpa?: number;
    certifications?: string[];
    activities?: string[];
  };
  onSubmit: (data: { gpa: number; certifications: string[]; activities: string[] }) => void;
  onBack?: () => void;
}

export default function Step2Spec({ defaultValues, onSubmit, onBack }: Step2SpecProps) {
  const { register, handleSubmit, setValue, watch } = useForm<{
    gpa: number;
    certifications: string[];
    activities: string[];
  }>({
    defaultValues: {
      gpa: defaultValues?.gpa || 3.0,
      certifications: defaultValues?.certifications || [],
      activities: defaultValues?.activities || [],
    },
  });

  const certifications = watch('certifications') || [];
  const activities = watch('activities') || [];
  
  const [newCert, setNewCert] = useState('');
  const [newActivity, setNewActivity] = useState('');

  const addCert = () => {
    if (newCert.trim()) {
      setValue('certifications', [...certifications, newCert.trim()]);
      setNewCert('');
    }
  };

  const removeCert = (index: number) => {
    setValue(
      'certifications',
      certifications.filter((_, i) => i !== index)
    );
  };

  const addActivity = () => {
    if (newActivity.trim()) {
      setValue('activities', [...activities, newActivity.trim()]);
      setNewActivity('');
    }
  };

  const removeActivity = (index: number) => {
    setValue(
      'activities',
      activities.filter((_, i) => i !== index)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-lg font-semibold text-slate-800">
          현재 스펙을 입력해주세요
        </label>
        <p className="text-sm text-slate-500">
          보유한 자격증과 활동 경험을 알려주세요
        </p>
      </div>

      {/* GPA */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">학점 (4.5 기준)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="4.5"
          {...register('gpa', { valueAsNumber: true })}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Certifications */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">보유 자격증</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCert}
            onChange={(e) => setNewCert(e.target.value)}
            placeholder="예: 정보처리기사, TOEIC 900..."
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
          />
          <button
            type="button"
            onClick={addCert}
            className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {certifications.map((cert, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm"
            >
              {cert}
              <button
                type="button"
                onClick={() => removeCert(index)}
                className="ml-1 hover:text-primary-900"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Activities */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">활동/경험</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            placeholder="예: 개발 동아리, 인턴십..."
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addActivity())}
          />
          <button
            type="button"
            onClick={addActivity}
            className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activities.map((activity, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-success-100 text-success-700 rounded-lg text-sm"
            >
              {activity}
              <button
                type="button"
                onClick={() => removeActivity(index)}
                className="ml-1 hover:text-success-900"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
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
