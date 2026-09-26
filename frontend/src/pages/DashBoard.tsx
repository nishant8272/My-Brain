import React, { useState, useEffect, useMemo } from 'react';
import { SideBar } from '../components/SideBar';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { CreateContentModal } from '../components/CreateContentModal';
import { AskAiModal } from '../components/AskAiModal';
import { ShareBrainModal } from '../components/ShareBrainModal';
import { useToast } from '../components/Toast';
import type { ContentItem, ContentType } from '../types';
import { api } from '../services/api';
import { Plus, Sparkles, Inbox, Filter, Tag } from 'lucide-react';

export const DashBoard: React.FC = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeType, setActiveType] = useState<ContentType>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { showToast } = useToast();

  const fetchContents = async () => {
    setLoading(true);
    try {
      const res = await api.getContent();
      if (res.contents) {
        setContents(res.contents);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load content', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteContent(id);
      setContents((prev) => prev.filter((item) => item._id !== id));
      showToast('Content deleted from your Second Brain', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete content', 'error');
    }
  };

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: contents.length,
      twitter: 0,
      youtube: 0,
      document: 0,
      link: 0,
    };
    contents.forEach((item) => {
      if (item.type && counts[item.type] !== undefined) {
        counts[item.type]++;
      }
    });
    return counts;
  }, [contents]);

  // Extract list of unique tags across all content
  const uniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    contents.forEach((item) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [contents]);

  // Filter content based on Category, Tag, and Search Query
  const filteredContents = useMemo(() => {
    return contents.filter((item) => {
      // 1. Type filter
      if (activeType !== 'all' && item.type !== activeType) {
        return false;
      }
      // 2. Tag filter
      if (selectedTag && (!item.tags || !item.tags.includes(selectedTag))) {
        return false;
      }
      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchText = item.text?.toLowerCase().includes(q);
        const matchTag = item.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchText && !matchTag) return false;
      }
      return true;
    });
  }, [contents, activeType, selectedTag, searchQuery]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <SideBar
        activeType={activeType}
        setActiveType={setActiveType}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        tagsList={uniqueTags}
        openAskAi={() => setIsAskAiOpen(true)}
        counts={categoryCounts}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full min-w-0">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          openAddModal={() => setIsAddModalOpen(true)}
          openShareModal={() => setIsShareModalOpen(true)}
          openAskAi={() => setIsAskAiOpen(true)}
          totalItems={filteredContents.length}
          activeType={activeType}
        />

        {/* Active Filters Bar */}
        {(selectedTag || searchQuery) && (
          <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Filter className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-slate-400 font-medium">Active Filters:</span>
            {selectedTag && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Tag className="w-3 h-3" />
                <span>#{selectedTag}</span>
                <button onClick={() => setSelectedTag(null)} className="hover:text-white font-bold ml-1">
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <span>"{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="hover:text-white font-bold ml-1">
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedTag(null);
                setSearchQuery('');
              }}
              className="text-slate-500 hover:text-slate-300 ml-auto font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-56 bg-slate-900/60 border border-slate-800/80 rounded-2xl animate-pulse p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-5 bg-slate-800 rounded-lg w-3/4" />
                  <div className="h-4 bg-slate-800/60 rounded-lg w-full" />
                  <div className="h-4 bg-slate-800/60 rounded-lg w-2/3" />
                </div>
                <div className="h-4 bg-slate-800/40 rounded-lg w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredContents.length > 0 ? (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content) => (
              <Card
                key={content._id}
                content={content}
                onDelete={handleDelete}
                onTagClick={(tag) => setSelectedTag(tag)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No content found</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              {searchQuery || selectedTag
                ? 'Try adjusting your search query or filters to find what you are looking for.'
                : 'Start building your Second Brain by adding YouTube videos, tweets, web links, or text notes.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Content Now</span>
              </button>
              <button
                onClick={() => setIsAskAiOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Ask AI Assistant</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Side Trigger Button */}
      {!isAskAiOpen && (
        <button
          onClick={() => setIsAskAiOpen(true)}
          className="fixed bottom-6 right-6 z-30 p-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/30 flex items-center gap-2 group transition-all hover:scale-105 animate-bounce-subtle"
          title="Open SecondBrain AI Assistant"
        >
          <Sparkles className="w-5 h-5 text-purple-200 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold pr-1 hidden sm:inline">Ask AI</span>
        </button>
      )}

      {/* Modals & Drawers */}
      <CreateContentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchContents}
      />
      <AskAiModal
        isOpen={isAskAiOpen}
        onClose={() => setIsAskAiOpen(false)}
      />
      <ShareBrainModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
