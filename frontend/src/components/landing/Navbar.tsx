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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b-4 border-black bg-bg">
         <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-accent border-[3px] border-black shadow-brutal-sm flex items-center justify-center group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all">
              <Keyboard className="w-4 h-4 text-white" />
            </div>
            <span className="font-pixel text-xs text-white tracking-tight">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-accent hover:bg-surface transition-colors"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-accent hover:bg-surface transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Sign in
                </button>
                <button
                  onClick={openRegister}
                  className="btn-brutal flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-black bg-accent hover:bg-accent-hover"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="sm:hidden p-2 hover:bg-surface transition-colors border-2 border-black"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t-[3px] border-black bg-bg px-4 py-3 flex flex-col gap-1">
            <MobileNavLink href="/test" onClick={() => setMenuOpen(false)}>Test</MobileNavLink>
            <MobileNavLink href="/multiplayer" onClick={() => setMenuOpen(false)}>Multiplayer</MobileNavLink>
            <MobileNavLink href="/profile" onClick={() => setMenuOpen(false)}>Stats</MobileNavLink>
            <div className="h-[3px] bg-black my-1" />
            {isLoggedIn ? (
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="text-left px-3 py-2 text-sm text-text-secondary hover:text-accent hover:bg-surface transition-colors flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out ({user?.username})
              </button>
            ) : (
              <>
                <button
                  onClick={openSignIn}
                  className="text-left px-3 py-2 text-sm text-text-secondary hover:text-accent hover:bg-surface transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={openRegister}
                  className="text-left px-3 py-2 text-sm font-bold text-accent hover:bg-surface transition-colors"
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
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-accent hover:bg-surface transition-colors"
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
      className="px-3 py-2 text-sm text-text-secondary hover:text-accent hover:bg-surface transition-colors"
    >
      {children}
    </Link>
  );
}
