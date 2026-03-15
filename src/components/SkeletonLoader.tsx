import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function SkeletonBox({ className = '' }: SkeletonProps) {
  return (
    <div className={`skeleton-shimmer rounded-sm bg-border/30 ${className}`} />
  );
}

export function SkeletonText({ className = '' }: SkeletonProps) {
  return (
    <div className={`skeleton-shimmer rounded-sm bg-border/30 h-4 ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="card-brutal p-5 space-y-4 transition-colors">
      <div className="flex items-center space-x-4">
        <SkeletonBox className="w-12 h-12 shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-3/4" />
          <SkeletonText className="w-1/2 h-3" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonPricing() {
  return (
    <div className="p-4 bg-bg border-2 border-border rounded-sm space-y-3 transition-colors">
      <div className="flex justify-between">
        <SkeletonText className="w-24" />
        <SkeletonText className="w-16" />
      </div>
      <div className="h-px bg-border" />
      <div className="flex justify-between">
        <SkeletonText className="w-32" />
        <SkeletonText className="w-20" />
      </div>
      <div className="h-px bg-border" />
      <div className="flex justify-between">
        <SkeletonText className="w-28" />
        <SkeletonText className="w-14" />
      </div>
    </div>
  );
}
