import LayoutWrapper from '@/components/layout-wrapper';
import { IconSignature } from '@tabler/icons-react';

export default function LibraryLoading() {
  return (
    <LayoutWrapper>
      <div className="px-6 py-10 md:px-12 md:py-16 xl:px-16 xl:py-20 bg-[#F4F5F6] min-h-screen w-full">
        <div className="max-w-7xl mx-auto">
            {/* Header Section Static (No Skeleton) */}
            <div className="mb-20 pb-12 border-b border-slate-300 flex flex-col xl:flex-row xl:items-end justify-between gap-12 relative">
                <div className="max-w-3xl w-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#10175b] rounded-xl flex items-center justify-center text-white shadow-lg">
                            <IconSignature size={24} />
                        </div>
                        <p className="text-[11px] md:text-[13px] tracking-[0.3em] font-black text-[#10175b]/40 uppercase">Curated Collection</p>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif text-[#10175b] font-bold tracking-tight leading-[1.1] mb-8">
                        The <span className="italic">Scholar's</span> <br/> Private Archive.
                    </h1>
                    
                    {/* Visual Stats Bar Skeleton - Keep these as skeletons as they are dynamic */}
                    <div className="flex items-center gap-10 md:gap-16 pt-2 h-14">
                        <div className="flex flex-col gap-2">
                            <div className="h-2 w-16 bg-slate-200 rounded-full animate-pulse"></div>
                            <div className="h-10 w-24 bg-slate-200/50 rounded-xl animate-pulse"></div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="h-2 w-16 bg-slate-200 rounded-full animate-pulse"></div>
                            <div className="h-10 w-24 bg-slate-200/50 rounded-xl animate-pulse"></div>
                        </div>
                    </div>
                </div>
                
                <div className="shrink-0 mb-6 md:mb-2">
                    <div className="w-48 h-12 bg-[#10175b]/20 rounded-xl animate-pulse flex items-center justify-center">
                      <div className="w-24 h-3 bg-[#10175b]/30 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Book Grid Skeleton - Matches Exact Page Design */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 md:gap-x-10 gap-y-12 md:gap-y-16">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex flex-col w-full animate-pulse">
                        <div className="relative aspect-[2/3] mb-6 rounded-2xl bg-slate-200/60 shadow-inner overflow-hidden">
                             {/* Mock Binding shadow */}
                             <div className="absolute inset-y-0 left-0 w-3 bg-black/5" />
                        </div>
                        
                        {/* Text Metadata Skeleton - Precision Aligned */}
                        <div className="flex flex-col space-y-3 px-1">
                            <div className="flex items-center gap-2">
                                <div className="h-[1px] w-4 bg-slate-300" />
                                <div className="h-2 w-20 bg-slate-200 rounded-full"></div>
                            </div>
                            <div className="h-5 w-full bg-slate-300/40 rounded-lg"></div>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-12 bg-slate-200 rounded-md"></div>
                              <div className="w-1 h-1 bg-slate-100 rounded-full" />
                              <div className="h-3 w-20 bg-slate-100 rounded-md"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
