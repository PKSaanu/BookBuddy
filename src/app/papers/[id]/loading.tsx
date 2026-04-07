import LayoutWrapper from '@/components/layout-wrapper';

export default function BookLoading() {
  return (
    <LayoutWrapper>
      <div className="px-5 py-8 md:px-12 md:py-10 xl:px-16 xl:py-12 animate-pulse w-full">
        <div className="max-w-[1000px] mx-auto">
            
            {/* Paper Header Section Skeleton */}
            <div className="mb-8 border-b border-slate-200/50 pb-8">
                <div className="flex items-center justify-between w-full mb-8">
                    <div className="h-4 w-24 bg-slate-200 rounded-md"></div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="h-8 w-16 bg-slate-100 rounded-full"></div>
                        <div className="h-8 w-16 bg-slate-100 rounded-full"></div>
                        <div className="h-8 w-12 bg-red-50/50 rounded-full"></div>
                        <div className="h-8 w-24 bg-[#0f766e]/10 rounded-full"></div>
                        <div className="h-8 w-32 bg-[#10175b]/20 rounded-full hidden md:block"></div>
                    </div>
                </div>

                
                <div className="flex flex-col">
                     <div className="h-12 sm:h-16 w-3/4 bg-slate-200 rounded-xl mb-6"></div>
                     <div className="flex items-center gap-4">
                         <div className="h-5 w-40 bg-slate-100 rounded-md"></div>
                         <div className="h-3 w-24 bg-[#10175b]/10 rounded-full hidden sm:block"></div>
                     </div>
                </div>
            </div>

            {/* Translation Interactive Panel Skeleton */}
            <div className="mb-12">
                <div className="bg-white border mb-1 border-slate-200 shadow-sm rounded-3xl p-6 min-h-[250px] flex flex-col gap-4">
                    <div className="h-4 w-32 bg-slate-100 rounded-md mb-2"></div>
                    <div className="flex-1 space-y-3">
                        <div className="h-6 w-full bg-slate-100 rounded-md"></div>
                        <div className="h-6 w-5/6 bg-slate-100 rounded-md"></div>
                        <div className="h-6 w-4/6 bg-slate-100 rounded-md"></div>
                    </div>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between">
                         <div className="h-10 w-24 bg-slate-100 rounded-2xl"></div>
                         <div className="h-10 w-32 bg-slate-200 rounded-2xl md:ml-auto"></div>
                    </div>
                </div>
            </div>

            {/* Saved Curation List Skeleton */}
            <div>
                <div className="flex items-center justify-between mb-8">
                    <div className="h-3 w-40 bg-[#10175b]/20 rounded-full"></div>
                    <div className="h-[1px] flex-1 bg-slate-200 ml-8" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-[20px] p-6 h-[180px] flex flex-col justify-between">
                             <div>
                                 <div className="h-4 w-1/3 bg-slate-200 rounded-md mb-3"></div>
                                 <div className="h-5 w-2/3 bg-slate-100 rounded-md"></div>
                             </div>
                             <div className="flex justify-between items-end">
                                 <div className="h-3 w-16 bg-slate-100 rounded-full"></div>
                                 <div className="h-8 w-8 bg-slate-100 rounded-xl"></div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
