import { signIn } from '@/auth';

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[var(--bg-elevated)] p-8 rounded-2xl border border-[var(--border)] shadow-[var(--shadow-md)]">
        <div>
          <h2 className="mt-6 text-center text-3xl font-display font-black text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
            Access predictions, favorites, and the leaderboard.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <form
            action={async () => {
              'use server';
              await signIn('google', { redirectTo: '/' });
            }}
          >
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-[var(--border)] rounded-xl text-sm font-bold text-white bg-[var(--bg-subtle)] hover:bg-[var(--bg-elevated)] transition-all"
            >
              Sign in with Google
            </button>
          </form>
          <form
            action={async () => {
              'use server';
              await signIn('github', { redirectTo: '/' });
            }}
          >
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-[var(--bg-base)] bg-[var(--brand)] hover:brightness-110 shadow-[0_0_15px_rgba(0,230,118,0.3)] transition-all"
            >
              Sign in with GitHub
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
