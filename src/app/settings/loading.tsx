import LayoutWrapper from '@/components/layout-wrapper';

export default function SettingsLoading() {
  return (
    <LayoutWrapper>
      <div className="max-w-[1400px] mx-auto p-10 lg:p-16 min-h-full flex flex-col xl:flex-row gap-16 xl:gap-24 relative animate-pulse w-full">
        
        {/* Main Content Area Skeleton */}
        <div className="flex-1 space-y-16 max-w-4xl pt-8">
            <div className="space-y-4">
                <div className="h-12 w-64 bg-slate-200 rounded-2xl mb-4"></div>
                <div className="h-4 w-full max-w-md bg-slate-100 rounded-md mb-2"></div>
                <div className="h-4 w-3/4 max-w-sm bg-slate-100 rounded-md"></div>
            </div>
            
            {/* Forms Skeletons */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-8 md:p-12 h-[380px] flex flex-col gap-6 shadow-sm">
                 <div className="h-6 w-48 bg-slate-200 rounded-lg mb-4"></div>
                 <div className="h-14 w-full bg-slate-50 rounded-2xl border border-slate-100"></div>
                 <div className="h-14 w-full bg-slate-50 rounded-2xl border border-slate-100"></div>
                 <div className="mt-auto flex justify-end">
                     <div className="h-12 w-36 bg-slate-200 rounded-2xl"></div>
                 </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-[32px] p-8 md:p-12 h-[350px] flex flex-col gap-6 shadow-sm">
                 <div className="h-6 w-48 bg-slate-200 rounded-lg mb-4"></div>
                 <div className="h-14 w-full bg-slate-50 rounded-2xl border border-slate-100"></div>
                 <div className="h-14 w-full bg-slate-50 rounded-2xl border border-slate-100"></div>
            </div>
        </div>

        {/* Right Sidebar - Profile Info and Danger Zone Skeleton */}
        <div className="xl:w-[420px] shrink-0 pt-8 flex flex-col min-h-full gap-16 pb-32 xl:pb-0">
          
          {/* Profile Card Skeleton */}
          <div className="bg-slate-100/80 rounded-[32px] p-12 text-center h-[460px] flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 left-0 right-0 h-40 bg-slate-200/50"></div>
             
             <div className="relative mb-8 w-36 h-36 rounded-[28px] bg-slate-200 border-4 border-[#F4F5F6]"></div>
             
             <div className="h-8 w-40 bg-slate-200 rounded-xl mb-4 z-10"></div>
             <div className="h-3 w-32 bg-slate-200 rounded-full mb-10 z-10"></div>
             
             <div className="flex items-center justify-center gap-12 pt-8 border-t border-slate-200 w-4/5 mx-auto z-10">
                 <div className="flex flex-col items-center">
                     <div className="h-8 w-16 bg-slate-200 rounded-lg mb-2"></div>
                     <div className="h-2 w-10 bg-slate-200 rounded-full"></div>
                 </div>
                 <div className="flex flex-col items-center">
                     <div className="h-8 w-16 bg-slate-200 rounded-lg mb-2"></div>
                     <div className="h-2 w-10 bg-slate-200 rounded-full"></div>
                 </div>
             </div>
          </div>

          <div className="rounded-[32px] p-10 h-[280px] bg-red-50 flex flex-col items-start border border-red-100">
             <div className="h-4 w-32 bg-red-200 rounded-full mb-8"></div>
             <div className="h-3 w-full bg-red-100 rounded-md mb-3"></div>
             <div className="h-3 w-4/5 bg-red-100 rounded-md mb-10"></div>
             <div className="mt-auto w-full h-14 bg-red-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
