import LayoutWrapper from '@/components/layout-wrapper';

export default function WordPoolLoading() {
  return (
    <LayoutWrapper>
      <div className="max-w-[1200px] mx-auto px-6 py-10 md:py-16">
        <header className="mb-12">
          {/* Static Title */}
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#10175b] tracking-tight mb-4">
            Word Pool
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-serif italic animate-pulse">
            Visualizing your collection of deciphered gems
          </p>
        </header>

        <div className="space-y-12 animate-pulse mt-8">
          {/* Skeleton Search Input */}
          <div className="relative max-w-2xl">
            <div className="w-full bg-slate-200 rounded-full h-14 md:h-16 shadow-sm"></div>
          </div>

          {/* Skeleton Result Count */}
          <div className="flex items-center gap-3">
             <div className="w-24 h-6 bg-indigo-50 rounded-full"></div>
          </div>

          {/* Skeleton Word Cloud Surface */}
          <div className="min-h-[400px] w-full bg-white/50 border border-slate-200/60 rounded-[42px] p-8 md:p-12 relative overflow-hidden flex flex-wrap items-center justify-center gap-x-8 md:gap-x-12 gap-y-6 md:gap-y-10">
              
             {/* Floating dummy shapes to mimic words */}
             <div className="w-32 h-10 bg-slate-200/50 rounded-lg -rotate-3"></div>
             <div className="w-20 h-6 bg-slate-200/50 rounded-lg rotate-6"></div>
             <div className="w-48 h-12 bg-slate-200/50 rounded-lg -rotate-12"></div>
             <div className="w-24 h-8 bg-slate-200/50 rounded-lg rotate-2"></div>
             <div className="w-36 h-10 bg-slate-200/50 rounded-lg -rotate-6"></div>
             <div className="w-16 h-6 bg-slate-200/50 rounded-lg rotate-12"></div>
             <div className="w-40 h-8 bg-slate-200/50 rounded-lg -rotate-2"></div>

             {/* Decorative background dots mimicking real component */}
             <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-indigo-200/50" />
             <div className="absolute bottom-20 right-10 w-3 h-3 rounded-full bg-teal-200/50" />
             <div className="absolute top-1/2 right-1/4 w-1 h-1 rounded-full bg-slate-200" />
          </div>

          <div className="flex items-center gap-2 px-4">
             <div className="w-64 h-4 bg-slate-100 rounded-full"></div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
