import Link from 'next/link';
import { Mail, Globe, MessageCircle, Zap, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with ActiveSports. We would love to hear your feedback, questions, and suggestions for improving the platform.',
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Hero */}
      <section className="relative pt-0 pb-16 mb-16 fade-up">
        <div className="absolute inset-0 rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden -z-10 shadow-[var(--shadow-md)]">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Mail className="w-96 h-96 -mr-20 -mt-20 text-white" />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--brand)] to-transparent opacity-30" />
        </div>
        <div className="relative z-10 p-8 sm:p-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)] text-[var(--brand)] text-[10px] font-black uppercase tracking-widest mb-6">
            <Zap className="w-3 h-3 fill-current" /> Get in Touch
          </div>
          <h1 className="text-5xl sm:text-7xl font-display font-black text-white mb-6 tracking-tight leading-[0.95]">
            Contact <span className="text-[var(--brand)]">Us</span>
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            We would love to hear from you. Whether you have feedback, questions, or partnership inquiries, our team is here to help.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="mb-16 fade-up">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Mail,
              title: 'Email Us',
              desc: 'Drop us a line and we will get back to you as soon as possible. Best for detailed inquiries and partnership opportunities.',
              contact: 'hello@activesports.live',
              action: 'Send Email',
            },
            {
              icon: MessageCircle,
              title: 'Social Media',
              desc: 'Follow us for live updates, match highlights, and community announcements. Join the conversation with fellow fans.',
              contact: '@activesports',
              action: 'Follow Us',
            },
            {
              icon: Globe,
              title: 'Press & Media',
              desc: 'For press inquiries, media credentials, and interview requests. We are happy to connect journalists with our data team.',
              contact: 'press@activesports.live',
              action: 'Contact Press',
            },
          ].map((item, i) => (
            <div key={i} className="card p-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--brand-dim)] border border-[var(--brand)]/20 flex items-center justify-center mx-auto">
                <item.icon className="w-7 h-7 text-[var(--brand)]" />
              </div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-[var(--text-body)] leading-[1.8] text-[15px]">{item.desc}</p>
              <div className="pt-4 border-t border-[var(--border)]">
                <p className="text-sm font-bold text-[var(--brand)] mb-3">{item.contact}</p>
                <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-16 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>Frequently Asked <span className="text-[var(--brand)]">Questions</span></h2>
        </div>
        <div className="space-y-4">
          {[
            { q: 'Is ActiveSports free to use?', a: 'Yes, ActiveSports is completely free. We provide live scores, match insights, predictions, and leaderboards without any cost. Some advanced API features may be introduced in the future on a premium tier.' },
            { q: 'How do predictions work?', a: 'Sign in with Google or GitHub, navigate to any upcoming match, and submit your predicted final score. If your prediction is accurate, you earn PRO Points that contribute to your global ranking.' },
            { q: 'Where does the data come from?', a: 'We source live football data from API-Football, a trusted provider serving professional sports organizations worldwide. Odds data, statistics, and player information are all provided through their verified API.' },
            { q: 'How can I report an issue?', a: 'Contact us at support@activesports.live with details about the issue. We monitor all incoming reports and prioritize fixes that affect the user experience.' },
          ].map((item, i) => (
            <div key={i} className="card p-6 space-y-3">
              <h3 className="text-white font-bold">{item.q}</h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="fade-up">
        <div className="relative rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden p-10 sm:p-16 text-center">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
              We Are <span className="text-[var(--brand)]">Listening</span>
            </h2>
            <p className="text-[var(--text-muted)] text-lg leading-relaxed">
              ActiveSports is built for the community, by the community. Every suggestion and piece of feedback shapes the future of this platform.
            </p>
            <Link href="/" className="card px-8 py-4 bg-[var(--brand)] text-black font-black inline-flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(33,150,243,0.3)]">
              Back to Scores <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
