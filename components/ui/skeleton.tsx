import { cn } from '@/lib/utils/cn';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  );
}

export function PhoneticCardSkeleton() {
  return (
    <div className="phonetic-card">
      <Skeleton className="h-12 w-12 mx-auto mb-3" />
      <Skeleton className="h-8 w-24 mx-auto mb-2" />
      <Skeleton className="h-4 w-20 mx-auto mb-1" />
      <Skeleton className="h-3 w-16 mx-auto" />
      <Skeleton className="h-9 w-9 mx-auto mt-3 rounded-full" />
    </div>
  );
}

export function TextConverterSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    </div>
  );
}