import React, { useState } from 'react';
import { 
  FileText, 
  Link2, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Tag as TagIcon,
  Calendar,
  Star
} from 'lucide-react';
import { YoutubeIcon, TwitterIcon } from './Icons';
import type { ContentItem } from '../types';
import { useToast } from './Toast';

interface CardProps {
  content: ContentItem;
  onDelete?: (id: string) => void;
  onTagClick?: (tag: string) => void;
  onCardClick?: (content: ContentItem) => void;
  onToggleFavorite?: (id: string) => void;
  isReadOnly?: boolean;
}

export const Card: React.FC<CardProps> = ({
  content,
  onDelete,
  onTagClick,
  onCardClick,
  onToggleFavorite,
  isReadOnly = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { showToast } = useToast();

  const getIcon = () => {
    switch (content.type) {
      case 'twitter': return <TwitterIcon className="w-4 h-4 text-sky-400" />;
      case 'youtube': return <YoutubeIcon className="w-4 h-4 text-rose-400" />;
      case 'document': return <FileText className="w-4 h-4 text-amber-400" />;
      case 'link': return <Link2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
      default: return <FileText className="w-4 h-4 text-slate-600 dark:text-emerald-400" />;
    }
  };

  const getYoutubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match && match[1] ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetUrl = content.link || window.location.href;
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(content.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const youtubeEmbed = content.link ? getYoutubeEmbedUrl(content.link) : null;

  const handleCardTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCardClick) onCardClick(content);
  };

  return (
    <div 
      onClick={() => onCardClick && onCardClick(content)}
      className={`group relative bg-white border-slate-200 text-slate-900 dark:bg-zinc-900/95 dark:border-zinc-800 dark:text-zinc-100 border ${
        content.isFavorite ? 'border-amber-500/50 shadow-amber-500/10' : ''
      } rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-slate-300 hover:shadow-md dark:hover:border-emerald-500/50 dark:hover:shadow-xl dark:hover:shadow-emerald-950/20 cursor-pointer`}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div 
            onClick={handleCardTitleClick}
            className="flex items-center gap-2.5 overflow-hidden flex-1 cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 dark:bg-zinc-800 dark:border-zinc-700 shrink-0 group-hover:scale-105 transition-transform">
              {getIcon()}
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-base line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors" title={content.title}>
              {content.title || 'Untitled Content'}
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {!isReadOnly && onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(content._id);
                }}
                title={content.isFavorite ? 'Unpin favorite' : 'Pin to favorites'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:text-zinc-400 dark:hover:text-amber-400 dark:hover:bg-amber-500/10 transition-colors"
              >
                <Star className={`w-4 h-4 ${content.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
              </button>
            )}
            {content.link && (
              <a
                href={content.link}
                target="_blank"
                rel="noopener noreferrer"
                title="Open original link"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={handleCopyLink}
              title="Copy link"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            {!isReadOnly && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmDelete(true);
                }}
                title="Delete content"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body Preview */}
        {content.text && (
          <div className="mb-4">
            <p className={`text-slate-600 dark:text-zinc-300 text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
              {content.text}
            </p>
            {content.text.length > 180 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline mt-1 transition-colors"
              >
                {isExpanded ? 'Show less' : 'Read more...'}
              </button>
            )}
          </div>
        )}

        {/* Media Embeds */}
        {content.type === 'youtube' && youtubeEmbed && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 border-slate-200 dark:bg-black dark:border-zinc-800 my-3 border shadow-inner">
            <iframe
              src={youtubeEmbed}
              title={content.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        )}

        {content.type === 'twitter' && content.link && (
          <div className="my-3 p-3.5 rounded-xl bg-slate-50 border-slate-200 dark:bg-black/60 dark:border-zinc-800 border text-xs">
            <div className="flex items-center gap-2 text-sky-500 mb-2 font-medium">
              <TwitterIcon className="w-3.5 h-3.5" />
              <span>Twitter / X Tweet</span>
            </div>
            <p className="text-slate-700 dark:text-zinc-300 line-clamp-2 italic font-mono text-[13px]">
              "{content.text || content.title}"
            </p>
            <a
              href={content.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sky-500 hover:underline mt-2 font-medium"
            >
              View original tweet <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Card Footer: Tags & Date */}
      <div className="pt-3 border-t border-slate-200 dark:border-zinc-800/80 mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {content.tags && content.tags.length > 0 ? (
            content.tags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => onTagClick && onTagClick(tag)}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 border hover:opacity-80 transition-colors"
              >
                <TagIcon className="w-2.5 h-2.5" />
                <span>#{tag}</span>
              </button>
            ))
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 italic">No tags</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-zinc-500">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Delete Confirmation Overlay */}
      {showConfirmDelete && (
        <div className="absolute inset-0 z-20 bg-white/95 border-slate-200 text-slate-900 dark:bg-black/95 dark:border-zinc-800 dark:text-white backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center text-center animate-fade-in border">
          <Trash2 className="w-8 h-8 text-rose-500 mb-2 animate-bounce" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Delete this card?</h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4 px-2">This action will remove it from your Second Brain & AI search.</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowConfirmDelete(false);
                if (onDelete) onDelete(content._id);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md shadow-rose-600/30"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
