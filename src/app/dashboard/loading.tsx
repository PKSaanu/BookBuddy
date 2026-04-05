import LayoutWrapper from '@/components/layout-wrapper';

export default function DashboardLoading() {
  return (
    <LayoutWrapper>
      <div className="px-8 py-10 md:px-12 md:py-12 xl:px-24 xl:py-16 animate-pulse w-full">
        <div className="max-w-7xl mx-auto">
            {/* Header / Intro Skeleton */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 gap-8">
                <div className="max-w-2xl w-full">
                     <div className="h-3 w-32 bg-slate-200 rounded-full mb-6"></div>
                     <div className="h-14 md:h-20 w-4/5 max-w-xl bg-slate-200 rounded-2xl"></div>
                </div>
                <div className="shrink-0 mb-2">
                    <div className="h-12 w-40 bg-[#0f766e]/20 rounded-2xl"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Huge Left Book Card Skeleton */}
                <div className="xl:col-span-2">
                    <div className="bg-slate-200 rounded-[2rem] h-[500px] w-full" />
                </div>

                {/* Split Status Column Skeleton */}
                <div className="xl:col-span-1 flex flex-col gap-6 h-[500px]">
                    <div className="flex-1 bg-[#10175b]/10 rounded-[2rem] w-full" />
                    <div className="flex-1 bg-white border border-slate-100 rounded-[2rem] w-full" />
                </div>
            </div>

            {/* Old books list skeleton */}
            <div className="mt-12 pb-12">
                 <div className="h-3 w-32 bg-slate-200 rounded-full mb-6"></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {[...Array(3)].map((_, i) => (
                         <div key={i} className="rounded-[24px] h-48 bg-slate-200/50" />
                     ))}
                 </div>
            </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
