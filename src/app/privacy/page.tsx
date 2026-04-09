import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';

export const metadata = {
  title: 'Privacy Policy — BookBudddy',
  description: 'Read the BookBudddy Privacy Policy.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-[#10175b] transition-colors mb-10 group text-[10px] font-bold uppercase tracking-widest"
        >
          <IconArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </Link>

        <h1 className="text-4xl font-serif font-black text-[#10175b] tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm font-medium mb-12">Last updated: April 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[#10175b] mb-3">1. Information We Collect</h2>
            <p>When you create a BookBudddy account, we collect your name, email address, and preferred language. We also store the books, notes, and vocabulary you create within the app.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#10175b] mb-3">2. How We Use Your Information</h2>
            <p>We use your information solely to provide and improve the BookBudddy service. This includes authenticating your account, delivering app features such as translation services, and sending emails you explicitly request (e.g., email verification, password reset).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#10175b] mb-3">3. Data Storage & Security</h2>
            <p>Your data is stored securely. Passwords are hashed using industry-standard algorithms and are never stored in plain text. We take reasonable technical measures to protect your information from unauthorised access.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#10175b] mb-3">4. Data Sharing</h2>
            <p>We do not sell, trade, or share your personal information with third parties, except as necessary to provide the service (e.g., email delivery providers) or as required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#10175b] mb-3">5. Cookies</h2>
            <p>BookBudddy uses a single authentication cookie to keep you signed in. This cookie is strictly necessary for the service to function and does not track you across other websites.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#10175b] mb-3">6. Your Rights</h2>
            <p>You may request deletion of your account and associated data at any time by contacting us through the application. Upon request, we will remove your personal information from our systems within a reasonable timeframe.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#10175b] mb-3">7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy within the application. Continued use of the service after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#10175b] mb-3">8. Contact</h2>
            <p>If you have any questions about this Privacy Policy or your data, please reach out to us through the BookBudddy application.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <Link href="/terms" className="text-[#283593] font-bold text-sm hover:underline underline-offset-4">
            Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
