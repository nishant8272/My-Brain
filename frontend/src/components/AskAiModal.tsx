import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  BookOpen, 
  Loader2, 
  ArrowRight, 
  Trash2,
  ExternalLink,
  Tag as TagIcon,
  MessageSquareText,
  Plus,
  History,
  MessageSquare
} from 'lucide-react';
import { YoutubeIcon, TwitterIcon } from './Icons';
import { api } from '../services/api';
import type { ChatMessage, ContentItem, ChatSessionItem } from '../types';
import { useToast } from './Toast';

interface AskAiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskAiModal: React.FC<AskAiModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSessionTitle, setActiveSessionTitle] = useState<string>('AI Assistant Session');
  const [showSessionsDrawer, setShowSessionsDrawer] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async (targetSessionId?: string) => {
    setInitialLoading(true);
    try {
      const res = await api.getChat(targetSessionId);
      if (res.messages) {
        setMessages(res.messages);
      }
      if (res.sessionId) {
        setActiveSessionId(res.sessionId);
      }
      if (res.sessionTitle) {
        setActiveSessionTitle(res.sessionTitle);
      }
      if (res.sessions) {
        setSessions(res.sessions);
      }
    } catch (err) {
      console.warn('Could not load chat history:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  if (!isOpen) return null;

  const samplePrompts = [
    'What YouTube videos have I saved about programming?',
    'Summarize all notes in my Second Brain',
    'What information do I have on React or Web Development?',
  ];

  const handleAsk = async (textToAsk?: string) => {
    const q = textToAsk || query;
    if (!q.trim() || loading) return;

    const userText = q.trim();
    setQuery('');

    // Optimistically append user message to local state
    const userMsg: ChatMessage = { sender: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.askAi(userText, activeSessionId || undefined);
      if (res.sessionId) {
        setActiveSessionId(res.sessionId);
      }
      if (res.sessionTitle) {
        setActiveSessionTitle(res.sessionTitle);
      }
      if (res.messages) {
        setMessages(res.messages);
      } else {
        const aiMsg: ChatMessage = {
          sender: 'ai',
          text: res.answer,
          sources: res.sources,
          relevantCards: res.relevantCards,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
      // Refresh sessions list
      const sessRes = await api.getChatSessions();
      if (sessRes.sessions) setSessions(sessRes.sessions);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate AI response', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = async () => {
    try {
      const res = await api.createChatSession('New Conversation');
      if (res.session) {
        setActiveSessionId(res.session._id);
        setActiveSessionTitle(res.session.title);
        setMessages([]);
        setSessions((prev) => [res.session, ...prev]);
        setShowSessionsDrawer(false);
        showToast('Started a new chat session!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create chat session', 'error');
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    loadHistory(sessionId);
    setShowSessionsDrawer(false);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await api.deleteChatSession(sessionId);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      showToast('Chat session deleted!', 'info');

      if (activeSessionId === sessionId) {
        const remaining = sessions.filter((s) => s._id !== sessionId);
        if (remaining.length > 0) {
          handleSelectSession(remaining[0]._id);
        } else {
          handleNewSession();
        }
      }
    } catch (err: any) {
      showToast('Failed to delete chat session', 'error');
    }
  };

  const handleClearChat = async () => {
    try {
      await api.clearChat(activeSessionId || undefined);
      setMessages([]);
      showToast('Chat history cleared!', 'info');
    } catch (err: any) {
      showToast('Failed to clear chat history', 'error');
    }
  };

  const renderRecommendedCard = (card: ContentItem) => {
    const getYoutubeEmbedUrl = (url: string): string | null => {
      if (!url) return null;
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
      return match && match[1] ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
    };

    const ytEmbed = card.type === 'youtube' && card.link ? getYoutubeEmbedUrl(card.link) : null;

    return (
      <div
        key={card._id}
        className="w-60 sm:w-80 shrink-0 bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between text-xs transition-all hover:border-purple-500/50 shadow-md"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-purple-300 truncate">
              {card.type === 'youtube' && <YoutubeIcon className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
              {card.type === 'twitter' && <TwitterIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
              <span className="truncate">{card.title || 'Saved Card'}</span>
            </div>
            {card.link && (
              <a
                href={card.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white p-1"
                title="Open link"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {card.text && (
            <p className="text-slate-300 line-clamp-2 leading-relaxed mb-2 font-mono text-[11px]">
              "{card.text}"
            </p>
          )}

          {ytEmbed && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-950 my-1 border border-slate-800">
              <iframe
                src={ytEmbed}
                title={card.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-800/60">
            {card.tags.slice(0, 3).map((t, idx) => (
              <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-medium">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
      />

      {/* Slide-out Side Panel Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-50 h-full w-full sm:w-[540px] md:w-[620px] lg:w-[680px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 transform translate-x-0 animate-slide-left overflow-hidden">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden pr-2">
            <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 shadow-sm shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-2">
                <span className="truncate">{activeSessionTitle || 'SecondBrain Assistant'}</span>
              </h2>
              <p className="text-[11px] text-purple-300/80">RAG AI search & recommendations</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* New Chat Button */}
            <button
              onClick={handleNewSession}
              title="Start New Chat Session"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            {/* Sessions History Drawer Toggle */}
            <button
              onClick={() => setShowSessionsDrawer(!showSessionsDrawer)}
              title="Previous Chat Sessions"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                showSessionsDrawer 
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <History className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Sessions ({sessions.length})</span>
            </button>

            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                title="Clear Chat Messages"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sessions Overlay Panel */}
        {showSessionsDrawer && (
          <div className="bg-slate-950 border-b border-slate-800 p-3 max-h-56 overflow-y-auto custom-scrollbar animate-fade-in z-20">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-3 h-3 text-purple-400" />
                Previous Chat Sessions ({sessions.length})
              </span>
              <button
                onClick={handleNewSession}
                className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Create New</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {sessions.map((sess) => {
                const isActive = activeSessionId === sess._id;
                return (
                  <div
                    key={sess._id}
                    onClick={() => handleSelectSession(sess._id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-purple-600/20 border-purple-500/50 text-purple-200 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden pr-2">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                      <span className="truncate">{sess.title || 'Untitled Session'}</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSession(e, sess._id)}
                      title="Delete this session"
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Drawer Body / Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar bg-slate-950/40 w-full max-w-full">
          {initialLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
              <p className="text-xs">Loading conversation history...</p>
            </div>
          ) : messages.length === 0 && !loading ? (
            /* Welcome / Initial State */
            <div className="flex flex-col items-center justify-center my-auto py-10 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-purple-400 shadow-inner mb-4">
                <MessageSquareText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                Hello, I'm your SecondBrain Assistant.
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
                I'm here to search your saved notes, tweets & YouTube videos to answer your questions accurately!
              </p>

              <div className="w-full flex flex-col gap-2 max-w-md">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-left px-1">
                  Try asking:
                </span>
                {samplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAsk(prompt)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 hover:bg-purple-950/20 text-xs text-slate-300 text-left transition-all group"
                  >
                    <span>{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages Thread */
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} gap-1.5 animate-fade-in w-full max-w-full`}
              >
                {msg.sender === 'user' ? (
                  /* User Message */
                  <div className="p-3.5 rounded-2xl rounded-br-xs bg-purple-600 text-white text-xs max-w-[80%] shadow-md leading-relaxed font-medium">
                    {msg.text}
                  </div>
                ) : (
                  /* AI Message with Full Markdown Rendering */
                  <div className="flex items-start gap-2.5 w-full min-w-0">
                    <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-xs p-4 text-slate-200 text-xs leading-relaxed shadow-sm overflow-hidden">
                      <div className="text-slate-200 font-sans leading-relaxed">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 underline hover:text-purple-300 font-medium break-all"
                              >
                                {children}
                              </a>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold text-white">{children}</strong>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside my-2 space-y-1 text-slate-200">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside my-2 space-y-1 text-slate-200">{children}</ol>
                            ),
                            li: ({ children }) => (
                              <li className="my-1 leading-relaxed">{children}</li>
                            ),
                            p: ({ children }) => (
                              <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>
                            ),
                            code: ({ children }) => (
                              <code className="bg-slate-950 border border-slate-800 text-purple-300 px-1.5 py-0.5 rounded font-mono text-[11px]">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>

                      {/* Relevant Cards Horizontal Carousel */}
                      {msg.relevantCards && msg.relevantCards.length > 0 && (
                        <div className="mt-4 pt-3.5 border-t border-slate-800/90 w-full min-w-0 max-w-full overflow-hidden">
                          <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <TagIcon className="w-3 h-3" />
                            Most Relevant Cards ({msg.relevantCards.length})
                          </span>
                          <div className="flex items-center gap-3 overflow-x-auto overflow-y-hidden pb-2.5 pt-1 px-0.5 custom-scrollbar w-full min-w-0 max-w-full">
                            {msg.relevantCards.map((card) => renderRecommendedCard(card))}
                          </div>
                        </div>
                      )}

                      {/* Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                            <BookOpen className="w-3 h-3 text-purple-400" />
                            Retrieved Sources ({msg.sources.length})
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {msg.sources.map((src, i) => (
                              <div
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                <span className="font-medium truncate max-w-[180px]">{src.title || 'Note'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-start gap-2.5 max-w-[85%] animate-fade-in">
              <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                <span>Searching SecondBrain & generating answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sticky Input Bar */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900 shrink-0 w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your SecondBrain..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-medium shadow-md shadow-purple-600/20 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
