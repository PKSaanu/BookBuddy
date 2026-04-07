import LayoutWrapper from '@/components/layout-wrapper';

export default function DashboardLoading() {
  return (
    <LayoutWrapper>
      <div className="px-8 py-10 md:px-12 md:py-12 xl:px-24 xl:py-16 bg-[#F4F5F6] min-h-screen w-full">
        <div className="max-w-7xl mx-auto">
            {/* Header / Intro Static (No Skeleton) */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 gap-8">
                <div className="max-w-2xl w-full">
                     <p className="text-[12px] tracking-[0.2em] font-black text-slate-400 uppercase mb-4 animate-pulse">Welcome back, Scholar</p>
                     <h2 className="text-5xl md:text-7xl font-serif text-[#10175b] leading-[1.1] tracking-tight">
                        Your library is an <span className="italic">unwritten</span> chapter.
                     </h2>
                </div>
                <div className="shrink-0 mb-2">
                    <div className="w-48 h-12 bg-[#10175b]/20 rounded-xl animate-pulse flex items-center justify-center">
                      <div className="w-24 h-3 bg-[#10175b]/30 rounded-full"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Huge Left Book Card Skeleton */}
                <div className="xl:col-span-2">
                    <div className="bg-slate-200/60 rounded-[2rem] h-[500px] w-full animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-300/20 to-transparent"></div>
                        <div className="absolute bottom-12 left-12 space-y-4 w-2/3">
                            <div className="h-4 w-32 bg-slate-300/40 rounded-full"></div>
                            <div className="h-12 w-full bg-slate-300/60 rounded-xl"></div>
                            <div className="h-6 w-48 bg-slate-300/30 rounded-lg"></div>
                        </div>
                    </div>
                </div>

                {/* Split Status Column Skeleton */}
                <div className="xl:col-span-1 flex flex-col gap-6 h-[500px]">
                    <div className="flex-1 bg-[#10175b]/5 border border-[#10175b]/10 rounded-[2rem] w-full animate-pulse p-8 relative overflow-hidden">
                         <div className="absolute top-8 left-8 w-10 h-10 bg-[#10175b]/10 rounded-xl"></div>
                         <div className="mt-16 space-y-4">
                            <div className="h-6 w-3/4 bg-[#10175b]/10 rounded-lg"></div>
                            <div className="h-4 w-1/2 bg-[#10175b]/5 rounded-md"></div>
                         </div>
                    </div>
                    <div className="flex-1 bg-[#FDFCF7] border-l-8 border-[#10175b]/10 rounded-r-[2rem] rounded-l-md p-8 w-full animate-pulse relative">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <div className="h-2 w-12 bg-slate-200 rounded-full"></div>
                                <div className="h-4 w-12 bg-red-600/5 border border-red-600/5 rounded-sm"></div>
                            </div>
                            <div className="h-24 w-full bg-slate-100 rounded-xl mt-4"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Old books list skeleton */}
            <div className="mt-12 pb-12">
                 <div className="h-3 w-40 bg-slate-200 rounded-full mb-8 animate-pulse"></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {[...Array(3)].map((_, i) => (
                         <div key={i} className="rounded-[24px] h-56 bg-slate-200/40 border border-slate-100 p-8 flex flex-col justify-end gap-3 rotate-0 animate-pulse">
                            <div className="h-10 w-full bg-slate-300/20 rounded-xl backdrop-blur-sm"></div>
                            <div className="h-4 w-2/3 bg-slate-300/10 rounded-lg"></div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
