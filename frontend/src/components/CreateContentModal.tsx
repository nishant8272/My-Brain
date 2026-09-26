import React, { useState } from 'react';
import { X, FileText, Link2, Plus, Sparkles, Loader2 } from 'lucide-react';
import { YoutubeIcon, TwitterIcon } from './Icons';
import type { ContentType } from '../types';
import { api } from '../services/api';
import { useToast } from './Toast';

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateContentModal: React.FC<CreateContentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [type, setType] = useState<ContentType>('document');
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [text, setText] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDownTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !link.trim() && !text.trim()) {
      showToast('Please provide a title, link, or notes content', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.addContent({
        title: title.trim(),
        link: link.trim(),
        text: text.trim(),
        tags,
        type,
      });

      showToast('Content added & indexed into Second Brain!', 'success');
      setTitle('');
      setLink('');
      setText('');
      setTags([]);
      setType('document');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to add content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { id: 'youtube' as ContentType, label: 'YouTube', icon: YoutubeIcon, color: 'text-rose-400' },
    { id: 'twitter' as ContentType, label: 'Twitter / X', icon: TwitterIcon, color: 'text-sky-400' },
    { id: 'document' as ContentType, label: 'Document', icon: FileText, color: 'text-amber-400' },
    { id: 'link' as ContentType, label: 'Web Link', icon: Link2, color: 'text-emerald-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add Knowledge Card</h2>
              <p className="text-xs text-slate-400">Content will be indexed for AI search & chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Content Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {typeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = type === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setType(opt.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-md shadow-purple-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${opt.color}`} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. React 19 Tutorial or My Project Ideas"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          {/* Link URL */}
          {(type === 'youtube' || type === 'twitter' || type === 'link') && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                URL / Link
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={
                  type === 'youtube'
                    ? 'https://youtube.com/watch?v=...'
                    : type === 'twitter'
                    ? 'https://x.com/username/status/...'
                    : 'https://example.com'
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          )}

          {/* Text / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Description / Notes Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Write your notes, key takeaways, or summary here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Tags
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                placeholder="Type tag and press Enter..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
              >
                Add Tag
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Indexing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Content</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
