'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { LogIn, X } from 'lucide-react';

interface AuthModalContextType {
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

  const openAuthModal = () => setIsOpen(true);
  const closeAuthModal = () => setIsOpen(false);

  useEffect(() => {
    if (session) {
      setTimeout(() => setIsOpen(false), 0);
    }
  }, [session]);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isAuthModalOpen: isOpen }}>
      {children}
      
      {isOpen && status !== 'authenticated' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" suppressHydrationWarning>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={closeAuthModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl w-full max-w-md p-8 shadow-[var(--shadow-lg)] transform scale-100 opacity-100 transition-all z-10 overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-[var(--brand)] opacity-20 blur-[60px] pointer-events-none" />
            
            <button 
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-elevated)] rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mx-auto mb-6 shadow-xl">
                <LogIn className="w-8 h-8 text-[var(--brand)]" />
              </div>
              
              <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter mb-3">
                Sign In Required
              </h2>
              
              <p className="text-[var(--text-muted)] text-sm mb-8">
                You must be logged into ActiveSports to perform this action. Save your predictions, earn PRO Points, and dominate the leaderboards.
              </p>
              
              <button 
                onClick={() => signIn()}
                className="w-full py-4 bg-[var(--brand)] text-black font-black rounded-xl text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(33,150,243,0.3)]"
              >
                Sign In / Register
              </button>
              
              <p className="text-xs text-[var(--text-muted)] mt-6 px-4">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
