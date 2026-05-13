import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | ActiveSports',
  description: 'Read the ActiveSports Terms of Service. By using our platform, you agree to these terms governing access, predictions, content, and community conduct.',
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using ActiveSports ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. We reserve the right to update these terms at any time, and continued use of the Platform constitutes acceptance of any changes.',
  },
  {
    title: '2. Description of Service',
    body: 'ActiveSports provides real-time football scores, match statistics, AI-powered insights, prediction battles, leaderboards, and related content. The Platform is designed for informational and entertainment purposes only. We do not provide gambling advice, and all odds displayed are for reference only.',
  },
  {
    title: '3. User Accounts',
    body: 'To access certain features, including predictions and leaderboards, you must create an account using Google or GitHub authentication. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You must provide accurate and complete information when creating your account.',
  },
  {
    title: '4. User Conduct',
    body: 'You agree not to use the Platform to post or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, invasive of privacy, hateful, or otherwise objectionable. We reserve the right to suspend or terminate accounts that violate these conduct standards.',
  },
  {
    title: '5. Predictions & Leaderboards',
    body: 'The prediction system is provided for entertainment purposes. PRO Points and leaderboard rankings are virtual and hold no monetary value. We reserve the right to modify the scoring system, reset leaderboards seasonally, and remove accounts suspected of manipulation or cheating.',
  },
  {
    title: '6. Intellectual Property',
    body: 'All content on the Platform, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, is the property of ActiveSports or its content suppliers and is protected by international copyright laws.',
  },
  {
    title: '7. Third-Party Data',
    body: 'Football data, including scores, statistics, odds, and player information, is provided by third-party services including API-Football. While we strive for accuracy, we cannot guarantee the completeness or timeliness of third-party data. ActiveSports is not responsible for errors or omissions in data provided by external sources.',
  },
  {
    title: '8. AI-Generated Content',
    body: 'The Platform uses artificial intelligence to generate match insights, predictions, and commentary. AI-generated content is for informational and entertainment purposes only and should not be considered definitive analysis. We do not guarantee the accuracy of AI-generated content.',
  },
  {
    title: '9. Limitation of Liability',
    body: 'ActiveSports is provided "as is" without warranties of any kind. We shall not be liable for any damages arising from the use or inability to use the Platform, including but not limited to direct, indirect, incidental, punitive, and consequential damages.',
  },
  {
    title: '10. Termination',
    body: 'We reserve the right to terminate or suspend access to the Platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation a breach of these Terms. Upon termination, your right to use the Platform will cease immediately.',
  },
  {
    title: '11. Governing Law',
    body: 'These Terms shall be governed and construed in accordance with applicable laws, without regard to conflict of law provisions. Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with applicable rules.',
  },
  {
    title: '12. Contact',
    body: 'If you have any questions about these Terms, please contact us at legal@activesports.live. We aim to respond to all inquiries within 48 hours.',
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="pt-0 pb-12 text-center fade-up">
        <h1 className="text-4xl sm:text-5xl font-display font-black text-white mb-4 tracking-tight">
          Terms of <span className="text-[var(--brand)]">Service</span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm">Last updated: January 2026</p>
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
