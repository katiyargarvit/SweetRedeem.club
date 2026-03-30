'use client';

/** Program type icon — flight ✈ / hotel 🏨 */
interface ProgramIconProps {
  type: 'flight' | 'hotel';
  size?: number;
}

export function ProgramIcon({ type, size = 20 }: ProgramIconProps) {
  if (type === 'flight') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-text-secondary">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-text-secondary">
      <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
    </svg>
  );
}
