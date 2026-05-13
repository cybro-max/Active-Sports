import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the ActiveSports Privacy Policy. Learn how we collect, use, and protect your personal information when you use our platform.',
};

const sections = [
  {
    title: '1. Information We Collect',
    body: 'When you sign in using Google or GitHub OAuth, we receive basic profile information including your name, email address, and profile picture. We do not collect or store your passwords. Additionally, we collect usage data including pages visited, features used, and interactions with the Platform to improve our service.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to provide and maintain the Platform, personalize your experience, display your profile on leaderboards (with your name and avatar), enable prediction and reaction features, communicate service updates, and analyze usage patterns to improve the Platform.',
  },
  {
    title: '3. Data Storage',
    body: 'Your account data is stored in a PostgreSQL database hosted on Neon.tech with encryption at rest and in transit. We implement industry-standard security measures to protect your data, including SSL/TLS encryption for all data transfers and secure authentication protocols.',
  },
  {
    title: '4. Third-Party Services',
    body: 'We use the following third-party services: API-Football for sports data, OpenRouter for AI-generated content, Upstash Redis for caching, Sentry for error tracking, and Google/GitHub for authentication. Each service has its own privacy policy, and we recommend reviewing them. We do not sell your personal data to third parties.',
  },
  {
    title: '5. Cookies',
    body: 'ActiveSports uses essential cookies for authentication and session management. We may also use analytics cookies to understand how users interact with the Platform. You can manage cookie preferences through your browser settings. For more details, see our Cookie Policy.',
  },
  {
    title: '6. Your Rights',
    body: 'You have the right to access, correct, or delete your personal data. You can update your profile information at any time. To request complete account deletion, please contact us at privacy@activesports.live. We will process deletion requests within 30 days, subject to any legal obligations to retain certain data.',
  },
  {
    title: '7. Data Retention',
    body: 'We retain your personal data for as long as your account is active. Prediction history and leaderboard records may be retained in anonymized form for statistical purposes even after account deletion. We regularly review our data retention practices to ensure compliance with applicable laws.',
  },
  {
    title: '8. Children\'s Privacy',
    body: 'ActiveSports is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information immediately.',
  },
  {
    title: '9. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify users of significant changes via email or through a prominent notice on the Platform. Continued use of the Platform after changes constitutes acceptance of the updated policy. We recommend reviewing this page periodically.',
  },
  {
    title: '10. Contact Us',
    body: 'For questions about this Privacy Policy or to exercise your data rights, please contact us at privacy@activesports.live. We take privacy seriously and will respond to all inquiries promptly.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="pt-0 pb-12 text-center fade-up">
        <h1 className="text-4xl sm:text-5xl font-display font-black text-white mb-4 tracking-tight">
          Privacy <span className="text-[var(--brand)]">Policy</span>
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
