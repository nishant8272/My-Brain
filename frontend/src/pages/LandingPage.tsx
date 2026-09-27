import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Brain, 
  Search, 
  Bot, 
  Share2, 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  Zap, 
  Layers, 
  Database,
  Play,
  Menu,
  X
} from 'lucide-react';
import { YoutubeIcon, TwitterIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Interactive Demo State
  const [demoQuery, setDemoQuery] = useState('');
  const [demoSearchResult, setDemoSearchResult] = useState<string | null>(null);

  // FAQ Expand state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleDemoSearch = (queryText: string) => {
    setDemoQuery(queryText);
    if (queryText.toLowerCase().includes('react') || queryText.toLowerCase().includes('dev')) {
      setDemoSearchResult('Found 2 cards: "React Server Components Guide" & "Vite 7 Production Deployment"');
    } else if (queryText.toLowerCase().includes('dsa') || queryText.toLowerCase().includes('code')) {
      setDemoSearchResult('Found 1 YouTube Video: "The Best Way to Learn DSA Patterns in 2 Months"');
    } else {
      setDemoSearchResult('Found 3 relevant items: Notes, YouTube tutorials, and Twitter bookmarks.');
    }
  };

  const faqs = [
    {
      q: 'How does SecondBrain search my saved items?',
      a: 'SecondBrain converts your saved notes, YouTube videos, tweets, and web links into 768-dimensional vector embeddings using OpenRouter AI. When you search or ask a question, Pinecone vector search matches the semantic meaning of your query rather than just exact keywords.'
    },
    {
      q: 'Can I save YouTube videos and play them inside SecondBrain?',
      a: 'Yes! When you add a YouTube link, SecondBrain automatically extracts the video ID and renders an interactive embedded video player right inside your card view.'
    },
    {
      q: 'How does the RAG AI Assistant work?',
      a: 'Our built-in RAG (Retrieval-Augmented Generation) chatbot queries your Pinecone vector vault for relevant notes and uses OpenRouter LLMs to generate concise, factual answers with card recommendations.'
    },
    {
      q: 'Can I share my SecondBrain publicly?',
      a: 'Absolutely! With 1-click sharing, SecondBrain generates a unique public URL (e.g. /share/abc123xyz) so anyone can browse your curated public vault in read-only mode.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-black dark:text-zinc-100 font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* Background Ambient Glow Effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-slate-200/50 to-transparent dark:from-emerald-600/10 blur-3xl pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-slate-900 border-slate-800 text-emerald-400 dark:bg-zinc-800 dark:border-zinc-700 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Second<span className="text-emerald-500 dark:text-emerald-400">Brain</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600 dark:text-zinc-300">
            <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a>
            <a href="#demo" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Live Demo</a>
            <a href="#how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {token ? (
              <button
                onClick={() => navigate('/app')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-bold shadow-lg transition-all hover:scale-105"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:opacity-80 dark:text-zinc-300 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-bold shadow-lg transition-all hover:scale-105"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 border-slate-200 text-slate-700 dark:text-zinc-400 dark:hover:text-white dark:bg-zinc-900 border"
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileNavOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-4 flex flex-col gap-3 text-xs font-medium animate-fade-in">
            <a href="#features" onClick={() => setIsMobileNavOpen(false)} className="py-1.5 text-slate-700 dark:text-zinc-300">Features</a>
            <a href="#demo" onClick={() => setIsMobileNavOpen(false)} className="py-1.5 text-slate-700 dark:text-zinc-300">Live Demo</a>
            <a href="#how-it-works" onClick={() => setIsMobileNavOpen(false)} className="py-1.5 text-slate-700 dark:text-zinc-300">How It Works</a>
            <a href="#pricing" onClick={() => setIsMobileNavOpen(false)} className="py-1.5 text-slate-700 dark:text-zinc-300">Pricing</a>
            <a href="#faq" onClick={() => setIsMobileNavOpen(false)} className="py-1.5 text-slate-700 dark:text-zinc-300">FAQ</a>
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
              {token ? (
                <button
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    navigate('/app');
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-emerald-600 font-bold text-center"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <Link
                    to="/signin"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="w-full py-2 text-center bg-slate-100 text-slate-800 dark:text-zinc-300 dark:bg-zinc-900 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="w-full py-2.5 text-center text-white bg-zinc-900 dark:bg-emerald-600 rounded-xl font-bold"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 md:pt-28 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Tech Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-200 border-slate-300 text-slate-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-emerald-400 border text-xs font-medium mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
          <span>Powered by OpenRouter AI & Pinecone Vector Search</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] max-w-4xl mx-auto mb-6">
          Your AI-Powered <br />
          <span className="text-emerald-500 dark:text-emerald-400">
            Second Brain
          </span>{' '}
          Vault
        </h1>

        {/* Subtitle */}
        <p className="text-slate-600 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          Effortlessly store YouTube videos, tweets, web bookmarks, and markdown notes. 
          Retrieve instant answers with 768-dim vector embeddings and interactive RAG AI assistant.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => navigate(token ? '/app' : '/signup')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-sm font-bold shadow-xl transition-all hover:scale-105"
          >
            <Zap className="w-4 h-4 text-emerald-200 fill-current" />
            <span>{token ? 'Open Your SecondBrain' : 'Start Building Free'}</span>
          </button>
          <a
            href="#demo"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border-slate-200 text-slate-800 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-200 border text-sm font-semibold transition-all shadow-sm"
          >
            <Play className="w-4 h-4 text-emerald-500 dark:text-emerald-400 fill-current" />
            <span>Try Interactive Demo</span>
          </a>
        </div>

        {/* Hero Graphic / Product Preview Mockup */}
        <div className="relative max-w-5xl mx-auto rounded-2xl bg-white border-slate-200 text-slate-900 dark:border-zinc-800 dark:bg-zinc-950/90 border p-2 sm:p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-zinc-800 mb-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-[11px] text-slate-500 dark:text-zinc-400">secondbrain.app/app</span>
            </div>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Vector Engine Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-2">
            {/* Card Preview 1: YouTube */}
            <div className="bg-slate-50 border-slate-200 dark:bg-black dark:border-zinc-800 border rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-900 dark:text-zinc-200 text-xs font-bold mb-2">
                  <YoutubeIcon className="w-4 h-4 text-rose-500" />
                  <span>DSA Patterns Masterclass</span>
                </div>
                <div className="aspect-video bg-slate-200 border-slate-300 dark:bg-zinc-900 dark:border-zinc-800 rounded-lg flex items-center justify-center border relative overflow-hidden group">
                  <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="flex gap-1 mt-3">
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">#dsa</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">#leetcode</span>
              </div>
            </div>

            {/* Card Preview 2: Tweet */}
            <div className="bg-slate-50 border-slate-200 dark:bg-black dark:border-zinc-800 border rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sky-500 text-xs font-bold mb-2">
                  <TwitterIcon className="w-4 h-4 text-sky-400" />
                  <span>React 19 Hooks Thread</span>
                </div>
                <p className="text-slate-700 dark:text-zinc-300 text-xs leading-relaxed font-mono text-[11px]">
                  "useActionState & useOptimistic simplify full-stack state mutation dramatically in Next.js & Vite."
                </p>
              </div>
              <div className="flex gap-1 mt-3">
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">#react</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">#webdev</span>
              </div>
            </div>

            {/* AI Assistant Drawer Preview */}
            <div className="bg-slate-100 border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 border rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-900 dark:text-white text-xs font-bold mb-2">
                  <Bot className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>RAG AI Assistant</span>
                </div>
                <div className="bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300 border rounded-lg p-2.5 text-[11px] mb-2 font-medium">
                  "Found 2 relevant cards on React & DSA patterns!"
                </div>
                <div className="text-[10px] bg-white border-slate-200 text-slate-600 dark:text-zinc-400 dark:bg-black p-2 rounded border dark:border-zinc-800">
                  ⚡ OpenRouter embedding match: 98.4%
                </div>
              </div>
              <button 
                onClick={() => navigate('/signup')}
                className="mt-3 w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-[11px] font-bold transition-colors"
              >
                Try RAG Chatbot
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Section */}
      <section id="features" className="py-20 bg-white border-slate-200 dark:bg-zinc-950 border-y dark:border-zinc-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">Core Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Built for Developers, Researchers & Knowledge Builders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border-slate-200 dark:bg-black dark:border-zinc-800 border transition-all group">
              <div className="w-12 h-12 rounded-xl bg-slate-200 border-slate-300 text-emerald-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-emerald-400 border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Multi-Format Cards</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Organize YouTube videos with interactive embedded players, Twitter tweets, web links, and custom markdown notes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border-slate-200 dark:bg-black dark:border-zinc-800 border transition-all group">
              <div className="w-12 h-12 rounded-xl bg-slate-200 border-slate-300 text-sky-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-sky-400 border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Pinecone Vector Search</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                768-dimensional vector index powered by OpenRouter text-embedding-3-small. Search by meaning rather than exact keywords.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border-slate-200 dark:bg-black dark:border-zinc-800 border transition-all group">
              <div className="w-12 h-12 rounded-xl bg-slate-200 border-slate-300 text-emerald-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-emerald-400 border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">RAG AI Assistant</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Chat with your personal knowledge vault. Get instant summaries, answers, and horizontal card recommendation carousels.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border-slate-200 dark:bg-black dark:border-zinc-800 border transition-all group">
              <div className="w-12 h-12 rounded-xl bg-slate-200 border-slate-300 text-emerald-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-emerald-400 border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">1-Click Vault Sharing</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Publish a read-only public URL for your curated brain vault so friends or colleagues can explore your bookmarks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Teaser Section */}
      <section id="demo" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white border-slate-200 dark:bg-zinc-950 dark:border-zinc-800 border rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Interactive Playground</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">Try Searching SecondBrain Right Now</h2>
          </div>

          {/* Search Box */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 absolute left-4" />
              <input
                type="text"
                value={demoQuery}
                onChange={(e) => handleDemoSearch(e.target.value)}
                placeholder="Try typing 'React', 'DSA', or 'Web development'..."
                className="w-full bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400 dark:bg-black dark:border-zinc-800 dark:text-zinc-100 border rounded-xl pl-11 pr-4 py-3 text-xs focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Quick Filter Pill Options */}
          <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto mb-8">
            {['React Development', 'DSA Patterns', 'YouTube Notes', 'Twitter Threads'].map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleDemoSearch(prompt)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 border-slate-200 text-slate-700 dark:bg-black dark:border-zinc-800 dark:text-zinc-300 border text-xs hover:opacity-80 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Demo Output Box */}
          {demoSearchResult && (
            <div className="max-w-xl mx-auto p-4 rounded-xl bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-black dark:border-emerald-500/40 dark:text-emerald-300 border text-xs animate-fade-in flex items-center justify-between">
              <span>{demoSearchResult}</span>
              <button
                onClick={() => navigate('/signup')}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 shrink-0 ml-2"
              >
                <span>Save to your brain</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-100 border-slate-200 dark:bg-black border-t dark:border-zinc-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">Workflow</h2>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-16">
            3 Simple Steps to Infinite Knowledge
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl bg-white border-slate-200 dark:bg-zinc-950 dark:border-zinc-800 border relative">
              <span className="text-4xl font-black text-emerald-500/30 mb-4 block">01</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Capture Content</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Paste YouTube video links, Twitter URLs, or write markdown notes. Add custom tags for fast category filtering.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border-slate-200 dark:bg-zinc-950 dark:border-zinc-800 border relative">
              <span className="text-4xl font-black text-emerald-500/30 mb-4 block">02</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">AI Vector Indexing</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                OpenRouter generates 768-dimensional embeddings instantly and syncs your items into a serverless Pinecone index.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border-slate-200 dark:bg-zinc-950 dark:border-zinc-800 border relative">
              <span className="text-4xl font-black text-emerald-500/30 mb-4 block">03</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Retrieve & RAG Chat</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Search semantically or slide open the AI Chatbot drawer to ask questions and receive card recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">Pricing</h2>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Simple, Transparent Pricing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 rounded-3xl bg-white border-slate-200 dark:bg-zinc-950 dark:border-zinc-800 border flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Starter</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 mb-4">Free Forever</h3>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-6">$0 <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">/ month</span></div>

              <ul className="space-y-3 text-xs text-slate-700 dark:text-zinc-300 mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Save unlimited YouTube videos & Tweets</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Pinecone 768-dim Vector Search</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> RAG AI Chatbot with OpenRouter</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Public Brain Share links</li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/signup')}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white text-xs font-bold transition-colors border border-slate-200 dark:border-zinc-700"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Tier */}
          <div className="p-8 rounded-3xl bg-slate-900 border-slate-800 dark:bg-zinc-950 dark:border-emerald-500/50 border text-white relative flex flex-col justify-between shadow-2xl">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
              Popular
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase">Pro Vault</span>
              <h3 className="text-2xl font-black text-white mt-1 mb-4">Power User</h3>
              <div className="text-3xl font-black text-white mb-6">$9 <span className="text-xs font-normal text-slate-400">/ month</span></div>

              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Everything in Starter</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority OpenRouter LLM Models</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Custom Domain Public Brain Share</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated Web Scraping Ingestion</li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/signup')}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all hover:scale-[1.02]"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-100 border-slate-200 dark:bg-black border-t dark:border-zinc-800 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Got Questions?</h2>
            <p className="text-3xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white border-slate-200 dark:bg-zinc-950 dark:border-zinc-800 border overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-bold text-slate-900 dark:text-white transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0 transition-transform duration-200 ${expandedFaq === index ? 'rotate-180 text-emerald-500 dark:text-emerald-400' : ''}`} />
                </button>
                {expandedFaq === index && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed border-t border-slate-200 dark:border-zinc-800 pt-3 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white dark:border-zinc-800 dark:bg-black py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-zinc-500">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-900 text-white dark:bg-zinc-800 dark:text-emerald-400">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">SecondBrain AI</span>
          </div>

          <p>© {new Date().getFullYear()} SecondBrain. Built with React, OpenRouter, Pinecone & MongoDB.</p>

          <div className="flex items-center gap-6 text-slate-600 dark:text-zinc-400">
            <a href="#features" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Pricing</a>
            <Link to="/signin" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
