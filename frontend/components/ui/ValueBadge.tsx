'use client';

import { cppTier } from '@/lib/api';

interface ValueBadgeProps {
  cpp: number;
  size?: 'sm' | 'md';
}

export function ValueBadge({ cpp, size = 'sm' }: ValueBadgeProps) {
  const tier = cppTier(cpp);
  return (
    <span
      className={`value-badge ${tier.color} ${tier.bg} ${
        size === 'md' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5'
      }`}
    >
      {tier.label}
    </span>
  );
}
