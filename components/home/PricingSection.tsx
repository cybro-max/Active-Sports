import { Check, X, Zap, Star, ShieldCheck, BarChart3, BellRing } from 'lucide-react';

export default function PricingSection() {
  return (
    <section className="fade-up">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-display font-black text-white mb-4">Never Miss Another Goal</h2>
        <p className="text-[var(--text-muted)] max-w-xl mx-auto">Choose the experience that fits your passion. From casual fan to tactical genius.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
        {/* Free Tier */}
        <div className="card p-8 sm:p-12 border border-[var(--border)] bg-[var(--bg-surface)] flex flex-col group hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Fan Tier</h3>
              <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-widest">Always Free</p>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <Zap className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
          </div>

          <div className="text-4xl font-black text-white mb-8">$0<span className="text-sm font-bold text-[var(--text-muted)]">/forever</span></div>

          <div className="space-y-4 mb-12 flex-1">
            {[
              { text: 'Live Match Scores', included: true },
              { text: 'Fixtures & Standings', included: true },
              { text: 'Basic Player Stats', included: true },
              { text: 'AI Match Predictions (Limited)', included: true },
              { text: 'Ad-Free Experience', included: false },
              { text: 'Ultra-Fast Alerts', included: false },
              { text: 'Advanced AI Insights', included: false },
            ].map((feature, i) => (
              <div key={i} className={`flex items-center gap-3 text-sm font-medium ${feature.included ? 'text-white' : 'text-[var(--text-muted)] line-through opacity-50'}`}>
                {feature.included ? <Check className="w-4 h-4 text-[var(--brand)]" /> : <X className="w-4 h-4" />}
                {feature.text}
              </div>
            ))}
          </div>

          <button className="w-full py-4 rounded-2xl border border-[var(--border)] bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs transition-all">
            Get Started Free
          </button>
        </div>

        {/* Premium Tier */}
        <div className="card p-8 sm:p-12 border border-[var(--brand)] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--brand-dim)] flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute top-0 right-0 p-4">
             <div className="bg-[var(--brand)] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">RECOMMENDED</div>
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">PRO Tier</h3>
              <p className="text-xs text-[var(--brand)] font-black uppercase tracking-widest">Extreme Performance</p>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--brand)] text-black shadow-[0_0_20px_rgba(0,230,118,0.4)]">
              <Star className="w-6 h-6 fill-current" />
            </div>
          </div>

          <div className="text-4xl font-black text-white mb-8">$5.99<span className="text-sm font-bold text-[var(--text-muted)]">/month</span></div>

          <div className="space-y-4 mb-12 flex-1">
            {[
              { text: 'Everything in Fan Tier', icon: <Check className="w-4 h-4" /> },
              { text: 'Ultra-Fast Push Alerts', icon: <BellRing className="w-4 h-4" /> },
              { text: 'Advanced AI Tactical Insights', icon: <BrainCircuit className="w-4 h-4" /> },
              { text: 'Unlimited Prediction Battles', icon: <BarChart3 className="w-4 h-4" /> },
              { text: 'Premium Profile Badges', icon: <ShieldCheck className="w-4 h-4" /> },
              { text: 'Ad-Free Global Experience', icon: <Zap className="w-4 h-4" /> },
              { text: 'Exclusive Betting Analytics', icon: <TrendingUp className="w-4 h-4" /> },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-bold text-white">
                <div className="text-[var(--brand)]">{feature.icon}</div>
                {feature.text}
              </div>
            ))}
          </div>

          <button className="w-full py-4 rounded-2xl bg-[var(--brand)] text-black font-black uppercase tracking-widest text-xs shadow-[0_10px_20px_-10px_rgba(0,230,118,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(0,230,118,0.6)] transition-all">
            Join the PRO Elite
          </button>
        </div>
      </div>
    </section>
  );
}

import { BrainCircuit } from 'lucide-react';
import { TrendingUp } from 'lucide-react';
