'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Keyboard, User, LogOut, Trophy, Zap, Menu, X, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/ui/AuthModal';

export function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const openSignIn = () => { setAuthTab('login'); setAuthOpen(true); setMenuOpen(false); };
  const openRegister = () => { setAuthTab('register'); setAuthOpen(true); setMenuOpen(false); };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-bg/80 backdrop-blur-md">
        <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Keyboard className="w-4 h-4 text-accent" />
            </div>
            <span className="font-mono font-semibold text-text-primary tracking-tight">
              Type<span className="text-accent">Craft</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            <NavLink href="/test">
              <Zap className="w-3.5 h-3.5" />
              Test
            </NavLink>
            <NavLink href="/multiplayer">
              <Trophy className="w-3.5 h-3.5" />
              Multiplayer
            </NavLink>

            <div className="w-px h-5 bg-surface-active mx-1" />

            {isLoggedIn ? (
              <div className="flex items-center gap-1">
                <NavLink href="/profile">
                  <User className="w-3.5 h-3.5" />
                  {user?.username}
                </NavLink>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <NavLink href="/profile">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Stats
                </NavLink>
                <button
                  onClick={openSignIn}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Sign in
                </button>
                <button
                  onClick={openRegister}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-bg bg-accent hover:bg-accent-hover rounded-lg transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="sm:hidden p-2 rounded-lg hover:bg-surface transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t border-white/5 bg-bg/95 backdrop-blur-md px-4 py-3 flex flex-col gap-1">
            <MobileNavLink href="/test" onClick={() => setMenuOpen(false)}>Test</MobileNavLink>
            <MobileNavLink href="/multiplayer" onClick={() => setMenuOpen(false)}>Multiplayer</MobileNavLink>
            <MobileNavLink href="/profile" onClick={() => setMenuOpen(false)}>Stats</MobileNavLink>
            <div className="h-px bg-surface-active my-1" />
            {isLoggedIn ? (
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out ({user?.username})
              </button>
            ) : (
              <>
                <button
                  onClick={openSignIn}
                  className="text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={openRegister}
                  className="text-left px-3 py-2 text-sm font-medium text-accent rounded-lg hover:bg-surface transition-colors"
                >
                  Create account
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href, children, onClick,
}: {
  href: string; children: React.ReactNode; onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors"
    >
      {children}
    </Link>
  );
}

