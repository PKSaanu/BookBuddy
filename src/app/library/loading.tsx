import LayoutWrapper from '@/components/layout-wrapper';

export default function LibraryLoading() {
  return (
    <LayoutWrapper>
      <div className="px-6 py-10 md:px-12 md:py-16 xl:px-16 xl:py-20 animate-pulse w-full">
        <div className="max-w-7xl mx-auto">
            {/* Header Section Skeleton - Museum Stats Style */}
            <div className="mb-20 pb-12 border-b border-slate-300 flex flex-col xl:flex-row xl:items-end justify-between gap-12 isolate relative">
                <div className="max-w-3xl w-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                        <div className="h-3 w-32 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="h-16 md:h-24 w-3/4 max-w-lg bg-slate-200 rounded-2xl mb-8"></div>
                    
                    {/* Visual Stats Bar Skeleton */}
                    <div className="flex items-center gap-10 md:gap-16 pt-2">
                        <div className="flex flex-col gap-2">
                            <div className="h-2 w-16 bg-slate-200 rounded-full"></div>
                            <div className="h-10 w-24 bg-slate-200/50 rounded-xl"></div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="h-2 w-16 bg-slate-200 rounded-full"></div>
                            <div className="h-10 w-24 bg-slate-200/50 rounded-xl"></div>
                        </div>
                    </div>
                </div>
                
                <div className="shrink-0 mb-2">
                    <div className="h-12 w-40 bg-[#0f766e]/20 rounded-2xl"></div>
                </div>
            </div>

            {/* Book Grid Skeleton - Restored Vertical Layout */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 md:gap-x-10 gap-y-12 md:gap-y-16">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex flex-col w-full">
                        {/* Cover Skeleton */}
                        <div className="relative aspect-[2/3] mb-6 rounded-2xl bg-slate-200 w-full shadow-sm" />
                        
                        {/* Text Metadata Skeleton */}
                        <div className="flex flex-col space-y-3 px-1">
                            <div className="flex items-center gap-2">
                                <div className="h-[1px] w-4 bg-slate-200" />
                                <div className="h-2 w-16 bg-slate-100 rounded-full"></div>
                            </div>
                            <div className="h-5 w-full bg-slate-200 rounded-lg"></div>
                            <div className="h-4 w-2/3 bg-slate-100 rounded-md"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
