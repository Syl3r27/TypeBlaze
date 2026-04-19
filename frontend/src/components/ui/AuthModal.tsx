'use client';
import { useState, useEffect, useRef } from 'react';
import { X, Keyboard, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const { login, register } = useAuth();
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) { setError(''); setSuccess(''); setLoading(false); setTab(defaultTab); setTimeout(() => firstInputRef.current?.focus(), 100); }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try { await login(loginEmail.trim(), loginPassword); setSuccess('Signed in! Closing...'); setTimeout(onClose, 800); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Login failed'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword) { setError('Please fill in all fields'); return; }
    if (regUsername.length < 3) { setError('Username must be at least 3 characters'); return; }
    if (regPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try { await register(regUsername.trim(), regEmail.trim(), regPassword); setSuccess('Account created! Closing...'); setTimeout(onClose, 800); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="absolute inset-0 bg-bg/90" />
      <div className="relative z-10 w-full max-w-sm brutal-card animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent border-2 border-black flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-white" />
            </div>
            <span className="font-pixel text-[10px] text-white">type<span className="text-accent">craft</span></span>
          </div>
          <button onClick={onClose} className="p-1.5 text-text-tertiary hover:text-white hover:bg-surface transition-colors border-2 border-black">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-0 px-6 pt-5 pb-0 border-b-[3px] border-black">
          <TabButton active={tab === 'login'} onClick={() => { setTab('login'); setError(''); }}>SIGN IN</TabButton>
          <TabButton active={tab === 'register'} onClick={() => { setTab('register'); setError(''); }}>REGISTER</TabButton>
        </div>
        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="flex items-center gap-2 text-sm text-text-error bg-text-error/10 px-3 py-2.5 mb-4 border-2 border-text-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-sm text-text-success bg-text-success/10 px-3 py-2.5 mb-4 border-2 border-text-success">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />{success}
            </div>
          )}
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <Field label="EMAIL"><input ref={firstInputRef} type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" className={inputClass} disabled={loading} autoComplete="email" /></Field>
              <Field label="PASSWORD">
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" className={cn(inputClass, 'pr-10')} disabled={loading} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
              <SubmitButton loading={loading}>SIGN IN</SubmitButton>
              <p className="text-center text-xs text-text-tertiary pt-1">No account?{' '}<button type="button" onClick={() => { setTab('register'); setError(''); }} className="text-accent hover:text-accent-hover transition-colors">Create one</button></p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <Field label="USERNAME"><input ref={firstInputRef} type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} placeholder="swift_typist" className={inputClass} disabled={loading} autoComplete="username" maxLength={20} /></Field>
              <Field label="EMAIL"><input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" className={inputClass} disabled={loading} autoComplete="email" /></Field>
              <Field label="PASSWORD">
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Min. 6 characters" className={cn(inputClass, 'pr-10')} disabled={loading} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
              <SubmitButton loading={loading}>CREATE ACCOUNT</SubmitButton>
              <p className="text-center text-xs text-text-tertiary pt-1">Already have an account?{' '}<button type="button" onClick={() => { setTab('login'); setError(''); }} className="text-accent hover:text-accent-hover transition-colors">Sign in</button></p>
            </form>
          )}
        </div>
        <div className="px-6 pb-5 text-center">
          <p className="text-xs text-text-tertiary">You can also{' '}<button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">continue as guest</button>{' '}— no signup required.</p>
        </div>
      </div>
    </div>
  );
}

const inputClass = 'w-full bg-surface border-[3px] border-black px-3.5 py-2.5 text-sm text-white placeholder:text-text-tertiary focus:outline-none focus:border-accent2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono shadow-brutal-sm';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div className="space-y-1.5"><label className="text-[10px] font-pixel text-text-secondary uppercase tracking-wider">{label}</label>{children}</div>);
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={cn('px-4 py-2 text-xs font-pixel transition-all border-b-4 -mb-[3px]',
        active ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-white')}>
      {children}
    </button>
  );
}

function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full btn-brutal flex items-center justify-center gap-2 py-2.5 mt-1 bg-accent text-black font-pixel text-[10px] disabled:opacity-60 disabled:cursor-not-allowed">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}
