import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] px-4 transition-colors duration-500">
      <div className="max-w-md w-full bg-white dark:bg-[#131A2B] rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none p-10 border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-teal-400 mb-6 shadow-sm">
            <LogIn size={32} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-3">Sign in to manage your leads</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-500 outline-none transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-500 outline-none transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 tracking-widest"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-rose-600 dark:text-rose-400 text-sm font-bold bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/30 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 dark:bg-teal-500 hover:bg-indigo-700 dark:hover:bg-teal-400 text-white dark:text-slate-900 font-black uppercase tracking-widest text-sm py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 dark:shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 dark:text-teal-400 hover:text-indigo-700 dark:hover:text-teal-300 hover:underline ml-1">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
