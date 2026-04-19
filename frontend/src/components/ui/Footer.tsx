'use client';
import { Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t-4 border-black bg-bg-secondary relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p className="font-pixel text-[9px] text-text-tertiary tracking-wide">
            CRAFTED BY{' '}
            <a
              href="https://omprakashpati.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover transition-colors"
            >
              OM
            </a>
            {' '}&amp;{' '}
            <a
              href="https://konal.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent2 hover:text-accent2-hover transition-colors"
            >
              KONAL
            </a>
            {'  '}<span className="text-accent">:)</span>
          </p>
          <a
            href="https://github.com/Syl3r27/TypeCraft"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-text-secondary hover:text-accent p-2 bg-surface border-2 border-black transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
