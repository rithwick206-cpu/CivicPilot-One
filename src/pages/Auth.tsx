import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, User } from '../context/AuthContext';
import { Brain, Lock, Mail, User as UserIcon, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, googleSignIn, forgotPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<User['role']>('Commissioner');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const validateEmail = (email: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const validatePassword = (pwd: string) => pwd.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!validateEmail(email)) throw new Error('Invalid email format');
        if (!validatePassword(password)) throw new Error('Password must be at least 6 characters');
        const targetEmail = email || 'commissioner@civicpilot.in';
        const targetPassword = password || 'password';
        await login(targetEmail, targetPassword);
        if (!rememberMe) localStorage.removeItem('civicpilot_user');
        navigate('/app/dashboard');
      } else if (mode === 'register') {
        if (!validateEmail(email)) throw new Error('Invalid email format');
        if (!validatePassword(password)) throw new Error('Password must be at least 6 characters');
        if (!name) throw new Error('Full name is required');
        await register(email, password, name, role);
        navigate('/app/dashboard');
      } else {
        await forgotPassword(email);
        setSuccessMessage('Password reset instructions sent. Please check your inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await googleSignIn();
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google Auth failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative blurry backgrounds */}
      <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Auth Card */}
      <div className="w-full max-w-md bg-slate-950/70 backdrop-blur-premium border border-slate-800/80 p-8 rounded-2xl shadow-dark-premium text-slate-100 z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/15 mb-3">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-sans text-white">CivicPilot <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">One</span></h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">Your AI Chief Decision Officer</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 rounded-lg flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-950/40 border border-green-900/50 rounded-lg flex items-center gap-2 text-xs text-green-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Commissioner Rao"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder={mode === 'login' ? 'commissioner@civicpilot.in' : 'name@government.in'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('forgot')} className="text-xs text-blue-400 hover:underline">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-200 focus:outline-none focus:border-blue-5   00 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-3 text-slate-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Administrative Role</label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as User['role'])}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="Commissioner">Commissioner</option>
                  <option value="Deputy Commissioner">Deputy Commissioner</option>
                  <option value="Operations Manager">Operations Manager</option>
                  <option value="Field Supervisor">Field Supervisor</option>
                </select>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs text-slate-400">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="form-checkbox h-3 w-3 text-blue-600 bg-slate-800 border-slate-600 rounded" />
                <span>Remember Me</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 mt-4 text-sm"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Access Console' : mode === 'register' ? 'Register Account' : 'Send Reset Link'}
          </button>
        </form>

        {/* Divider */}
        {mode !== 'forgot' && (
          <>
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-slate-800" />
              <span className="px-3 text-xs text-slate-500 font-mono uppercase">OR</span>
              <div className="flex-1 border-t border-slate-800" />
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 py-2.5 rounded-xl flex items-center justify-center gap-2.5 text-slate-300 font-semibold transition-all text-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.6 5.6 0 0 1 8.3 13a5.6 5.6 0 0 1 5.69-5.6c1.47 0 2.8.5 3.84 1.48l3.18-3.18C18.99 3.66 16.34 2.6 13.99 2.6a10.4 10.4 0 0 0-10.4 10.4 10.4 10.4 0 0 0 10.4 10.4c5.78 0 9.82-3.97 9.82-9.82 0-.6-.05-1.12-.17-1.63H12.24Z" />
              </svg>
              Google Cloud Account
            </button>
          </>
        )}

        {/* Switch mode links */}
        <div className="mt-6 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <p>
              New administrator?{' '}
              <button onClick={() => setMode('register')} className="text-blue-400 hover:underline">
                Create console profile
              </button>
            </p>
          ) : (
            <p>
              Already have credentials?{' '}
              <button onClick={() => setMode('login')} className="text-blue-400 hover:underline">
                Login here
              </button>
            </p>
          )}
        </div>

        {/* Default Creds Indicator */}
        {mode === 'login' && (
          <div className="mt-6 p-2 bg-slate-900/40 border border-slate-800 rounded-lg text-[10px] text-slate-500 text-center font-mono">
            Demo Credentials:<br />
            commissioner@civicpilot.in / password
          </div>
        )}
      </div>
    </div>
  );
};
