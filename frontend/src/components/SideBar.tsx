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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                SecondBrain
              </h1>
              <p className="text-xs text-purple-400 font-medium">AI Knowledge Base</p>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 p-3 border border-purple-500/30 text-left transition-all duration-300 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/10"
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 group-hover:scale-110 transition-transform shrink-0">
                <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-semibold text-purple-100 block">Ask AI Assistant</span>
                <span className="text-[10px] text-purple-300/80">Query your saved knowledge</span>
              </div>
            </div>
          </div>
        </button>

        {/* Navigation Categories */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 px-3 uppercase tracking-wider mb-1">
            Categories
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeType === item.id && selectedTag === null;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectCategory(item.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-purple-500/30 text-purple-200' : 'bg-slate-800 text-slate-500'
                }`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tag Filters */}
        {tagsList.length > 0 && (
          <div className="flex flex-col gap-1 pt-2 border-t border-slate-800/60">
            <span className="text-[11px] font-semibold text-slate-500 px-3 uppercase tracking-wider mb-1">
              Tags
            </span>
            <div className="flex flex-wrap gap-1.5 px-1 max-h-36 overflow-y-auto custom-scrollbar">
              {tagsList.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => handleSelectTag(tag)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white font-medium shadow-md shadow-purple-600/30'
                        : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
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
      <div className="pt-4 mt-auto border-t border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 px-1 overflow-hidden min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-purple-400 font-bold shrink-0 text-xs">
            {user?.username ? user.username.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.username || 'User'}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email || 'authenticated'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 ml-1"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 flex-col shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Panel */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
          />
          <aside className="relative w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 h-full flex flex-col shadow-2xl z-10 animate-slide-right">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
