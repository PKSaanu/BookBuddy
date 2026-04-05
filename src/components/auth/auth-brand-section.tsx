import Image from 'next/image';
import type { AuthMode } from './auth-page';

interface AuthBrandSectionProps {
  mode: AuthMode;
}

export function AuthBrandSection({ mode }: AuthBrandSectionProps) {
  return (
    <div className="text-center md:text-left flex flex-col items-center md:items-start text-[#10175b] max-w-lg">
      <div className="mb-6">
        <Image 
            src="/logo.png" 
            alt="BookBuddy" 
            width={400} 
            height={100} 
            priority 
            className="h-16 md:h-20 lg:h-24 w-auto object-contain drop-shadow-sm"
        />
      </div>
      <div className="h-[340px] flex flex-col justify-start">
        {mode === 'login' ? (
          <>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight mb-6 leading-[1.15] select-none text-[#10175b]">
              Welcome <br/> <span className="text-[#283593]">back.</span>
            </h2>
            <p className="text-slate-500 text-lg lg:text-xl leading-relaxed font-medium md:max-w-md">
              Dive right back into your reading journey. Continue translating and expanding your custom vocabulary library effortlessly.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight mb-6 leading-[1.15] select-none text-[#10175b]">
              Your <span className="text-[#283593]">ultimate</span> <br/>
              reading <br />
              companion.
            </h2>
            <p className="text-slate-500 text-lg lg:text-xl leading-relaxed font-medium md:max-w-md">
              Instantly translate words into Tamil or Sinhala while reading, and save them directly to your personal book notes to build your vocabulary.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
