import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Brain, Globe, Loader2, Inbox, ArrowLeft } from 'lucide-react';
import { Card } from '../components/Card';
import type { ContentItem } from '../types';
import { api } from '../services/api';

export const SharedBrain: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const [username, setUsername] = useState<string>('');
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hash) return;
    const fetchSharedData = async () => {
      setLoading(true);
      try {
        const res = await api.getSharedBrain(hash);
        if (res.contents) {
          setUsername(res.username);
          setContents(res.contents);
        } else {
          setError(res.error || 'Shared brain not found');
        }
      } catch (err: any) {
        setError(err.message || 'Share link is invalid or disabled');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedData();
  }, [hash]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Public Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                SecondBrain Public Share
              </h1>
              <p className="text-xs text-purple-400 flex items-center gap-1 font-medium">
                <Globe className="w-3 h-3" />
                <span>Shared by @{username || 'user'}</span>
              </p>
            </div>
          </div>

          <Link
            to="/signin"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <span>Create Your Own SecondBrain</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-sm font-medium">Loading shared brain collection...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <Inbox className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              This link may have expired or been set to private by its owner.
            </p>
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Homepage</span>
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-6 pb-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  @{username}'s Saved Cards ({contents.length})
                </h2>
                <p className="text-xs text-slate-400 mt-1">Browse notes, videos, tweets, and links</p>
              </div>
            </div>

            {contents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contents.map((content) => (
                  <Card key={content._id} content={content} isReadOnly={true} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400">
                <p className="text-sm">No cards available in this shared brain.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        Powered by SecondBrain AI Knowledge Base
      </footer>
    </div>
  );
};
