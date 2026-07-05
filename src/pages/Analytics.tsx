// src/pages/Analytics.tsx
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { ComplaintAnalysis as ComplaintAnalysisType } from '../context/AppContext';
import { bangaloreWards } from '../services/bigqueryService';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Filter, Database, Search, Download, ArrowUpDown, ArrowDownUp, ArrowUpDown as SortIcon,
  AlertCircle, CheckCircle, Clock,
} from 'lucide-react';

// Mock complaints database (replace with real API when available)


// Helper to download CSV
const downloadCSV = (data: any[], filename = 'analytics.csv') => {
  const header = Object.keys(data[0] ?? {});
  const rows = data.map((row) => header.map((h) => `"${row[h]}"`).join(','));
  const csvContent = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper to download simple HTML report
const downloadHTML = (data: any[], filename = 'analytics_report.html') => {
  const rows = data
    .map(
      (row) =>
        `<tr>${Object.values(row)
          .map((v) => `<td>${v}</td>`)
          .join('')}</tr>`
    )
    .join('');
  const html = `<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Analytics Report</title></head><body><h2>Analytics Report</h2><table border=\"1\" cellpadding=\"5\">${rows}</table></body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const Analytics: React.FC = () => {
  const { analyticsFilters, updateAnalyticsFilters, selectedWard, complaintHistory, notifications, auditLogs, predictionState } = useAppContext();
  console.log('Analytics debug - complaintHistory length:', complaintHistory.length);
  console.log('Analytics debug - filteredComplaints will be computed later');
  // Debug logs for verification
  console.log('Analytics debug - complaintHistory length:', complaintHistory.length);
  console.log('Analytics debug - notifications length:', notifications?.length);
  console.log('Analytics debug - auditLogs length:', auditLogs?.length);
  console.log('Analytics debug - predictionState keys:', Object.keys(predictionState));
  console.log('Analytics debug - analyticsFilters:', analyticsFilters);

  useEffect(() => {
    if (selectedWard && (analyticsFilters.ward === undefined || analyticsFilters.ward === 'All')) {
      updateAnalyticsFilters({ ward: selectedWard.name });
    }
  }, [selectedWard]);

  // Local UI state for pagination & sorting (does not need to be persisted)
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [sortKey, setSortKey] = useState<'date' | 'priority'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Date range filters (optional)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sync UI filters with context
  const handleFilterChange = (field: string, value: string) => {
    updateAnalyticsFilters({ ...analyticsFilters, [field]: value });
    setPage(1);
  };

  // Filtered & sorted data
  const filteredComplaints = complaintHistory
    .filter((c: ComplaintAnalysisType) => {
      const wardMatch = analyticsFilters.ward === undefined || analyticsFilters.ward === 'All' || (c.location && c.location.includes(analyticsFilters.ward));
      const prioMatch = analyticsFilters.priority === undefined || analyticsFilters.priority === 'All' || c.priority.includes(analyticsFilters.priority);
      const catMatch = analyticsFilters.category === undefined || analyticsFilters.category === 'All' || c.category === analyticsFilters.category;
      const searchMatch =
        (analyticsFilters.search ?? '').trim() === '' ||
        c.id.toLowerCase().includes((analyticsFilters.search ?? '').toLowerCase()) ||
        (c.location ?? '').toLowerCase().includes((analyticsFilters.search ?? '').toLowerCase()) ||
        c.category.toLowerCase().includes((analyticsFilters.search ?? '').toLowerCase());
      const dateMatch =
        (!startDate || new Date(c.timestamp) >= new Date(startDate)) && (!endDate || new Date(c.timestamp) <= new Date(endDate));
      return wardMatch && prioMatch && catMatch && searchMatch && dateMatch;
    })
    .sort((a: ComplaintAnalysisType, b: ComplaintAnalysisType) => {
      if (sortKey === 'date') {
        const diff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        return sortAsc ? -diff : diff;
      }
      const prioA = parseInt(a.priority.split(' ')[0].replace('P', ''), 10);
      const prioB = parseInt(b.priority.split(' ')[0].replace('P', ''), 10);
      return sortAsc ? prioA - prioB : prioB - prioA;
    });

  const pageCount = Math.ceil(filteredComplaints.length / pageSize);
  const pagedComplaints = filteredComplaints.slice((page - 1) * pageSize, page * pageSize);

// KPI calculations
const totalIncidents = filteredComplaints.length;
const highPriority = filteredComplaints.filter((c: ComplaintAnalysisType) => c.priority.startsWith('P1')).length;
// Derive resolved count from audit logs where action indicates resolution
const resolved = auditLogs.filter((log) => /resolve/i.test(log.action)).length;
const pending = totalIncidents - resolved;
const communityHealth = totalIncidents ? Math.round((resolved / totalIncidents) * 100) : 0;

  // Chart data (simple derived from filtered complaints)
  // Pie chart showing severity distribution as a proxy for resolution status
  const severityCounts: Record<string, number> = {};
  filteredComplaints.forEach((c: ComplaintAnalysisType) => {
    severityCounts[c.severity] = (severityCounts[c.severity] || 0) + 1;
  });
  const resolutionData = Object.entries(severityCounts).map(([name, value]) => ({ name, value, color: name === 'Critical' ? '#EF4444' : name === 'High' ? '#F97316' : name === 'Medium' ? '#F59E0B' : '#22C55E' }));

  const categoryCounts: Record<string, number> = {};
  filteredComplaints.forEach((c: ComplaintAnalysisType) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

  // Historical data remains static for demo purposes
  // Generate complaints per day data for line chart
  const complaintsByDayMap: Record<string, number> = {};
  complaintHistory.forEach((c: ComplaintAnalysisType) => {
    const date = new Date(c.timestamp).toISOString().split('T')[0];
    complaintsByDayMap[date] = (complaintsByDayMap[date] || 0) + 1;
  });
  const complaintsByDay = Object.entries(complaintsByDayMap)
    .map(([date, count]) => ({ date, complaintsFiled: count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const historicalData = complaintsByDay;

  // Sorting UI handler
  const toggleSort = (key: 'date' | 'priority') => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  // Export handlers
  const handleExportCSV = () => downloadCSV(filteredComplaints);
  const handleExportHTML = () => downloadHTML(filteredComplaints);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">📊 Analytics Desk</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Looker Studio inspired metrics engine. Run BigQuery analytics on ward incident logs.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={handleExportHTML} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-500 transition">
            <Download className="w-4 h-4" /> Export HTML
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-premium space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-blue-500" /> Operational Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Ward */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-450 dark:text-slate-500 uppercase mb-1">Ward Sector</label>
            <select
              value={analyticsFilters.ward ?? 'All'}
              onChange={(e) => handleFilterChange('ward', e.target.value)}
              className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="All">All Wards</option>
              {bangaloreWards.map((w) => (
                <option key={w.name} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>
          {/* Priority */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-450 dark:text-slate-500 uppercase mb-1">Priority</label>
            <select
              value={analyticsFilters.priority ?? 'All'}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="All">All Priorities</option>
              <option value="P1">P1 - Immediate</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Routine</option>
              <option value="P4">P4 - Scheduled</option>
            </select>
          </div>
          {/* Category */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-450 dark:text-slate-500 uppercase mb-1">Incident Category</label>
            <select
              value={analyticsFilters.category ?? 'All'}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="All">All Categories</option>
              <option value="Pothole">Pothole</option>
              <option value="Garbage">Garbage</option>
              <option value="Flood">Flood</option>
              <option value="Broken Streetlight">Broken Streetlight</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Water Leakage">Water Leakage</option>
            </select>
          </div>
          {/* Search */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-450 dark:text-slate-500 uppercase mb-1">Search ID or keyword</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={analyticsFilters.search ?? ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          {/* Date Range */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-450 dark:text-slate-500 uppercase mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-800 dark:text-slate-200" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-450 dark:text-slate-500 uppercase mb-1">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-800 dark:text-slate-200" />
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded shadow-premium">
          <h4 className="text-sm font-medium text-slate-500">Total Incidents</h4>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalIncidents}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded shadow-premium">
          <h4 className="text-sm font-medium text-slate-500">High Priority</h4>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{highPriority}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded shadow-premium">
          <h4 className="text-sm font-medium text-slate-500">Resolved</h4>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{resolved}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded shadow-premium">
          <h4 className="text-sm font-medium text-slate-500">Pending</h4>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{pending}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded shadow-premium">
          <h4 className="text-sm font-medium text-slate-500">Community Health</h4>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{communityHealth}%</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-premium">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Resolution Status Breakdown</h3>
          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resolutionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={800}
                >
                  {resolutionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-premium">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Top Incident Frequency Categories</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} isAnimationActive={true} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Line Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-premium">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Historical Incident Flow Rate</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="complaintsFiled" stroke="#EF4444" strokeWidth={2} dot={false} name="Filed" isAnimationActive={true} animationDuration={800} />
                <Line type="monotone" dataKey="complaintsResolved" stroke="#22C55E" strokeWidth={2} dot={false} name="Resolved" isAnimationActive={true} animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table with Sorting & Pagination */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" /> Smart City Incident Database Logs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">BigQuery synchronized logs matching criteria below.</p>
          </div>
          <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400">
            {filteredComplaints.length} Records Found
          </span>
        </div>
        {/* Sort Controls */}
        <div className="px-5 py-2 flex gap-4 items-center text-sm text-slate-600 dark:text-slate-300">
          <span>Sort by:</span>
          <button onClick={() => toggleSort('date')} className="flex items-center gap-1">
            Date {sortKey === 'date' && (sortAsc ? <ArrowUpDown className="w-3 h-3" /> : <ArrowDownUp className="w-3 h-3" />)}
          </button>
          <button onClick={() => toggleSort('priority')} className="flex items-center gap-1">
            Priority {sortKey === 'priority' && (sortAsc ? <ArrowUpDown className="w-3 h-3" /> : <ArrowDownUp className="w-3 h-3" />)}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase bg-slate-50 dark:bg-slate-950">
                <th className="p-4 cursor-pointer" onClick={() => toggleSort('date')}>Complaint ID</th>
                <th className="p-4">Ward Sector</th>
                <th className="p-4">Category</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Priority Level</th>
                <th className="p-4">Status</th>
                <th className="p-4">File Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-350">
              {pagedComplaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-500 dark:text-blue-400">{c.id}</td>
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{c.location}</td>
                  <td className="p-4">{c.category}</td>
                  <td className="p-4">
                    <span className={`font-semibold ${c.severity === 'Critical' ? 'text-red-500' : c.severity === 'High' ? 'text-orange-500' : 'text-amber-500'}`}>{c.severity}</span>
                  </td>
                  <td className="p-4 font-mono">{c.priority.split(' - ')[0]}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 bg-blue-500/10 text-blue-500 border border-blue-500/25`}>Pending</span>
                  </td>
                  <td className="p-4 font-mono text-[10px]">{new Date(c.timestamp).toISOString().split('T')[0]}</td>
                </tr>
              ))}
              {pagedComplaints.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No matching records found. Refine your Looker Studio filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-between items-center p-4">
          <span className="text-sm text-slate-600 dark:text-slate-300">Page {page} of {pageCount}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded disabled:opacity-50">Prev</button>
            <button disabled={page >= pageCount} onClick={() => setPage(page + 1)} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
