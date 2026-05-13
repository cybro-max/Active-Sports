import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | ActiveSports',
  description: 'Learn about how ActiveSports uses cookies, what types of cookies we use, and how you can manage your cookie preferences.',
};

const sections = [
  {
    title: '1. What Are Cookies',
    body: 'Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the site owners. Cookies enable features like staying logged in between visits and remembering your preferences.',
  },
  {
    title: '2. How We Use Cookies',
    body: 'ActiveSports uses cookies to authenticate your session after signing in with Google or GitHub, maintain your preferences and settings, enable core Platform functionality, analyze usage patterns to improve performance, and prevent fraud and protect user accounts.',
  },
  {
    title: '3. Types of Cookies We Use',
    body: 'Essential Cookies: Required for the Platform to function properly. These include authentication cookies that keep you signed in and security cookies that protect your account. Analytics Cookies: Help us understand how users interact with the Platform so we can improve the experience. Preference Cookies: Remember your choices, such as language preferences and display settings.',
  },
  {
    title: '4. Third-Party Cookies',
    body: 'Google and GitHub set authentication cookies when you sign in through their OAuth services. Sentry may set cookies for error tracking and performance monitoring. API-Football does not set cookies in your browser as all API communication is server-to-server. We do not use advertising or tracking cookies from ad networks.',
  },
  {
    title: '5. Managing Cookies',
    body: 'Most web browsers allow you to control cookies through their settings. You can typically delete existing cookies, block all cookies, or set preferences for specific websites. Please note that blocking essential cookies may prevent you from signing in or using core features of ActiveSports.',
  },
  {
    title: '6. Cookie Duration',
    body: 'Session cookies are temporary and expire when you close your browser. Persistent cookies remain on your device for a set period (typically 30 days for authentication cookies) or until you manually delete them. Our authentication session cookies expire after 30 days of inactivity.',
  },
  {
    title: '7. Updates to This Policy',
    body: 'We may update this Cookie Policy to reflect changes in our practices or for operational, legal, or regulatory reasons. Significant changes will be communicated through the Platform. We recommend reviewing this policy periodically to stay informed about our use of cookies.',
  },
  {
    title: '8. Contact',
    body: 'For questions about our use of cookies, please contact us at privacy@activesports.live. We are happy to provide additional information about our data practices.',
  },
];

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="pt-0 pb-12 text-center fade-up">
        <h1 className="text-4xl sm:text-5xl font-display font-black text-white mb-4 tracking-tight">
          Cookie <span className="text-[var(--brand)]">Policy</span>
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
