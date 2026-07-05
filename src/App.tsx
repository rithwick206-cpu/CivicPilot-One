import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AppProvider, useAppContext } from './context/AppContext';
import { useTranslation, TranslationKey } from './utils/translations';

// Import Pages
import { LandingPage } from './pages/LandingPage';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { DecisionCenter } from './pages/DecisionCenter';
import { AIAssistant } from './pages/AIAssistant';
import { ComplaintAnalysis } from './pages/ComplaintAnalysis';
import { PredictionCenter } from './pages/PredictionCenter';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';



// Icons
import { 
  Brain, LayoutDashboard, Star, BrainCircuit, Camera, 
  TrendingUp, BarChart3, FileSpreadsheet, Settings as SettingsIcon,
  LogOut, Sun, Moon, Bell, Search, Globe, ChevronDown
} from 'lucide-react';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Platform shell layout
const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, markNotificationRead, clearNotifications, language, setLanguage } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Header dropdown state
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Language label map
  const langLabel: Record<string, string> = { en: 'EN', kn: 'ಕ', hi: 'हि' };

  const { t } = useTranslation(language);

  // Global search index
  const searchIndex = [
    { label: t('Dashboard'), path: '/app/dashboard', desc: 'Operations overview & ward map' },
    { label: t('Decision Center'), path: '/app/decision-center', desc: 'AI risk simulator & priorities' },
    { label: t('AI Assistant'), path: '/app/ai-assistant', desc: 'Gemini AI chat & voice' },
    { label: t('Complaint Analysis'), path: '/app/complaints', desc: 'Upload & classify citizen reports' },
    { label: t('Prediction Center'), path: '/app/predictions', desc: 'Traffic, Flood, Power, Waste forecasts' },
    { label: t('Analytics'), path: '/app/analytics', desc: 'Filter & export incident data' },
    { label: t('Reports'), path: '/app/reports', desc: 'Compile AI executive reports' },
    { label: t('Settings'), path: '/app/settings', desc: 'Theme, language, cloud config' },
    { label: 'Whitefield Ward', path: '/app/dashboard', desc: 'High risk ward - flood & traffic' },
    { label: 'RR Nagar Ward', path: '/app/dashboard', desc: 'Stormwater drain overflow risk' },
    { label: 'Koramangala Ward', path: '/app/dashboard', desc: 'Waste build-up alerts' },
  ];

  const searchResults = searchTerm.trim().length > 1
    ? searchIndex.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

  // Close search on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const menuItems = [
    { path: '/app/dashboard', label: t('Dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: '/app/decision-center', label: t('Decision Center'), icon: <Star className="w-4 h-4" />, highlight: true },
    { path: '/app/ai-assistant', label: t('AI Assistant'), icon: <BrainCircuit className="w-4 h-4" /> },
    { path: '/app/complaints', label: t('Complaint Analysis'), icon: <Camera className="w-4 h-4" /> },
    { path: '/app/predictions', label: t('Prediction Center'), icon: <TrendingUp className="w-4 h-4" /> },
    { path: '/app/analytics', label: t('Analytics'), icon: <BarChart3 className="w-4 h-4" /> },
    { path: '/app/reports', label: t('Reports'), icon: <FileSpreadsheet className="w-4 h-4" /> },
    { path: '/app/settings', label: t('Settings'), icon: <SettingsIcon className="w-4 h-4" /> }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 text-slate-350 z-20">
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/10 shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white">CivicPilot <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">One</span></span>
              <span className="block text-[8px] text-slate-500 font-mono tracking-wider uppercase font-semibold">Chief Decision Officer</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                    isActive 
                      ? item.highlight 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/10'
                        : 'bg-blue-600/10 border border-blue-500/20 text-blue-500 dark:text-blue-400' 
                      : 'hover:bg-slate-800 hover:text-white border border-transparent'
                  } ${item.highlight && !isActive ? 'border-amber-500/30 text-amber-500/90' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.highlight && !isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile Card */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <img 
              src={user?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face'} 
              alt="Avatar" 
              className="w-9 h-9 rounded-lg object-cover border border-slate-700"
            />
            <div className="min-w-0">
              <span className="block text-xs font-bold text-white truncate">{user?.displayName || 'K. R. Rao'}</span>
              <span className="block text-[9px] text-slate-500 font-mono uppercase truncate">{user?.role || 'Commissioner'}</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout Session
          </button>
        </div>
      </aside>

      {/* Main Panel Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-10 shadow-premium">
          {/* Search bar */}
          <div className="relative w-64" ref={searchRef}>
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('Search console maps, files, logs...')} 
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setShowSearchResults(true); }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-1.5 pl-10 pr-4 text-xs text-slate-850 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-1.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => { navigate(r.path); setSearchTerm(''); setShowSearchResults(false); }}
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                  >
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">{r.label}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{r.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Header Navigation controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Selection */}
            <div className="relative">
              <button 
                onClick={() => setShowLanguage(!showLanguage)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all flex items-center gap-1 text-xs font-semibold"
              >
                <Globe className="w-4 h-4" /> {langLabel[language] || 'EN'} <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showLanguage && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 py-1 text-xs">
                  {[{code: 'en', label: 'English'}, {code: 'kn', label: 'ಕನ್ನಡ (Kannada)'}, {code: 'hi', label: 'हिन्दी (Hindi)'}].map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLanguage(l.code as any); setShowLanguage(false); }}
                      className={`w-full px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-950 font-medium ${language === l.code ? 'text-blue-500' : ''}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Center */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-1.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Live System Alerts</h4>
                    {notifications.length > 0 && (
                      <button onClick={clearNotifications} className="text-[10px] text-slate-400 hover:text-red-500">Clear all</button>
                    )}
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {notifications.slice().reverse().map(n => (
                      <div 
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2 rounded-lg text-[10px] leading-tight border cursor-pointer transition-opacity ${
                          n.read ? 'opacity-50' : ''
                        } bg-blue-500/10 border-blue-500/20 text-blue-500`}
                      >
                        {n.read ? '✓ ' : '● '}{n.message}
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-[10px] text-slate-400 text-center py-3">No notifications yet.</p>
                    )}
                  </div>
                  <button 
                    onClick={() => { setShowNotifications(false); navigate('/app/decision-center'); }} 
                    className="w-full text-center py-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-colors block"
                  >
                    Manage active recommendations
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content viewport wrapper */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/40 dark:bg-slate-950/20">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="decision-center" element={<DecisionCenter />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="complaints" element={<ComplaintAnalysis />} />
            <Route path="predictions" element={<PredictionCenter />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

    </div>
  );
};



function App() {
  return (
    <AppProvider>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              {/* Landing page as public root */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Auth page */}
              <Route path="/login" element={<Auth />} />
              
              {/* Platform console layouts */}
              <Route 
                path="/app/*" 
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                } 
              />

              {/* General fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </AppProvider>
  );
}


export default App;
