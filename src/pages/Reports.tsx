import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTranslation, TranslationKey } from '../utils/translations';
import { 
  FileText, Calendar, Sparkles, Download, Mail, 
  Share2, Play, CheckCircle, BrainCircuit, ShieldAlert 
} from 'lucide-react';

// Helpers
const exportReportHTML = (report: any) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${report.title}</title>
<style>body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#1e293b}h1{color:#1d4ed8}table{border-collapse:collapse;width:100%}td,th{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}th{background:#f1f5f9}</style></head>
<body>
<h1>${report.title}</h1>
<p><strong>Date Range:</strong> ${report.dateRange}</p>
<p><strong>Author:</strong> ${report.author}</p>
<h2>Executive Summary</h2><p>${report.summary}</p>
<h2>Key Metrics</h2>
<table><tr><th>Metric</th><th>Value</th></tr>
${report.metrics.map((m: any) => `<tr><td>${m.name}</td><td>${m.value}</td></tr>`).join('')}
</table>
<h2>AI Recommendations</h2>
<ol>${report.recommendations.map((r: string) => `<li>${r}</li>`).join('')}</ol>
</body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `civicpilot_report_${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const exportReportCSV = (report: any) => {
  const rows = [
    ['Title', report.title],
    ['Date Range', report.dateRange],
    ['Author', report.author],
    ['Summary', report.summary],
    [],
    ['Metric', 'Value'],
    ...report.metrics.map((m: any) => [m.name, m.value]),
    [],
    ['Recommendations'],
    ...report.recommendations.map((r: string) => [r]),
  ];
  const csv = rows.map(r => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `civicpilot_report_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const Reports: React.FC = () => {
  const { addNotification, language } = useAppContext();
  const location = useLocation();
  const { t } = useTranslation(language);

  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'emergency'>('weekly');
  const [compiling, setCompiling] = useState(false);
  const [compiledReport, setCompiledReport] = useState<any | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Auto compile on navigation state
  useEffect(() => {
    if (location.state && (location.state as any).compile) {
      const type = (location.state as any).type || 'weekly';
      setReportType(type);
      setCompiling(true);
      
      // Simulate BigQuery scan + Gemini summarization latency
      setTimeout(() => {
        setCompiling(false);
        if (type === 'emergency') {
          setCompiledReport({
            title: 'Emergency Critical Incident Action Report',
            dateRange: '05 Jul 2026 (Live Bulletin)',
            author: 'CivicPilot One (Google Gemini Agent)',
            summary: 'CRITICAL WARNING: Heavy rainfall precipitation model flags severe flood vulnerability near RR Nagar storm drains. Water telemetry sensors show Dinasour Canal pressure peaking at 84% capacity. Immediate intervention is required to avoid basement water logging.',
            metrics: [
              { name: 'Precipitation Rainfall Anomaly', value: '+18% above average' },
              { name: 'Drainage Flow Rate Capacity', value: '84% (Critical Overload)' },
              { name: 'Affected Residents Estimate', value: '1,200 households' }
            ],
            recommendations: [
              'Dispatch 3 municipal sewer pumps to RR Nagar Low-Sectors 4 and 5 immediately.',
              'Route emergency notification warnings to Jayanagar disaster management teams.',
              'Reroute traffic flow away from double road low-points.'
            ]
          });
        }
      }, 1000);
    }
  }, [location.state]);

  const handleCompile = () => {
    setCompiling(true);
    setCompiledReport(null);
    
    // Simulate BigQuery scan + Gemini summarization latency
    setTimeout(() => {
      setCompiling(false);
      
      if (reportType === 'weekly') {
        setCompiledReport({
          title: 'Weekly Smart City Operations Report',
          dateRange: '28 Jun 2026 - 04 Jul 2026',
          author: 'CivicPilot One (Google Gemini Agent)',
          summary: 'Overall city operations remained stable this week, with a mean Community Health Score of 91. Whitefield experienced temporary infrastructure strain due to localized pipe bursts and stormwater drain overflows on Dr. Rajkumar Road. Traffic speeds fell during peak hours but resolved within typical margins.',
          metrics: [
            { name: 'Average Traffic Congestion Index', value: '71% (Within Limits)' },
            { name: 'Solid Waste Collection Rate', value: '88% (Target Met)' },
            { name: 'Water Pipe Pressure Integrity', value: '84% (Stable)' }
          ],
          recommendations: [
            'Upgrade stormwater drain culverts in RR Nagar Sector 4 to prevent future monsoon logging.',
            'Deploy smart waste compactors in Koramangala commercial blocks to optimize collection logistics.',
            'Increase road repair budget parameters in BigQuery schema for Rajajinagar patching.'
          ]
        });
      } else if (reportType === 'monthly') {
        setCompiledReport({
          title: 'Monthly Urban Infrastructure Strategic Report',
          dateRange: '01 Jun 2026 - 30 Jun 2026',
          author: 'CivicPilot One (Google Gemini Agent)',
          summary: 'Jun 2026 data shows consistent progress in municipal operations, with citizen complaint resolution rates rising by 8.4% city-wide. Electronic City grid capacity experienced seasonal thermal strain, requiring temporary power scheduling. Air Quality index remained moderate, dropping only on rainy weekends.',
          metrics: [
            { name: 'Monthly Resolved Complaints count', value: '542 Complaints (SLA: 96%)' },
            { name: 'Power Grid Load Peak Capacity', value: 'Strain (SLA: 99.8%)' },
            { name: 'Air Quality Average Index', value: '108 AQI (Moderate)' }
          ],
          recommendations: [
            'Approve budget allocation for substation expansion in Electronic City Phase 1.',
            'Authorize BBMP solid waste logistics route optimization model for central areas.',
            'Deploy municipal tree trimming crew preventive patrols ahead of monsoon peaks.'
          ]
        });
      } else {
        setCompiledReport({
          title: 'Emergency Critical Incident Action Report',
          dateRange: '04 Jul 2026 (Live Bulletin)',
          author: 'CivicPilot One (Google Gemini Agent)',
          summary: 'CRITICAL WARNING: Heavy rainfall precipitation model flags severe flood vulnerability near RR Nagar storm drains. Water telemetry sensors show Dinasour Canal pressure peaking at 84% capacity. Immediate intervention is required to avoid basement water logging.',
          metrics: [
            { name: 'Precipitation Rainfall Anomaly', value: '+18% above average' },
            { name: 'Drainage Flow Rate Capacity', value: '84% (Critical Overload)' },
            { name: 'Affected Residents Estimate', value: '1,200 households' }
          ],
          recommendations: [
            'Dispatch 3 municipal sewer pumps to RR Nagar Low-Sectors 4 and 5 immediately.',
            'Route emergency notification warnings to Jayanagar disaster management teams.',
            'Reroute traffic flow away from double road low-points.'
          ]
        });
      }
    }, 1500);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSent(true);
    setTimeout(() => {
      setShowEmailModal(false);
      setEmailSent(false);
      setEmailInput('');
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">📄 AI Executive Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Compile high-fidelity reports detailing city operations, forecasting indices, and emergency roadmaps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Compiler Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-premium h-fit">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">COMPILER SETUP</span>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Select Report Type</label>
              <div className="space-y-2">
                <button
                  onClick={() => setReportType('weekly')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    reportType === 'weekly' 
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-500 dark:text-blue-400'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <div>
                      <span className="block text-xs font-bold">Weekly Performance</span>
                      <span className="block text-[10px] text-slate-450 mt-0.5">SWM, Traffic, and Water summary</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setReportType('monthly')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    reportType === 'monthly' 
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-500 dark:text-blue-400'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <span className="block text-xs font-bold">Monthly Strategic Summary</span>
                      <span className="block text-[10px] text-slate-450 mt-0.5">Long-term KPIs and analytics</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setReportType('emergency')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    reportType === 'emergency' 
                      ? 'bg-red-500/10 border-red-500/30 text-red-500'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    <div>
                      <span className="block text-xs font-bold">Emergency Action Bulletin</span>
                      <span className="block text-[10px] text-slate-450 mt-0.5">Localized flood and hazard roadmap</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={handleCompile}
              disabled={compiling}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white disabled:text-slate-450 dark:disabled:text-slate-650 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              {compiling ? (
                <>
                  <BrainCircuit className="w-4 h-4 animate-spin" /> Fetching BigQuery warehouse tables...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Compile AI Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Columns: Compiled Report Display */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-premium min-h-[400px] flex flex-col justify-between">
          {compiledReport ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{compiledReport.title}</h2>
                  <div className="flex items-center gap-3 text-[10px] text-slate-450 mt-1 font-mono">
                    <span>RANGE: {compiledReport.dateRange}</span>
                    <span>&bull;</span>
                    <span>AUTHOR: {compiledReport.author}</span>
                  </div>
                </div>
                
                <span className="px-2.5 py-1 bg-green-500/10 text-green-500 dark:text-green-400 rounded-lg text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Compiled
                </span>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Executive AI Summary
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                  {compiledReport.summary}
                </p>
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono block">Scanned Database Indicators</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {compiledReport.metrics.map((m: any, i: number) => (
                    <div key={i} className="bg-slate-55 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="block text-[9px] text-slate-400 leading-tight uppercase">{m.name}</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 block">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono block">Action Recommendations</span>
                <ul className="space-y-2">
                  {compiledReport.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-100 dark:border-slate-850 rounded-lg flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">{i+1}</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Export Buttons */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-wrap gap-2">
                <button 
                  onClick={() => exportReportHTML(compiledReport)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-850 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download HTML
                </button>
                
                <button 
                  onClick={() => exportReportCSV(compiledReport)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-850 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                
                <button 
                  onClick={() => setShowEmailModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-850 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-4 h-4" /> Email Report
                </button>

                <button 
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/app/reports`;
                    navigator.clipboard.writeText(shareUrl);
                    addNotification({ message: 'Report link copied to clipboard.' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-850 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" /> Share link
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4 animate-pulse" />
              <h3 className="font-bold text-slate-700 dark:text-slate-400 text-lg">No compiled report</h3>
              <p className="text-sm text-slate-450 dark:text-slate-500 mt-1.5 max-w-[280px]">
                Choose your report template on the left, compile the data layers, and export PDF/CSV files.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl text-slate-900 dark:text-white">
            <h3 className="font-bold text-base">Email Compiled Report</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Send the compiled AI executive report directly to administration units.</p>

            <form onSubmit={handleSendEmail} className="space-y-4 mt-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Destination Address</label>
                <input
                  type="email"
                  required
                  placeholder="deputy.commissioner@bangalore.in"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailSent}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {emailSent ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
