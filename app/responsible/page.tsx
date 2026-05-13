import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Responsible Play | ActiveSports',
  description: 'ActiveSports promotes responsible engagement with football predictions and betting-related content. Learn about our commitment to user well-being.',
};

const sections = [
  {
    title: '1. Our Commitment',
    body: 'ActiveSports is committed to promoting responsible engagement with football content. Our prediction battles and odds comparisons are designed for entertainment and informational purposes only. We do not facilitate real-money gambling, and all PRO Points on our platform are virtual with no monetary value.',
  },
  {
    title: '2. Understand the Risks',
    body: 'While our platform does not involve real-money gambling, we display betting odds for informational purposes. If you choose to engage with real-money betting through external platforms, please be aware of the risks: gambling should never be viewed as a way to make money, set strict limits on time and money spent, never chase losses, and do not gamble when upset, stressed, or under the influence of alcohol.',
  },
  {
    title: '3. Warning Signs',
    body: 'Be aware of warning signs that may indicate problematic gambling behavior: spending more time or money than intended, neglecting responsibilities or relationships, borrowing money or selling possessions to gamble, lying about gambling activities, and feeling anxious or irritable when not gambling. If you recognize any of these signs in yourself or someone you care about, seek help.',
  },
  {
    title: '4. Resources for Help',
    body: 'If gambling is affecting your life or someone you care about, professional help is available. Consider reaching out to organizations such as Gamblers Anonymous, the National Problem Gambling Helpline (1-800-522-4700 in the US), GamCare (UK), or local support services in your country. These services are free, confidential, and available 24/7.',
  },
  {
    title: '5. Platform Features',
    body: 'ActiveSports includes features designed to promote healthy engagement: our predictions are purely for entertainment with no real-money stakes, leaderboard rankings are seasonal and reset regularly, AI-powered match insights provide balanced, data-driven perspectives, and we never promote excessive betting or "guaranteed win" narratives.',
  },
  {
    title: '6. Age Restrictions',
    body: 'Users must be at least 13 years of age to use ActiveSports. If you choose to engage with external betting platforms, you must comply with the legal gambling age in your jurisdiction, which is typically 18 or 21 years old depending on your location.',
  },
  {
    title: '7. Contact',
    body: 'If you have concerns about the content on our platform or suggestions for improving our responsible play initiatives, please contact us at responsible@activesports.live. We take user well-being seriously and value your feedback.',
  },
];

export default function ResponsiblePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="pt-0 pb-12 text-center fade-up">
        <h1 className="text-4xl sm:text-5xl font-display font-black text-white mb-4 tracking-tight">
          Responsible <span className="text-[var(--brand)]">Play</span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm">Your well-being matters</p>
      </div>

      <div className="space-y-8">
        {sections.map((section, i) => (
          <div key={i} className="card p-8 space-y-4 fade-up">
            <h2 className="text-xl font-bold text-white">{section.title}</h2>
            <p className="text-[var(--text-body)] leading-[1.8] text-[15px]">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
