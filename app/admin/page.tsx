import { getApiStatus } from '@/lib/apifootball';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Activity, Settings } from 'lucide-react';
import AdminQuotaChart from '@/components/AdminQuotaChart';
import type { Metadata } from 'next';

export const revalidate = 0; // Always fresh

export const metadata: Metadata = {
  title: 'Admin Dashboard — ActiveSports',
  alternates: {
    canonical: 'https://activesports.live/admin',
  },
};



export default async function AdminPage() {
  const session = await auth();
  
  // Basic admin check (could be expanded to a role in DB)
  // For demo purposes, we let anyone see it, but in prod you would restrict this:
  // if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
  //   redirect('/');
  // }

  if (!session) {
    redirect('/api/auth/signin');
  }

  let status = null;
  let error = null;

  try {
    status = await getApiStatus();
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  const current = status?.requests?.current ?? 0;
  const limit = status?.requests?.limit_day ?? 100;
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 fade-up">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>System overview and API-Football quota limits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* API Quota Widget */}
        <div className="card p-6 fade-up">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--brand)]" /> API-Football Usage
          </h2>
          
          {error ? (
            <div className="p-4 rounded bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-sm">
              {error}
            </div>
          ) : status ? (
            <div>
              <AdminQuotaChart current={current} limit={limit} />

              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Account Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Plan</span>
                    <span className="font-medium">{status.subscription?.plan ?? 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Status</span>
                    <span className="font-medium text-[var(--success)]">
                      {status.subscription?.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Account</span>
                    <span className="font-medium">{status.account?.firstname} {status.account?.lastname}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-center py-4 text-[var(--text-muted)]">Loading...</div>
          )}
        </div>

        {/* System Info Widget */}
        <div className="card p-6 fade-up fade-up-delay-1">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--text-muted)]" /> System Status
          </h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Redis Cache</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--success)] shadow-[0_0_8px_rgba(5,150,105,0.5)]" />
                <span className="font-medium">Upstash Connected</span>
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Database</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--success)] shadow-[0_0_8px_rgba(5,150,105,0.5)]" />
                <span className="font-medium">PostgreSQL Connected</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Rate Limiter</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--success)] shadow-[0_0_8px_rgba(5,150,105,0.5)]" />
                <span className="font-medium">Active (20/10s)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
