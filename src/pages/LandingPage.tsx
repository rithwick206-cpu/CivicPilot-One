import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Cpu, Database, ShieldAlert, Sparkles, TrendingUp, Users, Cloud } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 overflow-x-hidden">
      {/* Background Animated Gradient */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-900/20 via-cyan-900/10 to-transparent pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl font-sans tracking-tight text-white">CivicPilot <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">One</span></span>
            <span className="block text-[10px] text-slate-400 font-mono tracking-widest uppercase">Decision Intelligence</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#architecture" className="hover:text-cyan-400 transition-colors">AI Pipeline</a>
          <a href="#cloud" className="hover:text-cyan-400 transition-colors">Google Cloud</a>
          <a href="#stats" className="hover:text-cyan-400 transition-colors">Impact</a>
        </nav>

        <button 
          onClick={() => navigate('/login')}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-2 group text-white"
        >
          Console Login <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Powered by Google Gemini & Vertex AI
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-sans tracking-tight leading-[1.1] text-white max-w-4xl mx-auto">
          Your AI Chief <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Decision Officer</span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light">
          CivicPilot One is an enterprise Decision Intelligence Platform that empowers cities, campuses, and governments to make data-driven decisions in real-time.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-900 font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 text-white"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
          <a
            href="#architecture"
            className="px-8 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-700/80 hover:border-slate-600 transition-all"
          >
            View AI Architecture
          </a>
        </div>

        {/* Product Showcase Window Mockup */}
        <div className="mt-20 relative max-w-5xl mx-auto rounded-2xl border border-slate-700/50 bg-slate-950/80 p-3 shadow-2xl shadow-blue-900/15">
          <div className="absolute inset-x-0 top-0 h-10 bg-slate-900 rounded-t-xl flex items-center px-4 gap-2 border-b border-slate-800/60">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-4 text-xs font-mono text-slate-500">console.civicpilot.one/dashboard</span>
          </div>
          <div className="pt-10 rounded-lg overflow-hidden border border-slate-800">
            {/* Visual placeholder representing the app interface */}
            <div className="bg-slate-900 p-8 grid grid-cols-3 gap-6 text-left">
              <div className="col-span-2 space-y-6">
                <div className="h-28 rounded-xl bg-slate-950/90 border border-slate-800 p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-cyan-400 tracking-wider">⭐ EXECUTIVE COPILOT</span>
                    <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px]">Healthy</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <h4 className="text-xs text-slate-400">Community Health Score</h4>
                      <h3 className="text-2xl font-bold font-sans text-white">92 / 100</h3>
                    </div>
                    <div className="text-xs text-slate-400 text-right">
                      <span>94% AI Confidence</span>
                    </div>
                  </div>
                </div>
                <div className="h-44 rounded-xl bg-slate-950/90 border border-slate-800 p-5 space-y-3">
                  <span className="text-xs font-mono text-blue-400">📈 REAL-TIME URBAN FORECAST</span>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/40">
                      <span className="block text-[10px] text-slate-500 uppercase">Traffic</span>
                      <span className="text-base font-bold text-white">82%</span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/40">
                      <span className="block text-[10px] text-slate-500 uppercase">Waste</span>
                      <span className="text-base font-bold text-white">91%</span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/40">
                      <span className="block text-[10px] text-slate-500 uppercase">Air Quality</span>
                      <span className="text-base font-bold text-white">110 AQI</span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/40">
                      <span className="block text-[10px] text-slate-500 uppercase">Water</span>
                      <span className="text-base font-bold text-white">90%</span>
                    </div>
                  </div>
                  <div className="h-10 bg-slate-900/40 rounded border border-slate-800/20 flex items-center justify-between px-3 text-xs text-slate-400">
                    <span>Target optimization: Deploying smart waste dispatch</span>
                    <span className="text-cyan-400">Details &rarr;</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-78 rounded-xl bg-slate-950/90 border border-slate-800 p-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-mono text-amber-500">🚨 EMERGENCY CENTER</span>
                    <div className="space-y-2">
                      <div className="p-2 bg-red-950/30 border border-red-900/50 rounded-lg text-xs text-red-400">
                        <strong>Whitefield:</strong> Water pipeline burst
                      </div>
                      <div className="p-2 bg-yellow-950/30 border border-yellow-900/50 rounded-lg text-xs text-yellow-400">
                        <strong>RR Nagar:</strong> Storm drain surge
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white text-center transition-colors"
                  >
                    Open Live Command Center
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics / Statistics Bar */}
      <section id="stats" className="max-w-7xl mx-auto px-6 py-12 border-y border-slate-800/60 bg-slate-950/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <h4 className="text-3xl md:text-5xl font-bold font-sans text-cyan-400">95%</h4>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Prediction Accuracy</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-3xl md:text-5xl font-bold font-sans text-blue-500">80%</h4>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Faster Decision Making</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-3xl md:text-5xl font-bold font-sans text-teal-400">40%</h4>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Operational Cost Reduction</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-3xl md:text-5xl font-bold font-sans text-indigo-500">10M+</h4>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Citizens Supported</p>
          </div>
        </div>
      </section>

      {/* Key AI Pipeline Flow Architecture Section */}
      <section id="architecture" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-sans text-white">CivicPilot One End-to-End AI Pipeline</h2>
          <p className="mt-4 text-slate-400">
            A continuous loop transforming raw citizen input into optimal executive actions.
          </p>
        </div>

        {/* Visual Pipeline Graph */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl space-y-3 shadow-md">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm">1</div>
              <h4 className="font-bold text-sm text-white">Citizen Upload</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Incident image, location metadata, and description uploaded.</p>
            </div>
            
            <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl space-y-3 shadow-md">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-sm">2</div>
              <h4 className="font-bold text-sm text-white">Gemini Vision & Risk</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Vertex AI detects categories, severity, and calculates risk index.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl space-y-3 shadow-md">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-sm">3</div>
              <h4 className="font-bold text-sm text-white">BigQuery & Prediction</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Data written to BigQuery. Prediction engine forecasts city-wide impact.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl space-y-3 shadow-md">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold text-sm">4</div>
              <h4 className="font-bold text-sm text-white">Decision Engine</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Recommendations compiled with explainable AI reasoning nodes.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl space-y-3 shadow-md">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 font-bold text-sm">5</div>
              <h4 className="font-bold text-sm text-white">Executive Dashboard</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Commissioner reviews health metrics, triggers actions, and allocates crews.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">⭐ Decision Center</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Overall Community Health monitoring dashboard. View explainable AI risk pipelines and trigger resource re-allocations instantly.
            </p>
          </div>
          
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">🤖 Assistant & Vision</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Google Gemini-powered ChatGPT-style assistant. Upload photos of potholes or garbage for immediate automated classification.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">📈 Prediction Center</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Forecast urban indexes like traffic congestion, waste levels, and power load with confidence range indicators and risk charts.
            </p>
          </div>
        </div>
      </section>

      {/* Google Cloud Tech Stack Integration Section */}
      <section id="cloud" className="max-w-7xl mx-auto px-6 py-20 text-center space-y-12">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold font-sans text-white">Enterprise Google Cloud Architecture</h2>
          <p className="text-slate-400">
            CivicPilot One is built on a scalable cloud foundation, featuring full Google Cloud integrations for government scale.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-4 text-left">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Vertex AI & Gemini</h4>
              <p className="text-[11px] text-slate-500">Agentic NL queries & vision</p>
            </div>
          </div>

          <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-4 text-left">
            <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">BigQuery Warehouse</h4>
              <p className="text-[11px] text-slate-500">Structured city metrics</p>
            </div>
          </div>

          <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-4 text-left">
            <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Firebase Auth</h4>
              <p className="text-[11px] text-slate-500">Secure user access levels</p>
            </div>
          </div>

          <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-4 text-left">
            <div className="p-3 bg-teal-500/10 rounded-lg text-teal-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Cloud Run & Functions</h4>
              <p className="text-[11px] text-slate-500">Scalable microservice deployments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center relative">
        <div className="absolute inset-0 bg-blue-600/5 blur-[80px] pointer-events-none" />
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold font-sans text-white">Ready to upgrade your community decision intelligence?</h2>
          <p className="text-slate-400">
            Launch the console workspace to run simulations, evaluate risks, and interact with the Gemini-powered city assistant.
          </p>
          <div className="pt-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-10 py-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-900 font-bold transition-all shadow-xl shadow-blue-500/25 flex items-center gap-2 mx-auto text-white"
            >
              Access Executive Console <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-10 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-slate-400">© 2026 CivicPilot One. Built for Google Gen AI Academy.</span>
          </div>
          <div className="flex gap-6 text-xs text-slate-500">
            <span>Powered by Google Cloud</span>
            <span>Gemini 1.5 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
