import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Lock, User, Mail, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      showToast('Please fill out all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.signup({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      if (res.token && res.user) {
        login(res.token, res.user);
        showToast('Account created successfully!', 'success');
        navigate('/');
      } else {
        showToast(res.error || 'Registration failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Signup failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-black dark:text-zinc-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl bg-white border-slate-200 dark:border-zinc-800 dark:bg-zinc-950 border shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Left Side: Brand Showcase */}
        <div className="p-8 md:p-12 bg-slate-100 border-slate-200 dark:bg-zinc-900 flex flex-col justify-between border-b md:border-b-0 md:border-r dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white border-slate-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-emerald-400 border flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                SecondBrain
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Build your personal <br />
              <span className="text-emerald-500 dark:text-emerald-400">Knowledge Hub today</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-6">
              Create an account in seconds to save YouTube videos, tweets, links, and documents.
            </p>

            <div className="flex flex-col gap-3">
              {[
                'Free AI vector indexing for all your notes',
                'Ask questions & retrieve exact citations',
                'Share public collections anytime'
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 text-xs text-slate-500 dark:text-zinc-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Join thousands organizing their knowledge</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Account</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Get started with your Second Brain</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. john_doe"
                  className="w-full bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400 dark:bg-black dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-emerald-500 border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400 dark:bg-black dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-emerald-500 border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400 dark:bg-black dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-emerald-500 border rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 mt-2 w-full py-3 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 font-semibold text-sm shadow-lg transition-all disabled:opacity-50 active:scale-[0.99]"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-zinc-800 text-center">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Already have an account?{' '}
              <Link to="/signin" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
