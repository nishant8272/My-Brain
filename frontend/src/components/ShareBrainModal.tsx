import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, Check, ExternalLink, Globe, Lock, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './Toast';

interface ShareBrainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareBrainModal: React.FC<ShareBrainModalProps> = ({ isOpen, onClose }) => {
  const [isPublic, setIsPublic] = useState(false);
  const [shareHash, setShareHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Check existing share status
      const checkStatus = async () => {
        setLoading(true);
        try {
          const res = await api.toggleShare(true);
          if (res.hash) {
            setIsPublic(true);
            setShareHash(res.hash);
          }
        } catch (err) {
          setIsPublic(false);
        } finally {
          setLoading(false);
        }
      };
      checkStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fullShareUrl = shareHash ? `${window.location.origin}/share/${shareHash}` : '';

  const handleToggle = async () => {
    setLoading(true);
    try {
      const nextState = !isPublic;
      const res = await api.toggleShare(nextState);
      if (nextState && res.hash) {
        setIsPublic(true);
        setShareHash(res.hash);
        showToast('Share link enabled!', 'success');
      } else {
        setIsPublic(false);
        setShareHash(null);
        showToast('Share link disabled!', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update share settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!fullShareUrl) return;
    navigator.clipboard.writeText(fullShareUrl);
    setCopied(true);
    showToast('Share link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white border-slate-200 text-slate-900 dark:bg-zinc-950 dark:border-zinc-800 border rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-emerald-400 border">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Share Your Brain</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Allow others to view your public collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Toggle Switch */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border-slate-200 dark:bg-black dark:border-zinc-800 border">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-400 dark:text-zinc-500 shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                    {isPublic ? 'Public Share Enabled' : 'Brain is Private'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {isPublic ? 'Anyone with the link can view your cards' : 'Only you can see your content'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? 'bg-slate-900 dark:bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Share URL display */}
            {isPublic && fullShareUrl && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Public Share Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={fullShareUrl}
                    className="flex-1 bg-slate-50 border-slate-200 text-slate-900 dark:bg-black dark:border-zinc-800 dark:text-zinc-200 border rounded-xl px-3.5 py-2.5 text-xs font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <a
                  href={fullShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1 font-medium"
                >
                  <span>Preview shared brain page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
