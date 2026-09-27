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
  const [pdfViewerEngine, setPdfViewerEngine] = useState<'native' | 'gview' | 'pdfjs'>('native');
  const { showToast } = useToast();

  if (!isOpen || !content) return null;

  const getPdfViewerUrl = (url: string) => {
    if (!url) return '';
    if (pdfViewerEngine === 'gview') {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }
    if (pdfViewerEngine === 'pdfjs') {
      return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const getIcon = () => {
    switch (content.type) {
      case 'twitter': return <TwitterIcon className="w-5 h-5 text-sky-400" />;
      case 'youtube': return <YoutubeIcon className="w-5 h-5 text-rose-400" />;
      case 'document': return <FileText className="w-5 h-5 text-amber-400" />;
      case 'link': return <Link2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
      default: return <FileText className="w-5 h-5 text-slate-700 dark:text-emerald-400" />;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="relative w-full max-w-3xl sm:max-w-4xl bg-white border-slate-200 text-slate-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 border rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b bg-white border-slate-200 dark:border-zinc-800 dark:bg-zinc-950 sticky top-0 z-10 shrink-0">
          <div className="flex items-start gap-3 overflow-hidden pr-2">
            <div className="p-2.5 rounded-xl bg-slate-100 border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 border shrink-0 mt-0.5">
              {getIcon()}
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-0.5">
                {getTypeLabel()}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug break-words">
                {content.title || 'Untitled Card'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors shrink-0 ml-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col gap-4 text-slate-800 dark:text-zinc-200 min-w-0">
          
          {/* YouTube Video Player */}
          {content.type === 'youtube' && youtubeEmbed && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 border-slate-200 dark:bg-black dark:border-zinc-800 border shadow-xl">
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
            <div className="p-4 rounded-xl bg-slate-50 border-slate-200 dark:bg-black/80 dark:border-zinc-800 border text-xs min-w-0">
              <div className="flex items-center gap-2 text-sky-500 mb-2 font-semibold">
                <TwitterIcon className="w-4 h-4" />
                <span>Original Tweet Reference</span>
              </div>
              <p className="text-slate-800 dark:text-zinc-200 text-sm leading-relaxed italic font-mono mb-3 break-words">
                "{content.text || content.title}"
              </p>
              <a
                href={content.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 text-xs font-semibold transition-colors"
              >
                <span>Open Original Tweet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* PDF & Document Cloudinary Viewer */}
          {content.link && (content.link.toLowerCase().includes('.pdf') || (content.type === 'document' && content.link.includes('cloudinary'))) && (
            <div className="flex flex-col gap-3 p-3 sm:p-4 rounded-xl bg-slate-50 border-slate-200 dark:bg-black dark:border-zinc-800 border w-full min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-amber-500 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-500" /> PDF Document Preview
                </span>
                
                {/* Engine Selector & Fullscreen Action */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center p-0.5 rounded-lg bg-white border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 border text-[11px]">
                    <button
                      onClick={() => setPdfViewerEngine('native')}
                      className={`px-2 py-1 rounded-md font-medium transition-all ${
                        pdfViewerEngine === 'native' ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      Direct PDF
                    </button>
                    <button
                      onClick={() => setPdfViewerEngine('pdfjs')}
                      className={`px-2 py-1 rounded-md font-medium transition-all ${
                        pdfViewerEngine === 'pdfjs' ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      PDF.js Viewer
                    </button>
                    <button
                      onClick={() => setPdfViewerEngine('gview')}
                      className={`px-2 py-1 rounded-md font-medium transition-all ${
                        pdfViewerEngine === 'gview' ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      Google View
                    </button>
                  </div>

                  <a
                    href={content.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shrink-0"
                  >
                    <span>Open Fullscreen</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* PDF Display Frame */}
              <div className="relative w-full h-[380px] sm:h-[480px] rounded-lg overflow-hidden border-slate-200 bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 border">
                <iframe
                  key={pdfViewerEngine}
                  src={getPdfViewerUrl(content.link)}
                  title={content.title}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen"
                />
              </div>
            </div>
          )}

          {/* Full Notes & Text Description */}
          {content.text && content.type !== 'twitter' && (
            <div className="p-4 rounded-xl bg-slate-50 border-slate-200 dark:bg-black/60 dark:border-zinc-800/80 border min-w-0 overflow-hidden">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                Notes & Content Summary
              </h4>
              <p className="text-sm text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap break-words">
                {content.text}
              </p>
            </div>
          )}

          {/* Link Preview Info */}
          {content.link && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border-slate-200 dark:bg-black dark:border-zinc-800 border text-xs">
              <div className="flex items-center gap-2 overflow-hidden pr-2">
                <Link2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="text-slate-600 dark:text-zinc-400 truncate font-mono text-[11px]">{content.link}</span>
              </div>
              <a
                href={content.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shrink-0"
              >
                <span>Visit URL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
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
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 border hover:opacity-80 transition-colors cursor-pointer"
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
        <div className="p-4 border-t bg-white border-slate-200 dark:border-zinc-800 dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Added on {formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            {!isReadOnly && onDelete && (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Overlay */}
        {showConfirmDelete && (
          <div className="absolute inset-0 z-20 bg-white/95 border-slate-200 dark:bg-black/95 dark:border-zinc-800 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-fade-in border">
            <Trash2 className="w-10 h-10 text-rose-500 mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">Delete this card permanently?</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6 max-w-xs">
              This card will be removed from your Second Brain and AI search embeddings.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
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
