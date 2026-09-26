import React from 'react';
import { Search, Plus, Share2, Sparkles, X, Network } from 'lucide-react';

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
    <header className="flex flex-col gap-4 pb-5 mb-6 border-b border-slate-800/80 w-full min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex flex-wrap items-center gap-2">
            <span>{getCategoryTitle()}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/80">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Organize, search, and chat with your digital knowledge</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
        {/* Search Bar / Command Palette Trigger */}
        <div 
          onClick={openCommandPalette}
          className="relative flex-1 min-w-0 cursor-pointer"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, links, tags... (Press Ctrl + K)"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-20 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-text"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                }}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-all hover:border-slate-600 shrink-0"
          >
            <Network className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
            <span>Mind Map</span>
          </button>

          {/* Share Brain Button */}
          <button
            onClick={openShareModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-all hover:border-slate-600 shrink-0"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span>Share</span>
          </button>

          {/* Ask AI Button */}
          <button
            onClick={openAskAi}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 text-xs sm:text-sm font-medium transition-all hover:border-purple-400/60 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
            <span>Ask AI</span>
          </button>

          {/* Add Content Button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-600/20 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Add Content</span>
          </button>
        </div>
      </div>
    </header>
  );
};
