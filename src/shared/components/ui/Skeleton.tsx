import { cn } from '@/shared/utils/cn';

type SkeletonProps = {
  className?: string;
  width?: string;
  height?: string;
};

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn('bg-gray-200 rounded-lg animate-skeleton', className)}
      style={{
        ...(width ? { width } : undefined),
        ...(height ? { height } : undefined),
      }}
      aria-hidden="true"
    />
  );
}
