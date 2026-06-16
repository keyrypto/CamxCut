import { Home, HardDrive, Settings } from 'lucide-react';
import { useRouter } from '../router';
import { useState, useEffect, useRef, useCallback } from 'react';

interface NavItem {
  path: string;
  label: string;
  shortLabel: string;
  icon: typeof Home;
  matchPaths?: string[];
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', shortLabel: 'Home', icon: Home },
  {
    path: '/local-videos',
    label: 'Video Player',
    shortLabel: 'Library',
    icon: HardDrive,
    matchPaths: ['/local-videos', '/gallery'],
  },
  { path: '/settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
];

function resolveActiveIndex(route: string): number {
  const index = navItems.findIndex(
    item => item.path === route || item.matchPaths?.includes(route)
  );
  return index >= 0 ? index : 0;
}

export default function BottomNavigation() {
  const { currentRoute, navigate } = useRouter();
  const [activeIndex, setActiveIndex] = useState(() => resolveActiveIndex(currentRoute));
  const indicatorRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const updateIndicator = useCallback(() => {
    const item = itemRefs.current[activeIndex];
    const indicator = indicatorRef.current;
    if (!item || !indicator || !item.parentElement) return;

    const itemRect = item.getBoundingClientRect();
    const containerRect = item.parentElement.getBoundingClientRect();
    const left = itemRect.left - containerRect.left;
    const width = itemRect.width;

    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.width = `${width}px`;
  }, [activeIndex]);

  useEffect(() => {
    setActiveIndex(resolveActiveIndex(currentRoute));
  }, [currentRoute]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const handleNav = (path: string, idx: number) => {
    if (idx === activeIndex) return;
    setActiveIndex(idx);
    navigate(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent, path: string, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNav(path, idx);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const dir = e.key === 'ArrowLeft' ? -1 : 1;
      const next = Math.max(0, Math.min(navItems.length - 1, activeIndex + dir));
      if (next !== activeIndex) {
        handleNav(navItems[next].path, next);
        itemRefs.current[next]?.focus();
      }
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none select-none pb-4 md:pb-6"
      aria-label="Main navigation"
    >
      <div className="mx-auto w-full max-w-[22rem] px-4 md:max-w-md pointer-events-auto">
        <div
          className="
            relative flex items-center p-1.5 
            rounded-full bg-[var(--bg-primary)]/85 backdrop-blur-xl  
            shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]
          "
        >
          {/* Subtle sliding active background pill */}
          <div
            ref={indicatorRef}
            className="
              absolute top-1.5 bottom-1.5 left-0
              rounded-full bg-[var(--text-primary)]/5
              transition-[transform,width] duration-400 ease-[cubic-bezier(0.25,1,0.5,1)]
            "
            style={{ width: 0, transform: 'translateX(0)' }}
            aria-hidden
          />

          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = idx === activeIndex;

            return (
              <button
                key={item.path}
                ref={el => (itemRefs.current[idx] = el)}
                type="button"
                onClick={() => handleNav(item.path, idx)}
                onKeyDown={e => handleKeyDown(e, item.path, idx)}
                aria-current={active ? 'page' : undefined}
                aria-label={`${item.label}${active ? ' (current)' : ''}`}
                className={`
                  group relative z-10 flex flex-1 flex-col items-center justify-center
                  gap-0.5 py-1.5 px-2 rounded-full
                  transition-colors duration-200 ease-in-out
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
                  ${active ? 'cursor-default' : 'cursor-pointer active:scale-95'}
                `}
              >
                <Icon
                  className={`
                    transition-colors duration-300
                    ${active 
                      ? 'text-[var(--accent-main)]' 
                      : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'
                    }
                  `}
                  size={20}
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden
                />
                
                <span
                  className={`
                    font-outfit text-[10px] font-medium leading-none tracking-wide truncate max-w-full
                    transition-colors duration-300
                    ${active
                      ? 'text-[var(--accent-main)]'
                      : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'
                    }
                  `}
                >
                  <span className="md:hidden">{item.shortLabel}</span>
                  <span className="hidden md:inline">{item.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Safe area spacer for modern mobile devices */}
        <div
          className="h-[env(safe-area-inset-bottom)] min-h-[4px]"
          aria-hidden
        />
      </div>
    </nav>
  );
}