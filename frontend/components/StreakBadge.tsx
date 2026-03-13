'use client';

import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  days: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function StreakBadge({ days, size = 'md' }: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  }[size];

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  }[size];

  return (
    <div className={`inline-flex items-center bg-orange-100 text-orange-700 rounded-full font-semibold ${sizeClasses}`}>
      <Flame size={iconSizes} className="fill-orange-500 text-orange-500" />
      <span>{days}일 연속</span>
    </div>
  );
}
