import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Plus, Star, Share2, Tag, FileText, ArrowRight, X } from 'lucide-react';
import type { ContentItem } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  cards: ContentItem[];
  tags: string[];
  onSelectCard: (card: ContentItem) => void;
  onSelectTag: (tag: string) => void;
  onOpenAddModal: () => void;
  onOpenAskAi: () => void;
  onOpenShareModal: () => void;
  onFilterFavorites: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  cards,
  tags,
  onSelectCard,
  onSelectTag,
  onOpenAddModal,
  onOpenAskAi,
  onOpenShareModal,
  onFilterFavorites,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter actions, cards, tags based on query
  const q = query.toLowerCase().trim();

  const actions = [
    {
      id: 'ask-ai',
      label: 'Ask AI Assistant',
      description: 'Query your Second Brain knowledge with AI',
      icon: Sparkles,
      color: 'text-emerald-400 bg-slate-200 dark:bg-zinc-800',
      action: () => { onOpenAskAi(); onClose(); },
    },
    {
      id: 'add-card',
      label: 'Add Knowledge Card',
      description: 'Save new link, YouTube video, tweet, or note',
      icon: Plus,
      color: 'text-sky-400 bg-slate-200 dark:bg-zinc-800',
      action: () => { onOpenAddModal(); onClose(); },
    },
    {
      id: 'filter-favorites',
      label: 'View Starred Favorites',
      description: 'Show pinned & favorite cards',
      icon: Star,
      color: 'text-amber-400 bg-slate-200 dark:bg-zinc-800',
      action: () => { onFilterFavorites(); onClose(); },
    },
    {
      id: 'share-brain',
      label: 'Share Second Brain',
      description: 'Generate public access link for your brain',
      icon: Share2,
      color: 'text-emerald-400 bg-slate-200 dark:bg-zinc-800',
      action: () => { onOpenShareModal(); onClose(); },
    },
  ].filter(a => a.label.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));

  const matchingCards = cards.filter(c => 
    c.title?.toLowerCase().includes(q) || 
    c.text?.toLowerCase().includes(q) ||
    c.tags?.some(t => t.toLowerCase().includes(q))
  ).slice(0, 5);

  const matchingTags = tags.filter(t => t.toLowerCase().includes(q)).slice(0, 6);

  const totalItems = actions.length + matchingCards.length + matchingTags.length;

  const handleKeyDownNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % (totalItems || 1));
    } else if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeSelectedItem();
    }
  };

  const executeSelectedItem = () => {
    let current = 0;

    // Check actions
    if (selectedIndex < actions.length) {
      actions[selectedIndex].action();
      return;
    }
    current += actions.length;

    // Check matching cards
    if (selectedIndex < current + matchingCards.length) {
      const card = matchingCards[selectedIndex - current];
      onSelectCard(card);
      onClose();
      return;
    }
    current += matchingCards.length;

    // Check matching tags
    if (selectedIndex < current + matchingTags.length) {
      const tag = matchingTags[selectedIndex - current];
      onSelectTag(tag);
      onClose();
      return;
    }
  };

  let itemCounter = 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white border-slate-200 text-slate-900 dark:bg-zinc-950 dark:border-zinc-800 border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownNav}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-black">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search cards, or find tags (Ctrl + K)..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 dark:text-zinc-100 dark:placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-slate-200 border-slate-300 dark:text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700 border rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto p-2 space-y-4 max-h-[60vh] custom-scrollbar">
          {totalItems === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-zinc-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No commands or cards matching &quot;{query}&quot;</p>
            </div>
          ) : (
            <>
              {/* Quick Actions */}
              {actions.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Quick Actions
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {actions.map((act) => {
                      const isSelected = itemCounter === selectedIndex;
                      const currentIndex = itemCounter++;
                      const Icon = act.icon;
                      return (
                        <div
                          key={act.id}
                          onClick={() => act.action()}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-white border'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${act.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold">{act.label}</div>
                              <div className="text-[11px] text-slate-500 dark:text-zinc-400">{act.description}</div>
                            </div>
                          </div>
                          <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-emerald-400' : 'text-slate-400 dark:text-zinc-600'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matching Cards */}
              {matchingCards.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Knowledge Cards ({matchingCards.length})
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {matchingCards.map((card) => {
                      const isSelected = itemCounter === selectedIndex;
                      const currentIndex = itemCounter++;
                      return (
                        <div
                          key={card._id}
                          onClick={() => {
                            onSelectCard(card);
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-white border'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 rounded-lg bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-semibold truncate">{card.title || 'Untitled'}</div>
                              <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{card.text || card.link || 'No snippet'}</div>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400 uppercase font-mono shrink-0 ml-2">
                            {card.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matching Tags */}
              {matchingTags.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Tags ({matchingTags.length})
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5 p-2">
                    {matchingTags.map((tag) => {
                      const isSelected = itemCounter === selectedIndex;
                      const currentIndex = itemCounter++;
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            onSelectTag(tag);
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-md'
                              : 'bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300 hover:opacity-80'
                          }`}
                        >
                          <Tag className="w-3 h-3 text-emerald-400" />
                          <span>#{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-black text-[11px] text-slate-500 dark:text-zinc-500">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 font-mono text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 font-mono text-[10px]">↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 font-mono text-[10px]">↵</kbd> Select</span>
          </div>
          <div>Second Brain Command Center</div>
        </div>
      </div>
    </div>
  );
};
