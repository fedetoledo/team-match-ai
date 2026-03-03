export function ProfileCardSkeleton() {
  return (
    <div className='bg-linear-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm animate-pulse flex flex-col'>
      {/* Header Skeleton */}
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3 min-w-0'>
          <div className='shrink-0 w-10 h-10 rounded-full bg-gray-700/50' />
          <div className='space-y-1.5'>
            <div className='h-4 bg-gray-700/50 rounded w-32' />
            <div className='h-3 bg-gray-700/50 rounded w-24' />
          </div>
        </div>
        <div className='text-right shrink-0'>
          <div className='h-6 w-10 bg-gray-700/50 rounded' />
          <div className='h-3 w-10 bg-gray-700/50 rounded mt-1' />
        </div>
      </div>

      {/* Meta Skeleton */}
      <div className='flex gap-2 mt-2'>
        <div className='h-3 bg-gray-700/50 rounded w-16' />
        <div className='h-3 bg-gray-700/50 rounded w-3' />
        <div className='h-3 bg-gray-700/50 rounded w-20' />
      </div>

      {/* Skills Skeleton */}
      <div className='flex flex-wrap gap-1.5 mt-3'>
        <div className='h-6 w-20 bg-gray-700/50 rounded-full' />
        <div className='h-6 w-24 bg-gray-700/50 rounded-full' />
        <div className='h-6 w-16 bg-gray-700/50 rounded-full' />
      </div>
    </div>
  );
}
