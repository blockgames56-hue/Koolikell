import { ChevronLeft } from 'lucide-react';
import { navItems, type SectionId } from '@/types';
import { type Translations } from '@/i18n';

interface SidebarProps {
  active: SectionId;
  onChange: (id: SectionId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  t: Translations;
  shortenedActive?: boolean;
}

export function Sidebar({ active, onChange, collapsed, onToggleCollapse, t, shortenedActive }: SidebarProps) {
  const getLabel = (id: SectionId) => {
    switch (id) {
      case 'dashboard':
        return t.navDashboard;
      case 'bell-sounds':
        return t.navBells;
      case 'schedule':
        return t.navSchedule;
      case 'shortened':
        return t.navShortened;
      case 'settings':
        return t.navSettings;
      default:
        return '';
    }
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-56'
      } flex flex-col bg-white dark:bg-[#0c1424] border-r border-slate-200/90 dark:border-[#1e293b] transition-all duration-300 shrink-0`}
    >
      <div className="h-14 flex items-center justify-center border-b border-slate-200/90 dark:border-[#1e293b] px-3">
        <img
          src="./assets/logo.png"
          alt="Koolikell"
          className="w-9 h-9 object-contain"
        />
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          const isShortenedActive = shortenedActive && item.id === 'shortened';

          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer relative ${
                isActive
                  ? 'bg-[#edf5fc] dark:bg-[#16294a] text-[#185d9e] dark:text-[#7bb3e8] border border-[#b5d5f2]/60 dark:border-[#223d6b] shadow-xs'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#162440] hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              <div className="relative shrink-0">
                <Icon className="w-4 h-4" />
                {isShortenedActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{getLabel(item.id)}</span>
                  {isShortenedActive && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500 text-white shadow-2xs">
                      ON
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <button
        onClick={onToggleCollapse}
        className="h-10 flex items-center justify-center border-t border-slate-200/90 dark:border-[#1e293b] text-slate-400 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
      </button>
    </aside>
  );
}
