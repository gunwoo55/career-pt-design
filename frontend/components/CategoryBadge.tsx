'use client';

import { Check, Award, BookOpen, FolderGit2 } from 'lucide-react';

interface CategoryBadgeProps {
  category: 'study' | 'certificate' | 'activity' | 'portfolio';
  size?: 'sm' | 'md';
}

const categoryConfig = {
  study: {
    label: '학습',
    icon: BookOpen,
    color: 'bg-primary-100 text-primary-700 border-primary-200',
  },
  certificate: {
    label: '자격증',
    icon: Award,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  activity: {
    label: '활동',
    icon: Check,
    color: 'bg-success-100 text-success-700 border-success-200',
  },
  portfolio: {
    label: '포트폴리오',
    icon: FolderGit2,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
};

export default function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;
  
  const sizeClass = size === 'sm' 
    ? 'px-2 py-0.5 text-xs gap-1' 
    : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border ${config.color} ${sizeClass}`}>
      <Icon size={size === 'sm' ? 12 : 14} />
      {config.label}
    </span>
  );
}
