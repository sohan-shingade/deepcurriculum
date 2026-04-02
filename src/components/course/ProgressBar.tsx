"use client";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  className = "",
  showLabel = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-[#8888a0] w-10 text-right">
          {percentage}%
        </span>
      )}
    </div>
  );
}
