import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTranslation, TranslationKey } from '../utils/translations';
import { 
  ShieldAlert, Sparkles, TrendingDown, ArrowRight, 
  CheckCircle, Play, RefreshCw, AlertCircle, Users, Activity,
  BrainCircuit
} from 'lucide-react';

export const DecisionCenter: React.FC = () => {
  // Simulator State (from AppContext)
  const {
    pumpsDeployed,
    setPumpsDeployed,
    reroutingActive,
    setReroutingActive,
    cleaningActive,
    setCleaningActive,
    simulationTriggered,
    setSimulationTriggered,
    addNotification,
    addAuditLog,
    language,
  } = useAppContext();

  const navigate = useNavigate();
  const { t } = useTranslation(language);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showLocalToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compute live scores based on user choices
  const currentFloodRisk = pumpsDeployed ? 31 : 82;
  const currentTrafficDelay = reroutingActive ? 24 : 76;
  const healthHazardRisk = cleaningActive ? 18 : 65;

  const currentCommunityHealth = Math.round(
    92 + (pumpsDeployed ? 2.5 : -2) + (reroutingActive ? 1.5 : -1) + (cleaningActive ? 2 : -1.5)
  );

  const triggerSimulationRun = () => {
    setSimulationTriggered(true);
    setTimeout(() => setSimulationTriggered(false), 800);
  };

  const handleGenerateReport = () => {
    navigate('/app/reports', { state: { compile: true, type: 'emergency' } });
  };

  const handleAuthorizeDispatch = () => {
    setDispatchSuccess(true);
    const activeMitigations = [];
    if (pumpsDeployed) activeMitigations.push('Sewer Pumps');
    if (reroutingActive) activeMitigations.push('Traffic Rerouting');
    if (cleaningActive) activeMitigations.push('SWM Crews');

    const msg = `Authorized dispatch: ${activeMitigations.join(', ')}`;
    addNotification({ message: `System Command: ${msg}` });
    addAuditLog({
      action: `Resource dispatch authorized for simulation: ${activeMitigations.join(', ')}`,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
    showLocalToast('Resource dispatch authorized successfully.');
    setTimeout(() => setDispatchSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl animate-fade-in z-50 text-xs font-bold border border-slate-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          {toastMessage}
        </div>
      )}

      {/* Copilot Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
        {/* Glow effect */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> {t('Executive Decision Engine Active')}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{t('Good Morning')}, {t('Commissioner Rao')}</h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              CivicPilot One has processed 148 IoT streams, 4 BBMP datasets, and 92 citizen reports over the past 6 hours. Here is your AI Decision Roadmap.
            </p>
          </div>

          <button 
            onClick={handleGenerateReport}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center gap-2 text-sm shadow-lg shadow-blue-500/20 shrink-0"
          >
            {t('Generate Executive AI Report')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Health Score Circular Gauge & Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-premium flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Overall Community Health
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Weighted metric composite score.</p>
            
            {/* Circular Gauge */}
            <div className="flex items-center justify-center py-6 relative">
              <svg className="w-36 h-36">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  fill="transparent"
                  stroke="currentColor"
                  stroke-width="12"
                  className="text-slate-100 dark:text-slate-800"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  fill="transparent"
                  stroke="url(#blueGradient)"
                  stroke-width="12"
                  stroke-dasharray={2 * Math.PI * 62}
                  stroke-dashoffset={2 * Math.PI * 62 * (1 - currentCommunityHealth / 100)}
                  stroke-linecap="round"
                  className="transition-all duration-500 ease-out"
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{currentCommunityHealth}</span>
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-0.5">Healthy</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Live AI Confidence</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">94% Circular Accuracy</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Critical Sectors Affected</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">1 (Whitefield)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">System Integration Sync</span>
                <span className="font-semibold text-green-500">Active</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Today's Executive Summary</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Localized stormwater flooding risk is high in Whitefield due to rain. Pre-deployment of drainage pumps is predicted to mitigate 80% of damage. Minor congestion spikes detected in Yeshwanthpur and Koramangala.
            </p>
          </div>
        </div>

        {/* Center Column: Top 5 Risks & Priorities */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-premium flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" /> Active Risks & Priorities
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Top classified anomalies needing intervention.</p>
            </div>

            {/* Top 5 Risks */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top 5 Critical Risks</span>
              
              <div className="flex items-center justify-between p-2.5 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">1. Whitefield Flood Risk</span>
                <span className="text-red-500 font-bold">{currentFloodRisk}% Risk</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">2. Yeshwanthpur Traffic Junction</span>
                <span className="text-amber-500 font-bold">{currentTrafficDelay}% Delay</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">3. RR Nagar Drainage Congestion</span>
                <span className="text-amber-500 font-bold">54% Congested</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">4. Koramangala Waste Build-Up</span>
                <span className="text-slate-500 font-medium">32 Tons Pileup</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">5. Electronic City Substation Grid</span>
                <span className="text-slate-500 font-medium">Stable (Strain)</span>
              </div>
            </div>

            {/* Top 5 Priorities */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top 5 Action Priorities</span>
              <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <div className="p-1 bg-red-500/10 border border-red-500/25 rounded text-red-500">P1: Drain</div>
                <div className="p-1 bg-amber-500/10 border border-amber-500/25 rounded text-amber-500">P2: Traffic</div>
                <div className="p-1 bg-amber-500/10 border border-amber-500/25 rounded text-amber-500">P3: Waste</div>
                <div className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">P4: Lights</div>
                <div className="p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">P5: Water</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-950/20 border border-red-900/50 rounded-xl text-xs text-red-400 flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Emergency Alert:</strong> Water main burst near ITPL Road. Immediate sewer pump deployment required.
            </div>
          </div>
        </div>

        {/* Right Column: Before vs After Live Simulator */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-premium flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCw className={`w-5 h-5 text-blue-500 ${simulationTriggered ? 'animate-spin' : ''}`} /> Mitigation Simulator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Toggle deployment parameters to preview risk shifts.</p>
            </div>

            {/* Sim controls */}
            <div className="space-y-3.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
              <div className="flex justify-between items-center">
                <div>
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Deploy Suction Pumps</span>
                  <span className="text-[10px] text-slate-400">Mitigates Whitefield Flood Risk</span>
                </div>
                <input
                  type="checkbox"
                  checked={pumpsDeployed}
                  onChange={e => { setPumpsDeployed(e.target.checked); triggerSimulationRun(); }}
                  className="w-8 h-4 bg-slate-300 dark:bg-slate-700 checked:bg-blue-600 rounded-full appearance-none cursor-pointer relative after:content-[''] after:absolute after:w-3.5 after:h-3.5 after:bg-white after:rounded-full after:left-0.5 after:top-0.5 checked:after:translate-x-3.5 after:transition-transform"
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Activate Traffic Rerouting</span>
                  <span className="text-[10px] text-slate-400">Reroute ITPL congestion to bypasses</span>
                </div>
                <input
                  type="checkbox"
                  checked={reroutingActive}
                  onChange={e => { setReroutingActive(e.target.checked); triggerSimulationRun(); }}
                  className="w-8 h-4 bg-slate-300 dark:bg-slate-700 checked:bg-blue-600 rounded-full appearance-none cursor-pointer relative after:content-[''] after:absolute after:w-3.5 after:h-3.5 after:bg-white after:rounded-full after:left-0.5 after:top-0.5 checked:after:translate-x-3.5 after:transition-transform"
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Deploy Waste Cleaning Crew</span>
                  <span className="text-[10px] text-slate-400">Clear overflowed garbage piles</span>
                </div>
                <input
                  type="checkbox"
                  checked={cleaningActive}
                  onChange={e => { setCleaningActive(e.target.checked); triggerSimulationRun(); }}
                  className="w-8 h-4 bg-slate-300 dark:bg-slate-700 checked:bg-blue-600 rounded-full appearance-none cursor-pointer relative after:content-[''] after:absolute after:w-3.5 after:h-3.5 after:bg-white after:rounded-full after:left-0.5 after:top-0.5 checked:after:translate-x-3.5 after:transition-transform"
                />
              </div>
            </div>

            {/* Before vs After output display */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase">Pre-Mitigation Flood Risk</span>
                <span className="text-2xl font-bold text-red-500 mt-1 block">82%</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase">Predicted Post-Risk</span>
                <span className={`text-2xl font-bold mt-1 block transition-all ${currentFloodRisk < 40 ? 'text-green-500' : 'text-red-500'}`}>
                  {currentFloodRisk}%
                </span>
              </div>
            </div>
          </div>

          <button 
            disabled={(!pumpsDeployed && !reroutingActive && !cleaningActive) || dispatchSuccess}
            onClick={handleAuthorizeDispatch}
            className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            {dispatchSuccess ? (
              <><CheckCircle className="w-4 h-4 text-green-400" /> Authorized ✓</>
            ) : (
              t('Authorize Resource Dispatch')
            )}
          </button>
        </div>
      </div>

      {/* AI Explainability & Timeline Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Explainability Pipeline (Why?) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-premium">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-blue-500" /> Explainable AI Decision Pipeline (Why?)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Step-by-step reasoning nodes supporting the drainage alert recommendation.</p>
            </div>
            <div className="px-2.5 py-1 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-lg text-xs font-bold font-mono">
              94% Confidence
            </div>
          </div>

          {/* Node chain flowchart */}
          <div className="relative bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl p-5 overflow-x-auto no-scrollbar">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 min-w-[500px]">
              
              <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-center shadow-premium relative">
                <span className="block text-[9px] text-slate-400 font-mono">EVENT ROOT</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">Heavy Rainfall</span>
                <span className="text-[9px] text-blue-500 font-medium">IMD Radar Alert</span>
              </div>
              
              <div className="text-slate-400 font-bold">&rarr;</div>

              <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-center shadow-premium">
                <span className="block text-[9px] text-slate-400 font-mono">PRIMARY BLOCK</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">Garbage Overflow</span>
                <span className="text-[9px] text-amber-500 font-medium">Blockage Checked</span>
              </div>

              <div className="text-slate-400 font-bold">&rarr;</div>

              <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-center shadow-premium">
                <span className="block text-[9px] text-slate-400 font-mono">SECONDARY VECTOR</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">Mosquito Increase</span>
                <span className="text-[9px] text-orange-500 font-medium">Prediction Alert</span>
              </div>

              <div className="text-slate-400 font-bold">&rarr;</div>

              <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-center shadow-premium">
                <span className="block text-[9px] text-slate-400 font-mono">RISK CLASSIFIER</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">Health Risk</span>
                <span className="text-[9px] text-red-500 font-medium">Critical Threshold</span>
              </div>

              <div className="text-slate-400 font-bold">&rarr;</div>

              <div className="flex-1 bg-gradient-to-tr from-blue-600 to-cyan-500 border-none p-3 rounded-xl text-center text-white shadow-premium">
                <span className="block text-[9px] text-blue-100 font-mono">ACTION END</span>
                <span className="text-xs font-bold mt-1 block">Deploy Clean Team</span>
                <span className="text-[9px] text-cyan-100 font-semibold">Immediate Dispatch</span>
              </div>

            </div>
          </div>
        </div>

        {/* Decision Timeline Log */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-premium">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Decision Timeline Log</h3>
          <div className="space-y-4">
            
            <div className="flex gap-3 text-xs">
              <span className="font-mono text-slate-400 font-bold shrink-0 w-14">08:00 AM</span>
              <div className="border-l-2 border-blue-500 pl-3 pb-1">
                <span className="block font-semibold text-slate-850 dark:text-slate-200">Weather Alert registered</span>
                <span className="block text-[10px] text-slate-400">Precipitation model forecasts rain anomaly.</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs">
              <span className="font-mono text-slate-400 font-bold shrink-0 w-14">08:20 AM</span>
              <div className="border-l-2 border-blue-500 pl-3 pb-1">
                <span className="block font-semibold text-slate-850 dark:text-slate-200">AI Risk Analysis finished</span>
                <span className="block text-[10px] text-slate-400">Whitefield risk index raised to 82%.</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs">
              <span className="font-mono text-slate-400 font-bold shrink-0 w-14">08:35 AM</span>
              <div className="border-l-2 border-blue-500 pl-3 pb-1">
                <span className="block font-semibold text-slate-850 dark:text-slate-200">Action recommendations compiled</span>
                <span className="block text-[10px] text-slate-400">Gemini suggests suction pump deployment.</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs">
              <span className="font-mono text-slate-400 font-bold shrink-0 w-14">09:00 AM</span>
              <div className="border-l-2 border-green-500 pl-3 pb-1">
                <span className="block font-semibold text-slate-850 dark:text-slate-200 text-green-500">Resources Allocated</span>
                <span className="block text-[10px] text-slate-400">3 Sewer suction pumps dispatched.</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs">
              <span className="font-mono text-slate-400 font-bold shrink-0 w-14">10:15 AM</span>
              <div className="pl-3 pb-1">
                <span className="block font-semibold text-slate-850 dark:text-slate-200">Risk Reduced</span>
                <span className="block text-[10px] text-slate-400">Sensor logs show flood depth down by 65%.</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
