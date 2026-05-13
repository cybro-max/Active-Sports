'use client';

import { useState } from 'react';
import { Fixture } from '@/lib/apifootball';
import { useAuthModal } from '@/components/auth/AuthModalProvider';
import { submitReaction } from '@/app/actions/reactions';
import { Smile, Send, Flame, Skull, Ghost } from 'lucide-react';
import Image from 'next/image';

interface ReactionHubClientProps {
  fixture: Fixture;
  initialReactions: any[];
  isLoggedIn: boolean;
}

const EMOJI_OPTIONS = ['🔥', '😭', '🤡', '⚽️', '🚮', '🐐', '🥶'];

export default function ReactionHubClient({ fixture, initialReactions, isLoggedIn }: ReactionHubClientProps) {
  const { openAuthModal } = useAuthModal();
  const [reactions, setReactions] = useState(initialReactions);
  const [message, setMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🔥');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRestrictedAction = () => {
    if (!isLoggedIn) openAuthModal();
  };

  const handleReaction = async (emoji: string) => {
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    
    setSelectedEmoji(emoji);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }

    setIsSubmitting(true);
    const result = await submitReaction(fixture.fixture.id, selectedEmoji, message);
    if (result.success) {
      // Optimistic update
      const newReaction = {
        id: Math.random().toString(),
        emoji: selectedEmoji,
        message,
        createdAt: new Date(),
        user: { name: 'You', image: null }
      };
      setReactions([newReaction, ...reactions]);
      setMessage('');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar: Match Info & Emoji Picker */}
      <div className="space-y-6">
        <div className="card p-6 bg-[var(--bg-surface)] border border-[var(--border)] text-center">
          <div className="flex items-center justify-center gap-6 mb-4">
            <Image src={fixture.teams.home.logo} alt={fixture.teams.home.name} width={48} height={48} />
            <span className="text-xl font-black text-white">{fixture.goals.home ?? 0} - {fixture.goals.away ?? 0}</span>
            <Image src={fixture.teams.away.logo} alt={fixture.teams.away.name} width={48} height={48} />
          </div>
          <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest">{fixture.fixture.status.long}</p>
        </div>

        <div className="card p-6 bg-[var(--bg-surface)] border border-[var(--border)]">
          <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">Quick React</h3>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`p-3 text-2xl rounded-xl transition-all ${selectedEmoji === emoji ? 'bg-[var(--accent)]/20 border border-[var(--accent)] scale-110' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="lg:col-span-2 card p-0 bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden flex flex-col h-[600px]">
        
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex justify-between items-center z-10 relative">
           <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
              <Smile className="w-4 h-4 text-[var(--accent)]" /> Live Feed
           </div>
           <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--danger)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--danger)]"></span>
              </span>
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Auto-updating</span>
           </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {reactions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50">
               <Ghost className="w-12 h-12 mb-2" />
               <p className="text-sm font-bold">No reactions yet. Be the first!</p>
            </div>
          ) : (
            reactions.map((reaction: any) => (
              <div key={reaction.id} className="fade-up flex gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                 <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-sm font-black text-white shrink-0">
                    {reaction.user?.name?.charAt(0) || '?'}
                 </div>
                 <div>
                    <div className="flex items-baseline gap-2 mb-1">
                       <span className="text-xs font-bold text-white">{reaction.user?.name || 'Fan'}</span>
                       <span className="text-[10px] text-[var(--text-muted)]">Just now</span>
                    </div>
                    <div className="text-sm text-[var(--text-muted)] flex items-center gap-2">
                       <span className="text-xl">{reaction.emoji}</span> {reaction.message}
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-elevated)] z-10 relative">
          <form onSubmit={handleSubmit} className="flex gap-2">
             <div className="flex-1 flex items-center bg-[var(--bg-base)] rounded-xl border border-[var(--border-strong)] focus-within:border-[var(--accent)] transition-colors px-4 py-1">
                <span className="text-2xl mr-2">{selectedEmoji}</span>
                <input 
                  type="text" 
                  placeholder="Add a comment... (optional)"
                  className="w-full bg-transparent border-none outline-none text-sm text-white h-10"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onClick={handleRestrictedAction}
                />
             </div>
             <button 
               type="submit"
               disabled={isSubmitting}
               className="p-3 bg-[var(--accent)] text-black rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center"
             >
               <Send className="w-5 h-5" />
             </button>
          </form>
        </div>
      </div>
    </div>
  );
}
