import React from 'react';
import { Search, Plus, Share2, Sparkles, X, Network, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openAddModal: () => void;
  openShareModal: () => void;
  openAskAi: () => void;
  openCommandPalette: () => void;
  openGraphModal: () => void;
  totalItems: number;
  activeType: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  openAddModal,
  openShareModal,
  openAskAi,
  openCommandPalette,
  openGraphModal,
  totalItems,
  activeType,
}) => {
  const { theme, toggleTheme } = useTheme();

  const getCategoryTitle = () => {
    switch (activeType) {
      case 'twitter': return 'Twitter / X Bookmarks';
      case 'youtube': return 'Saved YouTube Videos';
      case 'document': return 'Documents & Notes';
      case 'link': return 'Web Links';
      default: return 'All Knowledge Cards';
    }
  };

  return (
    <header className="flex flex-col gap-4 pb-5 mb-6 border-b border-slate-200 dark:border-zinc-800/80 w-full min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
            <span>{getCategoryTitle()}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Organize, search, and chat with your digital knowledge
          </p>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all bg-white border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 shadow-sm cursor-pointer"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
        {/* Search Bar / Command Palette Trigger */}
        <div 
          onClick={openCommandPalette}
          className="relative flex-1 min-w-0 cursor-pointer"
        >
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, links, tags... (Press Ctrl + K)"
            className="w-full bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-emerald-500/60 border rounded-xl pl-10 pr-20 py-2 text-xs sm:text-sm focus:outline-none transition-all cursor-text shadow-sm"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-slate-100 border-slate-300 dark:text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700 border rounded-md">
                Ctrl K
              </kbd>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar shrink-0">
          {/* Mind Map / Knowledge Graph Button */}
          <button
            onClick={openGraphModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all bg-white border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800 shrink-0 shadow-sm cursor-pointer"
          >
            <Network className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Mind Map</span>
          </button>

          {/* Share Brain Button */}
          <button
            onClick={openShareModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all bg-white border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800 shrink-0 shadow-sm cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-zinc-400" />
            <span>Share</span>
          </button>

          {/* Ask AI Button */}
          <button
            onClick={openAskAi}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 dark:bg-zinc-900/90 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-zinc-800 shrink-0 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ask AI</span>
          </button>

          {/* Add Content Button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-slate-900/20 dark:shadow-emerald-600/20 transition-all shrink-0 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Add Content</span>
          </button>
        </div>
      </div>
    </header>
  );
};
