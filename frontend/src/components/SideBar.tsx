import React from 'react';
import { 
  LayoutGrid, 
  FileText, 
  Link2, 
  Brain, 
  LogOut, 
  User as UserIcon,
  Sparkles,
  Tag
} from 'lucide-react';
import { YoutubeIcon, TwitterIcon } from './Icons';
import type { ContentType } from '../types';
import { useAuth } from '../context/AuthContext';

interface SideBarProps {
  activeType: ContentType;
  setActiveType: (type: ContentType) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  tagsList: string[];
  openAskAi: () => void;
  counts: Record<string, number>;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SideBar: React.FC<SideBarProps> = ({
  activeType,
  setActiveType,
  selectedTag,
  setSelectedTag,
  tagsList,
  openAskAi,
  counts,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'all' as ContentType, label: 'All Content', icon: LayoutGrid, count: counts.all || 0 },
    { id: 'twitter' as ContentType, label: 'Twitter / X', icon: TwitterIcon, count: counts.twitter || 0 },
    { id: 'youtube' as ContentType, label: 'YouTube Videos', icon: YoutubeIcon, count: counts.youtube || 0 },
    { id: 'document' as ContentType, label: 'Documents & Notes', icon: FileText, count: counts.document || 0 },
    { id: 'link' as ContentType, label: 'Saved Links', icon: Link2, count: counts.link || 0 },
  ];

  const handleSelectCategory = (id: ContentType) => {
    setActiveType(id);
    setSelectedTag(null);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectTag = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4 select-none">
      <div className="flex flex-col gap-5 overflow-y-auto custom-scrollbar pr-1">
        {/* Logo */}
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-emerald-400 border flex items-center justify-center shadow-lg shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                SecondBrain
              </h1>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">AI Knowledge Base</p>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="w-5 h-5 rotate-180" />
            </button>
          )}
        </div>

        {/* AI Assistant Banner */}
        <button
          onClick={() => {
            openAskAi();
            if (onCloseMobile) onCloseMobile();
          }}
          className="group relative w-full overflow-hidden rounded-xl bg-emerald-50 border-emerald-200 dark:bg-zinc-900/90 dark:border-zinc-800 dark:hover:border-emerald-500/50 p-3 border text-left transition-all duration-300 shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-200 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block">Ask AI Assistant</span>
                <span className="text-[10px] text-slate-600 dark:text-zinc-400">Query your saved knowledge</span>
              </div>
            </div>
          </div>
        </button>

        {/* Navigation Categories */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 px-3 uppercase tracking-wider mb-1">
            Categories
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeType === item.id && selectedTag === null;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectCategory(item.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-800 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30 shadow-sm'
                    : 'text-slate-600 border-transparent hover:bg-slate-100 dark:text-zinc-400 dark:border-transparent dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'}`} />
                  <span>{item.label}</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-slate-800 text-white dark:bg-emerald-500/30 dark:text-emerald-200' 
                    : 'bg-slate-200 text-slate-600 dark:bg-zinc-800/80 dark:text-zinc-400'
                }`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tag Filters */}
        {tagsList.length > 0 && (
          <div className="flex flex-col gap-1 pt-2 border-t border-slate-200 dark:border-zinc-800/80">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 px-3 uppercase tracking-wider mb-1">
              Tags
            </span>
            <div className="flex flex-wrap gap-1.5 px-1 max-h-36 overflow-y-auto custom-scrollbar">
              {tagsList.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => handleSelectTag(tag)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-800 dark:bg-emerald-600 dark:text-white dark:border-emerald-500 font-medium shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                    <span>#{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User Footer */}
      <div className="pt-4 mt-auto border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 px-1 overflow-hidden min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-emerald-400 border flex items-center justify-center font-bold shrink-0 text-xs">
            {user?.username ? user.username.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-zinc-200 truncate">{user?.username || 'User'}</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 truncate">{user?.email || 'authenticated'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors shrink-0 ml-1 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-slate-200 dark:bg-zinc-950 dark:border-zinc-800/80 border-r h-screen sticky top-0 flex-col shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Panel */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
          />
          <aside className="relative w-72 max-w-[85vw] bg-white border-slate-200 dark:bg-zinc-950 dark:border-zinc-800 border-r h-full flex flex-col shadow-2xl z-10 animate-slide-right">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
