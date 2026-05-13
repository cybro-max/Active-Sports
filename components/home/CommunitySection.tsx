import { MessageSquare, Send, Bell, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CommunitySection() {
  return (
    <section className="fade-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Discord / Community */}
        <div className="card p-8 border border-[var(--border)] bg-[#5865F2]/10 hover:bg-[#5865F2]/20 transition-all flex flex-col group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <MessageSquare className="w-48 h-48 text-[#5865F2]" />
          </div>
          
          <div className="relative z-10 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-[#5865F2] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(88,101,242,0.4)]">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="text-2xl font-black text-white mb-2">Join the Debate</h3>
            <p className="text-[var(--text-muted)] text-sm mb-8 max-w-sm">
              Connect with 15,000+ football fans on our official Discord. Live match chats, transfer news, and daily polls.
            </p>
          </div>
          
          <a href="#" className="relative z-10 btn-primary bg-[#5865F2] hover:bg-[#4752c4] text-white border-none py-4 font-black flex items-center justify-center gap-2 group/btn">
             Enter Discord Hub <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Telegram / Alerts */}
        <div className="card p-8 border border-[var(--border)] bg-[#0088cc]/10 hover:bg-[#0088cc]/20 transition-all flex flex-col group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Send className="w-48 h-48 text-[#0088cc]" />
          </div>

          <div className="relative z-10 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-[#0088cc] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,136,204,0.4)]">
              <Send className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-2xl font-black text-white mb-2">Ultra-Fast Alerts</h3>
            <p className="text-[var(--text-muted)] text-sm mb-8 max-w-sm">
              Get instant goal notifications and team news before any other app. 100% free for our community.
            </p>
          </div>

          <a href="#" className="relative z-10 btn-primary bg-[#0088cc] hover:bg-[#0077b5] text-white border-none py-4 font-black flex items-center justify-center gap-2 group/btn">
             Join Telegram Channel <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Trust / Features Bar */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
        {[
          { icon: <Bell className="w-5 h-5" />, title: 'No Delay Scores' },
          { icon: <BrainCircuit className="w-5 h-5" />, title: 'AI Match Insights', color: 'text-[var(--accent)]' },
          { icon: <ShieldCheck className="w-5 h-5" />, title: 'Secure & Private' },
          { icon: <Users className="w-5 h-5" />, title: 'Built for Fans' },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 text-xs font-bold text-[var(--text-muted)] group">
             <div className={`p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] group-hover:border-[var(--brand)] transition-colors ${item.color || ''}`}>
                {item.icon}
             </div>
             <span className="uppercase tracking-wider">{item.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

import { BrainCircuit } from 'lucide-react';
import { Users } from 'lucide-react';
