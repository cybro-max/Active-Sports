import { signIn } from '@/auth';

const GoogleLogo = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[var(--bg-surface)] p-10 rounded-3xl border border-[var(--border-strong)] shadow-[var(--shadow-xl)] relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--brand)] opacity-10 blur-3xl pointer-events-none" />
        
        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] mb-6 shadow-lg">
            <svg className="w-8 h-8 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter">
            Welcome Back
          </h2>
          <p className="mt-3 text-sm text-[var(--text-muted)] max-w-[280px] mx-auto">
            Sign in to access your dashboard, predictions, and exclusive football insights.
          </p>
        </div>

        <div className="mt-10">
          <form
            action={async () => {
              'use server';
              await signIn('google', { redirectTo: '/' });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center py-4 px-6 bg-white hover:bg-gray-50 text-gray-900 rounded-2xl text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-[0_4px_20px_rgba(255,255,255,0.1)] group"
            >
              <GoogleLogo />
              <span>Continue with Google</span>
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-[var(--border)]">
            <p className="text-center text-[10px] text-[var(--text-muted)] uppercase tracking-widest leading-relaxed">
              By continuing, you agree to ActiveSports' <br />
              <a href="/terms" className="text-white hover:text-[var(--brand)] transition-colors">Terms of Service</a> and <a href="/privacy" className="text-white hover:text-[var(--brand)] transition-colors">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
