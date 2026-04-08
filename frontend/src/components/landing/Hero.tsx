'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Users, BarChart3 } from 'lucide-react';

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let gsap: typeof import('gsap').gsap;

    async function animate() {
      const { gsap: g } = await import('gsap');
      gsap = g;

      // Set initial states
      gsap.set([titleRef.current, subtitleRef.current, ctaRef.current, statsRef.current], {
        opacity: 0,
        y: 30,
      });
      gsap.set(demoRef.current, { opacity: 0, scale: 0.96 });

      // Staggered entrance
      const tl = gsap.timeline({ delay: 0.1 });

      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
        .to(statsRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.2')
        .to(demoRef.current, { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, '-=0.4');
    }

    animate();
  }, []);

  return (
    <section
      ref={heroRef}
       className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 sm:pt-28 pb-20 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 lg:px-6 text-center">
        {/* Badge */}
         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono mt-4 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Real-time multiplayer typing
        </div>

        {/* Title */}
        <h1 ref={titleRef} className="text-5xl sm:text-7xl font-sans font-bold tracking-tight mb-6 leading-[1.05]">
          Type faster.
          <br />
          <span className="gradient-text">Race smarter.</span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed font-light"
        >
          The minimalist typing speed test with live multiplayer races, detailed analytics,
          and a distraction-free experience built for serious typists.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            href="/test"
            className="group flex items-center gap-2 px-6 py-3 bg-accent text-bg font-semibold rounded-xl hover:bg-accent-hover transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20"
          >
            Start Typing
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/multiplayer"
            className="flex items-center gap-2 px-6 py-3 bg-surface border border-white/8 text-text-primary font-medium rounded-xl hover:bg-surface-hover hover:border-white/12 transition-all duration-200"
          >
            <Users className="w-4 h-4 text-accent" />
            Race Multiplayer
          </Link>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="flex items-center justify-center gap-8 sm:gap-16 text-center mb-20">
          {[
            { label: 'Avg WPM', value: '68' },
            { label: 'Tests today', value: '12.4k' },
            { label: 'Active races', value: '340' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-accent">{stat.value}</div>
              <div className="text-xs text-text-secondary mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Demo typing preview */}
        <div
          ref={demoRef}
           className="glass-card rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <Stat label="WPM" value="94" color="accent" />
              <Stat label="ACC" value="98%" color="success" />
              <Stat label="TIME" value="30s" color="secondary" />
            </div>
            <div className="text-xs font-mono text-text-tertiary">30 sec mode</div>
          </div>
          <DemoWords />
        </div>
      </div>

      {/* Features row */}
       <div className="relative z-10max-w-[1200px] mx-auto w-full px-4 lg:px-6 mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <Zap className="w-5 h-5 text-accent" />,
              title: 'Zero lag typing',
              desc: 'Input handling optimized for sub-millisecond response. No debounce delays.',
            },
            {
              icon: <Users className="w-5 h-5 text-accent" />,
              title: 'Live multiplayer',
              desc: 'Create or join rooms with a 6-character code. Race up to 6 players in real-time.',
            },
            {
              icon: <BarChart3 className="w-5 h-5 text-accent" />,
              title: 'Detailed stats',
              desc: 'WPM over time, accuracy heatmaps, and complete test history with trends.',
            },
          ].map((f) => (
            <div key={f.title} className="glass-card rounded-xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/10 hover:border-accent/30 border border-transparent">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-accent/20 group-hover:scale-110">
                {f.icon}
              </div>
              <h3 className="font-semibold text-text-primary text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    accent: 'text-accent',
    success: 'text-text-success',
    secondary: 'text-text-secondary',
  };
  return (
    <div>
      <div className={`text-lg font-mono font-bold ${colorMap[color]}`}>{value}</div>
      <div className="text-xs text-text-tertiary uppercase tracking-wider">{label}</div>
    </div>
  );
}

function DemoWords() {
  const words = [
    { text: 'the', state: 'done' },
    { text: 'quick', state: 'done' },
    { text: 'brown', state: 'done' },
    { text: 'fox', state: 'active' },
    { text: 'jumps', state: 'pending' },
    { text: 'over', state: 'pending' },
    { text: 'the', state: 'pending' },
    { text: 'lazy', state: 'pending' },
    { text: 'dog', state: 'pending' },
    { text: 'and', state: 'pending' },
    { text: 'runs', state: 'pending' },
    { text: 'away', state: 'pending' },
  ];

  return (
    <div className="font-mono text-lg leading-relaxed flex flex-wrap gap-x-3 gap-y-1">
      {words.map((w, i) => (
        <span
          key={i}
          className={
            w.state === 'done'
              ? 'text-text-primary'
              : w.state === 'active'
              ? 'text-accent relative'
              : 'text-text-tertiary'
          }
        >
          {w.text}
          {w.state === 'active' && (
            <span className="absolute -right-0.5 top-0 bottom-0 w-0.5 bg-accent animate-caret-blink" />
          )}
        </span>
      ))}
    </div>
  );
}