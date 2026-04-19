'use client';
import Link from 'next/link';
import { Github, Mail, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-4 border-black bg-bg-secondary mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-pixel text-xs text-accent mb-3">TypeCraft</h3>
            <p className="text-sm text-text-secondary">
              Master your typing speed with real-time feedback and multiplayer racing.
            </p>
          </div>
          <div>
            <h4 className="font-pixel text-[10px] text-white mb-4">PRODUCT</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/test" className="text-text-secondary hover:text-accent transition-colors">Typing Test</Link></li>
              <li><Link href="/multiplayer" className="text-text-secondary hover:text-accent transition-colors">Multiplayer</Link></li>
              <li><Link href="/profile" className="text-text-secondary hover:text-accent transition-colors">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-pixel text-[10px] text-white mb-4">RESOURCES</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-text-secondary hover:text-accent transition-colors">Documentation</a></li>
              <li><a href="#" className="text-text-secondary hover:text-accent transition-colors">Blog</a></li>
              <li><a href="#" className="text-text-secondary hover:text-accent transition-colors">Leaderboard</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-pixel text-[10px] text-white mb-4">CONNECT</h4>
            <div className="flex gap-3">
              <a href="#" className="text-text-secondary hover:text-accent p-2 bg-surface border-2 border-black" aria-label="GitHub"><Github className="w-4 h-4" /></a>
              <a href="#" className="text-text-secondary hover:text-accent2 p-2 bg-surface border-2 border-black" aria-label="Email"><Mail className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
        <div className="border-t-[3px] border-black pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-text-secondary">© {currentYear} TypeCraft. Made with <Heart className="w-3 h-3 inline text-accent fill-accent" /> by developers.</p>
            <div className="flex gap-6 text-text-secondary">
              <a href="#" className="hover:text-accent transition-colors">Privacy</a>
              <a href="#" className="hover:text-accent transition-colors">Terms</a>
              <a href="#" className="hover:text-accent transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
