import { Menu, Sun, Moon, Monitor } from 'lucide-react';
import { useStore } from '../../store';
import type { Theme } from '../../types';
import NotificationCenter from './NotificationCenter';

interface Props { onMenu: () => void; }

export default function MobileBar({ onMenu }: Props) {
  const theme = useStore(s => s.theme);
  const setTheme = useStore(s => s.setTheme);

  const cycle = () => {
    const next: Theme = theme === 'warm' ? 'dark' : theme === 'dark' ? 'system' : 'warm';
    setTheme(next);
  };

  const Icon = theme === 'dark' ? Moon : theme === 'system' ? Monitor : Sun;

  return (
    <header className="lg:hidden sticky top-0 z-30 h-14 bg-bg2 border-b border-line flex items-center justify-between px-4 backdrop-blur">
      <button
        onClick={onMenu}
        className="w-9 h-9 border border-line rounded-md text-ink hover:bg-bg3 hover:border-line2 flex items-center justify-center"
      >
        <Menu size={18} strokeWidth={1.5} />
      </button>
      <div className="text-xl text-ink leading-none"
           style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500, letterSpacing: '-0.015em' }}>
        Fin<span style={{ fontStyle: 'italic', color: 'var(--ff-coral)' }}>Flow</span>
      </div>
      <div className="flex items-center gap-1">
        <NotificationCenter />
        <button
          onClick={cycle}
          className="w-9 h-9 border border-line rounded-md text-ink hover:bg-bg3 hover:border-line2 flex items-center justify-center"
        >
          <Icon size={16} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
