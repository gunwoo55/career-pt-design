'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ProgressBar({
  current,
  total,
  size = 'md',
  showLabel = true,
}: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);
  
  const heightClass = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }[size];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-600">진행률</span>
          <span className="text-sm font-semibold text-primary-600">
            {percentage}%
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full ${heightClass} overflow-hidden`}>
        <div
          className={`bg-gradient-to-r from-primary-500 to-success-500 ${heightClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-slate-400">{current} / {total} 완료</span>
        </div>
      )}
    </div>
  );
}
