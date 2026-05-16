import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const { logout, user } = useAuth();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen transition-colors duration-500 bg-slate-50 dark:bg-[#0B0F19]">
      <nav className="bg-white/70 dark:bg-[#131A2B]/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-8 py-5 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-3xl font-black tracking-tighter">
          <span className="text-indigo-600 dark:text-teal-400">Service</span>
          <span className="text-slate-900 dark:text-slate-100">Hive</span>
        </h1>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-teal-400 hover:scale-110 active:scale-95 transition-all shadow-sm"
          >
            {darkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          <div className="text-right mr-2 hidden sm:block">
            <p className="text-sm font-black text-slate-900 dark:text-slate-100 leading-none">{user?.name}</p>
            <p className="text-[10px] text-indigo-600 dark:text-teal-500 font-black uppercase tracking-[0.2em] mt-1">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="bg-slate-900 dark:bg-teal-500 text-white dark:text-slate-900 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-indigo-500/30 dark:hover:shadow-teal-500/30 transition-all"
          >
            Sign Out
          </button>
        </div>
      </nav>
      <main className="p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
