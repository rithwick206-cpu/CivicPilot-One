import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, AlertCircle, CheckCircle } from 'lucide-react';

export const Otp: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVerify = () => {
    // Simple demo: accept any 6-digit code
    if (!/^[0-9]{6}$/.test(code)) {
      setError('Enter a valid 6‑digit code');
      return;
    }
    setError(null);
    setSuccess(true);
    setTimeout(() => navigate('/app/dashboard'), 1200);
  };

  // If user is not authenticated, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background decorative */}
      <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-950/70 backdrop-blur-premium border border-slate-800/80 p-8 rounded-2xl shadow-dark-premium text-slate-100 z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/15 mb-3">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-sans text-white">OTP Verification</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">Secure your session</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 rounded-lg flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-950/40 border border-green-900/50 rounded-lg flex items-center gap-2 text-xs text-green-400">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Verified! Redirecting…</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">One‑Time Code</label>
            <input
              type="text"
              placeholder="123456"
              value={code}
              onChange={e => setCode(e.target.value)}
              maxLength={6}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-4 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={success}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-purple-500/10 flex items-center justify-center gap-2 mt-2 text-sm"
          >
            Verify OTP
          </button>
        </div>
      </div>
    </div>
  );
};
