import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Link2, 
  ExternalLink, 
  Copy, 
  Check, 
  Trash2, 
  Tag as TagIcon, 
  Calendar
} from 'lucide-react';
import { YoutubeIcon, TwitterIcon } from './Icons';
import type { ContentItem } from '../types';
import { useToast } from './Toast';

interface CardDetailModalProps {
  content: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onTagClick?: (tag: string) => void;
  isReadOnly?: boolean;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  content,
  isOpen,
  onClose,
  onDelete,
  onTagClick,
  isReadOnly = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { showToast } = useToast();

  if (!isOpen || !content) return null;

  const getIcon = () => {
    switch (content.type) {
      case 'twitter': return <TwitterIcon className="w-5 h-5 text-sky-400" />;
      case 'youtube': return <YoutubeIcon className="w-5 h-5 text-rose-400" />;
      case 'document': return <FileText className="w-5 h-5 text-amber-400" />;
      case 'link': return <Link2 className="w-5 h-5 text-emerald-400" />;
      default: return <FileText className="w-5 h-5 text-purple-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (content.type) {
      case 'twitter': return 'Twitter / X Tweet';
      case 'youtube': return 'YouTube Video';
      case 'document': return 'Document & Note';
      case 'link': return 'Web Link';
      default: return 'Knowledge Card';
    }
  };

  const getYoutubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match && match[1] ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1` : null;
  };

  const handleCopyLink = () => {
    const targetUrl = content.link || window.location.href;
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(content.createdAt || Date.now()).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const youtubeEmbed = content.link ? getYoutubeEmbedUrl(content.link) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10 shrink-0">
          <div className="flex items-start gap-3 overflow-hidden pr-2">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 shrink-0 mt-0.5">
              {getIcon()}
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block mb-0.5">
                {getTypeLabel()}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                {content.title || 'Untitled Card'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4 text-slate-200">
          
          {/* YouTube Video Player */}
          {content.type === 'youtube' && youtubeEmbed && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl">
              <iframe
                src={youtubeEmbed}
                title={content.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Twitter Embed Container */}
          {content.type === 'twitter' && content.link && (
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-sky-400 mb-2 font-semibold">
                <TwitterIcon className="w-4 h-4" />
                <span>Original Tweet Reference</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed italic font-mono mb-3">
                "{content.text || content.title}"
              </p>
              <a
                href={content.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-xs font-semibold transition-colors"
              >
                <span>Open Original Tweet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Full Notes & Text Description */}
          {content.text && content.type !== 'twitter' && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                Notes & Content Summary
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {content.text}
              </p>
            </div>
          )}

          {/* Link Preview Info */}
          {content.link && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 overflow-hidden pr-2">
                <Link2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-slate-400 truncate font-mono text-[11px]">{content.link}</span>
              </div>
              <a
                href={content.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shrink-0"
              >
                <span>Visit URL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Associated Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (onTagClick) onTagClick(tag);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition-colors"
                  >
                    <TagIcon className="w-3 h-3" />
                    <span>#{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Added on {formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            {!isReadOnly && onDelete && (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Overlay */}
        {showConfirmDelete && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-fade-in">
            <Trash2 className="w-10 h-10 text-rose-500 mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-white mb-1">Delete this card permanently?</h4>
            <p className="text-xs text-slate-400 mb-6 max-w-xs">
              This card will be removed from your Second Brain and AI search embeddings.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  if (onDelete) onDelete(content._id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
