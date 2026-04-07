import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/lib/auth';
import { 
  IconBook2, IconLanguage, IconBrain, IconBookmarks, 
  IconFileText, IconSparkles, IconArrowRight, IconCheck,
  IconFlask, IconFileExport
} from '@tabler/icons-react';
import LayoutWrapper from '@/components/layout-wrapper';

export const metadata = {
  title: 'About | BookBuddy',
  description: 'Learn how BookBuddy helps you read English books and master vocabulary in your native language — Tamil or Sinhala.',
};

const features = [
  {
    icon: IconFileText,
    title: 'In-App PDF Reader',
    description: 'Read your books directly inside BookBuddy. No external apps needed — your reading and studying happen in one place.',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
  },
  {
    icon: IconLanguage,
    title: 'Instant Translation',
    description: 'Highlight any word or sentence from your book and get an instant Tamil or Sinhala translation powered by Google Translate.',
    color: 'text-sky-500',
    bg: 'bg-sky-50',
  },
  {
    icon: IconBookmarks,
    title: 'Vocabulary Curation',
    description: 'Save the words you decode. Every translation is stored as a curation entry, organized by page number, so you can revisit and review.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: IconBrain,
    title: 'AI Study Companion',
    description: 'Ask your Book Buddy AI anything about the book you\'re reading. It responds in a natural bilingual mix — English with Tamil or Sinhala — just like a local tutor.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: IconSparkles,
    title: 'Word Pool',
    description: 'A visual vocabulary bank that aggregates every word you\'ve saved across all your books — your private language journal, growing as you read.',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
  },
  {
    icon: IconBook2,
    title: 'Progress Tracking',
    description: 'Track how far you\'ve read across your library. BookBuddy remembers your current page and gives you a progress overview for every book.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
  },
  {
    icon: IconFlask,
    title: 'Researcher Mode',
    description: 'A specialized workspace for academic research. Curate papers, track catalogs, and use AI to decode complex scientific literature alongside your books.',
    color: 'text-fuchsia-600',
    bg: 'bg-fuchsia-50',
  },
  {
    icon: IconFileExport,
    title: 'Archive Exporting',
    description: 'Export your translated vocabulary and comprehensive reading notes into beautifully formatted PDFs, ready for offline review.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
];

const journey = [
  { step: '01', title: 'Add a Book', body: 'Search for a book by title or author. BookBuddy pulls in cover art, author details, and page count from the catalog.' },
  { step: '02', title: 'Upload Your PDF', body: 'Attach your own PDF copy to the book. It\'s securely stored and instantly accessible in the in-app reader.' },
  { step: '03', title: 'Read & Highlight', body: 'Open the reader, read at your pace, and select any text to translate it instantly into Tamil or Sinhala.' },
  { step: '04', title: 'Save & Curate', body: 'Save the translations you want to keep. They\'re stored by page number and searchable anytime.' },
  { step: '05', title: 'Chat with Your AI Tutor', body: 'Ask the AI companion to explain passages, themes, or context — all in a language that feels natural to you.' },
];

export default async function AboutPage() {
  const session = await getSession();

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-[#F4F5F6]">

        {/* ─── Hero ─── */}
        <section className="max-w-[900px] mx-auto px-6 pt-24 pb-20">
          <div className="mb-6">
            <span className="inline-block text-[10px] font-black font-sans uppercase tracking-[0.3em] text-[#10175b]/40 bg-[#10175b]/5 px-4 py-1.5 rounded-full">
              About BookBuddy
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-[#171717] tracking-tight leading-[1.1] mb-6">
            Read English.<br />
            <span className="text-[#10175b]">Understand Deeply.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 font-serif leading-relaxed max-w-2xl mb-10">
            BookBuddy was built for readers who love English literature but think and feel in Tamil or Sinhala. It bridges the gap between reading a word and truly understanding it — in the language that lives inside you.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            {session ? (
              <Link href="/library" className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#10175b] text-white rounded-2xl font-bold text-[14px] hover:bg-[#1a2066] transition-all shadow-lg shadow-[#10175b]/20 active:scale-[0.98]">
                Go to My Library
                <IconArrowRight size={16} strokeWidth={2.5} />
              </Link>
            ) : (
              <>
                <Link href="/login?tab=signup" className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#10175b] text-white rounded-2xl font-bold text-[14px] hover:bg-[#1a2066] transition-all shadow-lg shadow-[#10175b]/20 active:scale-[0.98]">
                  Get Started Free
                  <IconArrowRight size={16} strokeWidth={2.5} />
                </Link>
                <Link href="/login" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-slate-200 text-[#10175b] rounded-2xl font-bold text-[14px] hover:border-[#10175b]/30 transition-all shadow-sm">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </section>

        {/* ─── What is BookBuddy ─── */}
        <section className="max-w-[900px] mx-auto px-6 pb-20">
          <div className="bg-[#10175b] rounded-[32px] p-10 sm:p-14 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -left-10 w-80 h-80 bg-white/3 rounded-full pointer-events-none" />
            <div className="relative z-10 max-w-xl">
              <p className="text-[11px] font-black font-sans uppercase tracking-[0.3em] text-white/40 mb-4">The Mission</p>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight mb-5">
                Language should never be a wall between you and a great story.
              </h2>
              <p className="text-white/70 text-base leading-relaxed">
                Millions of students across Sri Lanka and South India read academic and literary texts in English every day — but storing, recalling, and internalizing that knowledge is harder when it isn't expressed in your mother tongue. BookBuddy changes that by making translation, curation, and AI-assisted comprehension a seamless part of the reading experience.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section className="max-w-[900px] mx-auto px-6 pb-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">Everything you need</h2>
            <div className="h-px flex-1 bg-slate-200 ml-8" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-slate-200 hover:shadow-sm transition-all group">
                <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon size={20} className={f.color} />
                </div>
                <h3 className="text-[15px] font-bold text-[#171717] mb-2 group-hover:text-[#10175b] transition-colors">{f.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="max-w-[900px] mx-auto px-6 pb-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">How it works</h2>
            <div className="h-px flex-1 bg-slate-200 ml-8" />
          </div>
          <div className="space-y-3">
            {journey.map((item, i) => (
              <div key={item.step} className="flex gap-5 bg-white border border-slate-100 rounded-2xl px-6 py-5 hover:border-slate-200 hover:shadow-sm transition-all">
                <div className="shrink-0 text-[11px] font-black font-sans text-[#10175b]/30 tracking-widest pt-0.5 w-7">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#171717] mb-1">{item.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{item.body}</p>
                </div>
                {i < journey.length - 1 && (
                  <div className="ml-auto shrink-0 self-center">
                    <IconArrowRight size={14} className="text-slate-200" />
                  </div>
                )}
                {i === journey.length - 1 && (
                  <div className="ml-auto shrink-0 self-center">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <IconCheck size={11} className="text-emerald-600" strokeWidth={3} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── Languages ─── */}
        <section className="max-w-[900px] mx-auto px-6 pb-20">
          <div className="bg-[#EBECEF] rounded-[32px] p-10 sm:p-14">
            <p className="text-[11px] font-black font-sans uppercase tracking-[0.3em] text-[#10175b]/40 mb-4">Supported Languages</p>
            <h2 className="text-3xl font-serif font-bold text-[#171717] mb-8">Built for South Asian readers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <p className="text-3xl mb-3 font-bold">தமிழ்</p>
                <h3 className="text-base font-bold text-[#171717] mb-1">Tamil</h3>
                <p className="text-[13px] text-slate-500">Full translation and AI support for Tamil-speaking readers from Tamil Nadu, Sri Lanka, and beyond.</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <p className="text-3xl mb-3 font-bold">සිංහල</p>
                <h3 className="text-base font-bold text-[#171717] mb-1">Sinhala</h3>
                <p className="text-[13px] text-slate-500">Full translation and AI support for Sinhalese readers — making English literature accessible to every Sri Lankan student.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        {!session && (
          <section className="max-w-[900px] mx-auto px-6 pb-24 text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#171717] mb-4">
              Start reading smarter today.
            </h2>
            <p className="text-slate-500 font-serif italic text-lg mb-8">Free to use. No credit card required.</p>
            <Link href="/login?tab=signup" className="inline-flex items-center gap-2.5 px-9 py-4 bg-[#10175b] text-white rounded-2xl font-bold text-[15px] hover:bg-[#1a2066] transition-all shadow-lg shadow-[#10175b]/20 active:scale-[0.98]">
              Create Your Account
              <IconArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </section>
        )}

        {/* ─── Footer ─── */}
        <footer className="border-t border-slate-200 py-8">
          <div className="max-w-[900px] mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <Image 
                src="/footer.png" 
                alt="BookBuddy" 
                width={140} 
                height={30} 
                className="object-contain h-8 w-auto"
              />
            </div>
            <p className="text-[11px] font-sans text-slate-400">
              © {new Date().getFullYear()} BookBuddy. Built by P.K. Saanu.
            </p>
          </div>
        </footer>

      </div>
    </LayoutWrapper>
  );
}
