import Link from 'next/link';
import { CloseTabButton } from '@/components/close-tab-button';

export const metadata = {
  title: 'Terms of Service — BookBudddy',
  description: 'Read the BookBudddy Terms of Service.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <CloseTabButton />

        <h1 className="text-4xl font-serif font-black text-[#10175b] tracking-tight mb-2">Terms of Service</h1>
        <p className="text-slate-400 text-sm font-medium mb-12">Last updated: April 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[#10175b] mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using BookBudddy, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#10175b] mb-3">2. Use of Service</h2>
            <p>BookBudddy is a personal study and reading companion designed for educational purposes. You agree to use the service only for lawful purposes and in a manner consistent with all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#10175b] mb-3">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorised use of your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#10175b] mb-3">4. Content</h2>
            <p>You retain ownership of any content you upload or create within BookBudddy. By uploading content, you grant us a limited licence to store and process it solely for the purpose of providing the service to you.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#10175b] mb-3">5. Limitation of Liability</h2>
            <p>BookBudddy is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#10175b] mb-3">6. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the service after any changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#10175b] mb-3">7. Contact</h2>
            <p>If you have any questions about these Terms, please contact us through the BookBudddy application.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <Link href="/privacy" className="text-[#283593] font-bold text-sm hover:underline underline-offset-4">
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
