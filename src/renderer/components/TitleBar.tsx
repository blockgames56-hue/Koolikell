import React from 'react';
import { Minus, Square, X } from 'lucide-react';

export function TitleBar() {
  const handleMinimize = () => {
    window.koolikellApi?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.koolikellApi?.maximizeWindow();
  };

  const handleClose = () => {
    window.koolikellApi?.closeWindow();
  };

  return (
    <div
      className="h-9 bg-white dark:bg-[#0c1424] border-b border-slate-200/90 dark:border-[#1e293b] flex items-center justify-between px-3 select-none shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        <img
          src="./assets/logo.png"
          alt=""
          className="w-4 h-4 object-contain"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-wider">
          KOOLIKELL
        </span>
      </div>

      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-colors"
          title="Свернуть"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-colors"
          title="Развернуть"
        >
          <Square className="w-2.5 h-2.5" />
        </button>
        <button
          onClick={handleClose}
          className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-red-500 dark:text-slate-300 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          title="Свернуть в трей"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
