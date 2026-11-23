import LayoutWrapper from '@/components/layout-wrapper';

export default function PaperLoading() {
  return (
    <LayoutWrapper disableScroll={true}>
      <div className="flex h-[calc(100vh-80px)] md:h-screen w-full overflow-hidden relative">
        <div className="flex-1 h-full overflow-y-auto md:px-12 md:py-10 xl:px-16 xl:py-12 relative animate-pulse">
          
          {/* Skeleton Mobile Ribbon */}
          <div className="md:hidden flex w-full bg-[#10175b]/10 h-[56px] border-b border-slate-200">
            <div className="flex-1 border-r border-white/20"></div>
            <div className="flex-1 border-r border-white/20"></div>
            <div className="flex-1 border-r border-white/20"></div>
            <div className="flex-1 border-r border-white/20"></div>
            <div className="flex-1 bg-[#0f766e]/30"></div>
          </div>
          
          <div className="px-5 py-8 md:p-0">
            <div className="max-w-[900px] mx-auto">
              
              {/* Paper Header Section Skeleton */}
              <div className="mb-8">
                <div className="hidden md:flex items-center justify-between w-full mb-6">
                  <div className="h-4 w-28 bg-slate-200 rounded-md"></div>
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-8 w-24 bg-slate-100 rounded-full border border-slate-200"></div>
                    <div className="h-8 w-20 bg-slate-100 rounded-full border border-slate-200"></div>
                    <div className="h-8 w-8 bg-red-50 rounded-full border border-red-100"></div>
                    <div className="h-8 w-14 bg-[#0f766e]/20 rounded-full"></div>
                    <div className="h-8 w-28 bg-[#10175b]/20 rounded-full hidden sm:block"></div>
                  </div>
                </div>

                <div className="flex flex-col border-b border-slate-200/50 pb-8">
                  <div className="h-10 sm:h-14 md:h-16 w-3/4 max-w-xl bg-slate-200 rounded-2xl mb-4"></div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <div className="h-5 w-48 bg-slate-200 rounded-md"></div>
                    <div className="h-4 w-32 bg-slate-100 rounded-full hidden sm:block"></div>
                  </div>
                </div>
              </div>

              {/* Translation Interactive Panel Skeleton */}
              <div className="mb-12">
                <div className="bg-[#EBECEF] rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 md:p-10 min-h-[140px] sm:min-h-[200px] flex flex-col justify-between">
                  <div>
                    <div className="h-3 w-36 bg-slate-300/70 rounded-md mb-4"></div>
                    <div className="h-[45px] sm:h-[60px] border-b border-slate-300/80 flex items-center">
                      <div className="h-6 sm:h-8 w-64 bg-slate-300/40 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-5 sm:pt-6 gap-4 sm:gap-0 mt-4">
                    <div className="h-10 sm:h-11 w-full sm:w-48 bg-white/70 rounded-full border border-slate-200"></div>
                    <div className="h-11 sm:h-12 w-full sm:w-36 bg-[#10175b]/30 rounded-[16px]"></div>
                  </div>
                </div>
              </div>

              {/* Saved Curation List Skeleton */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="h-3.5 w-36 bg-[#10175b]/20 rounded-full"></div>
                  <div className="h-[1px] flex-1 bg-[#10175b]/10 ml-4 md:ml-8" />
                </div>
                
                {/* Search & Flashcards Bar Skeleton */}
                <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="h-12 bg-white border border-slate-200 rounded-[18px] flex-1"></div>
                  <div className="h-12 w-full sm:w-48 bg-[#10175b]/15 rounded-[18px] shrink-0"></div>
                </div>

                {/* Page Group Header Skeleton */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
                  <div className="h-3 w-16 bg-slate-200 rounded-full"></div>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
                </div>
                
                {/* Curation List Items Skeleton */}
                <div className="divide-y divide-slate-100">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="py-4 sm:py-5 -mx-4 px-4 flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-2.5">
                        <div className="h-5 w-2/5 bg-slate-200 rounded-md"></div>
                        <div className="h-5 w-3/5 bg-slate-100 rounded-md"></div>
                        <div className="h-3 w-28 bg-slate-100 rounded-full mt-2"></div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="h-3 w-16 bg-slate-100 rounded-md"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
