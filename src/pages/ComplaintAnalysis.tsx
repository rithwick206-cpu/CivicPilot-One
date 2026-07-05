import React, { useRef, useState } from 'react';
import { analyzeComplaintImage, ComplaintAnalysisResult } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';
import type { ComplaintAnalysis as ComplaintAnalysisType } from '../context/AppContext';
import { 
  Camera, Upload, MapPin, BrainCircuit, 
  CheckCircle, Clock, X
} from 'lucide-react';

export const ComplaintAnalysis: React.FC = () => {
  const { complaintHistory, addComplaint, addNotification, addAuditLog } = useAppContext();

  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Whitefield');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ComplaintAnalysisResult | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wardComplaintCount = complaintHistory.filter((c: ComplaintAnalysisType) => c.location === location).length;

  const showLocalToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sample presets for demo
  const presets = [
    {
      name: 'Pothole cluster',
      url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=300&h=200&fit=crop',
      desc: 'Severe pothole cluster blocking lane center.',
      loc: 'Whitefield'
    },
    {
      name: 'Water overflow',
      url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=300&h=200&fit=crop',
      desc: 'Stormwater overflow spilling onto main sidewalk.',
      loc: 'RR Nagar'
    },
    {
      name: 'Garbage dump',
      url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=300&h=200&fit=crop',
      desc: 'Commercial garbage pile illegally dumped in residential lane.',
      loc: 'Koramangala'
    }
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    setSelectedImage(p.url);
    setDescription(p.desc);
    setLocation(p.loc);
    setResult(null);
    setTicketId(null);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setResult(null);
      setTicketId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setResult(null);
    setTicketId(null);
    setError(null);
    try {
      const res = await analyzeComplaintImage(selectedImage, description, location);
      const newTicketId = `CP-${Math.floor(5000 + Math.random() * 4999)}`;
      setResult(res);
      setTicketId(newTicketId);
      // Persist to AppContext
      addComplaint({
        id: newTicketId,
        imageUrl: selectedImage || '',
        category: res.category,
        severity: res.severity,
        priority: res.priority,
        department: res.department,
        confidence: res.confidence,
        estimatedResolutionTime: res.responseTime,
        recommendation: res.recommendation,
        timestamp: new Date().toISOString(),
        location: location,
      });
      addNotification({ message: `Complaint ${newTicketId} filed — ${res.category} in ${location}` });
      // Add audit log entry
      addAuditLog({
        action: `Filed complaint ${newTicketId}`,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleEscalate = () => {
    if (!ticketId || !result) return;
    addNotification({ message: `Complaint ${ticketId} escalated to P1 – Immediate` });
  };

  const handleAuthorize = () => {
    if (!ticketId || !result) return;
    addNotification({ message: `Task routed to ${result.department} for ${ticketId}` });
  };

  const getPriorityBadgeClass = (prio: string) => {
    if (prio.includes('P1')) return 'bg-red-500/10 border-red-500/30 text-red-500';
    if (prio.includes('P2')) return 'bg-orange-500/10 border-orange-500/30 text-orange-500';
    return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">📷 AI Complaint Analysis</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload citizen reports and let Gemini Vision automatically categorize, prioritize, and route the incident.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Upload Workspace */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-premium flex flex-col justify-between">
          <div className="space-y-5">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">INCIDENT INGESTION</span>
            
            {/* File Upload Zone */}
            <div
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden min-h-[220px] cursor-pointer hover:border-blue-500/50 transition-colors"
              onClick={() => !selectedImage && fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => {
                  setSelectedImage(reader.result as string);
                  setResult(null);
                  setTicketId(null);
                };
                reader.readAsDataURL(file);
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedImage ? (
                <div className="relative w-full h-full max-h-[200px] rounded-xl overflow-hidden">
                  <img src={selectedImage} alt="Complaint preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={e => { e.stopPropagation(); setSelectedImage(null); setResult(null); setTicketId(null); }}
                    className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-lg p-1.5 text-xs font-bold hover:bg-slate-900 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear Photo
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Drag & Drop or Click to Upload</h4>
                  <p className="text-[11px] text-slate-450 dark:text-slate-505">PNG, JPG or WEBP format up to 5MB</p>
                  <button 
                    onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors mt-2"
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>

            {/* Presets Row */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Quick Test Presets</span>
              <div className="grid grid-cols-3 gap-3">
                {presets.map(p => (
                  <button
                    key={p.name}
                    onClick={() => handleSelectPreset(p)}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-left transition-all"
                  >
                    <img src={p.url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-none">{p.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">{p.loc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Description Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Ward Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <select
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  >
                    <option value="Whitefield">Whitefield</option>
                    <option value="RR Nagar">RR Nagar</option>
                    <option value="Koramangala">Koramangala</option>
                    <option value="Malleshwaram">Malleshwaram</option>
                    <option value="Jayanagar">Jayanagar</option>
                    <option value="Electronic City">Electronic City</option>
                    <option value="Rajajinagar">Rajajinagar</option>
                    <option value="Yeshwanthpur">Yeshwanthpur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description details</label>
                <input
                  type="text"
                  placeholder="Describe the issue..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing || !description.trim()}
            className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-450 dark:disabled:text-slate-650 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <><BrainCircuit className="w-4 h-4 animate-pulse" /> Scanning via Vertex AI Gemini Vision...</>
            ) : (
              <><Camera className="w-4 h-4" /> Run AI Image Classification</>
            )}
          </button>
        </div>

        {/* Right Column: Output Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-premium flex flex-col justify-between">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4 text-red-600">
              {error}
            </div>
          )}
          {result ? (
            <div className="space-y-5">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">VERTEX CLASSIFICATION</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white block">{wardComplaintCount} open issues in {location}</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{result.category} Detected</h3>
                  {ticketId && (
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">Ticket: {ticketId}</span>
                  )}
                </div>
                <div className="px-2 py-0.5 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded text-[10px] font-mono">
                  {Math.round(result.confidence * 100)}% Conf.
                </div>
              </div>

              {/* Status metrics grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <span className="block text-[10px] text-slate-400 uppercase">Priority Rating</span>
                  <span className={`px-2 py-0.5 inline-block rounded text-[10px] font-bold mt-1.5 border ${getPriorityBadgeClass(result.priority)}`}>
                    {result.priority.split(' - ')[0]}
                  </span>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <span className="block text-[10px] text-slate-400 uppercase">Severity Level</span>
                  <span className={`text-sm font-bold block mt-1.5 ${result.severity === 'Critical' ? 'text-red-500' : result.severity === 'High' ? 'text-orange-500' : 'text-amber-500'}`}>
                    {result.severity}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <span className="block text-[10px] text-slate-400 uppercase">Responsible Unit</span>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1 block leading-tight">
                    {result.department}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <span className="block text-[10px] text-slate-400 uppercase">SLA Target Time</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {result.responseTime}
                  </span>
                </div>
              </div>

              {/* Suggestion */}
              <div className="p-3.5 bg-blue-500/10 border border-blue-500/25 rounded-xl">
                <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4" /> AI Operations Roadmap
                </h4>
                <p className="text-xs text-slate-650 dark:text-slate-300 mt-1 leading-relaxed">
                  {result.recommendation}
                </p>
              </div>

              {/* Reasoning */}
              <div className="space-y-2">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono block">Vision Analysis Reasoning</span>
                <ul className="space-y-1.5">
                  {result.reasoning.map((reason, i) => (
                    <li key={i} className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <Camera className="w-12 h-12 text-slate-350 dark:text-slate-700 animate-pulse mb-3" />
              <h4 className="font-bold text-xs text-slate-750 dark:text-slate-400">Gemini Vision Output</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 max-w-[200px]">
                Choose an image preset or upload a file, add the ward location & description, and click "Run AI Image Classification".
              </p>
            </div>
          )}

          {result && (
            <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4 flex gap-2">
              <button
                onClick={handleEscalate}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-850 rounded-xl text-xs font-bold text-slate-200 transition-colors"
              >
                Escalate Incident
              </button>
              <button
                onClick={handleAuthorize}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-colors flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Authorize Route Task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
