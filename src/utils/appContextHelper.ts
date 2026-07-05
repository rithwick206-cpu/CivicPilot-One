// src/utils/appContextHelper.ts

/**
 * Helper utilities to collect live application data from persisted AppContext storage.
 * This file reads directly from localStorage to avoid React hook usage inside non‑React modules.
 */

import { WardData } from '../services/bigqueryService';
import { ComplaintAnalysis } from '../context/AppContext';
import { PredictionData } from '../context/AppContext';
import { Notification } from '../context/AppContext';
import { AuditLog } from '../context/AppContext';

export interface LiveData {
  // Core identifier
  selectedWard: WardData | null;

  // Dashboard snapshot
  dashboard: {
    communityHealthScore: number | null;
    riskScore: number | null;
    incidentCount: number;
    activeComplaints: number;
    resolvedComplaints: number;
    selectedWardKPIs: Record<string, unknown>;
  };

  // Complaint analysis snapshot
  complaintAnalysis: {
    history: ComplaintAnalysis[]; // latest 20
    categoryCounts: Record<string, number>;
    severityCounts: Record<string, number>;
    departmentCounts: Record<string, number>;
    latestComplaints: ComplaintAnalysis[]; // same as history
  };

  // Prediction center snapshot
  predictionCenter: {
    flood: PredictionData | null;
    traffic: PredictionData | null;
    waste: PredictionData | null;
    power: PredictionData | null;
    confidenceValues: Record<string, number>;
    recommendations: Record<string, string>;
  };

  // Decision center snapshot
  decisionCenter: {
    pumpsDeployed: boolean;
    cleaningCrewsActive: boolean;
    trafficReroutingActive: boolean;
    activeSimulations: number;
    resourceStatus: Record<string, unknown>;
  };

  // Analytics snapshot
  analytics: {
    totalComplaints: number;
    topCategories: string[]; // top 5
    topWards: string[]; // top 5
    trendSummary: string;
    searchFilterSummary: string;
  };

  // Notifications snapshot
  notifications: {
    unreadCount: number;
    latest: Notification[]; // latest 10
  };

  // Audit logs snapshot
  auditLogs: {
    latestActions: AuditLog[]; // latest 20
    dispatchHistory: AuditLog[];
    userActions: AuditLog[];
  };

  // Reports snapshot
  reports: {
    lastGeneratedReport: string | null;
    executiveSummary: string | null;
    currentReportStats: Record<string, unknown>;
  };
}


/**
 * Safely parse a JSON value from localStorage; returns undefined on error.
 */
function safeParse<T>(key: string): T | undefined {
  const raw = localStorage.getItem(key);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`Failed to parse ${key} from localStorage`, e);
    return undefined;
  }
}

export function collectLiveData(): LiveData {
  // --- Core slices -------------------------------------------------------
  const selectedWard = safeParse<WardData>('civicpilot_selectedWard') || null;
  const rawComplaints = safeParse<ComplaintAnalysis[]>('civicpilot_complaintHistory') || [];
  const rawPrediction = safeParse<Record<string, PredictionData>>('civicpilot_predictionState') || {};
  const rawNotifications = safeParse<Notification[]>('civicpilot_notifications') || [];
  const rawAudit = safeParse<AuditLog[]>('civicpilot_auditLogs') || [];

  // --- Dashboard --------------------------------------------------------
  const incidentCount = rawComplaints.filter(c => c.severity === 'Critical' || c.severity === 'High').length;
  // All complaints are considered active; no explicit resolved status exists
  const activeComplaints = rawComplaints.length;

  const resolvedComplaints = 0; // No resolved status field available
  const riskScore = incidentCount > 0 ? Math.min(100, Math.round((incidentCount / rawComplaints.length) * 100)) : 0;
  const selectedWardKPIs = safeParse<Record<string, unknown>>('civicpilot_selectedWardKPIs') || {};
  const communityHealthScore = (() => {
    const highSeverity = rawComplaints.filter(c => c.severity === 'Critical' || c.severity === 'High').length;
    return Math.max(0, 100 - highSeverity * 5);
  })();

  const dashboard = {
    communityHealthScore,
    riskScore,
    incidentCount,
    activeComplaints,
    resolvedComplaints,
    selectedWardKPIs,
  };

  // --- Complaint analysis ------------------------------------------------
  const sortedComplaints = [...rawComplaints].sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
  const history = sortedComplaints.slice(0, 20);
  const categoryCounts: Record<string, number> = {};
  const severityCounts: Record<string, number> = {};
  const departmentCounts: Record<string, number> = {};
  history.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    severityCounts[c.severity] = (severityCounts[c.severity] || 0) + 1;
    departmentCounts[c.department] = (departmentCounts[c.department] || 0) + 1;
  });
  const complaintAnalysis = {
    history,
    categoryCounts,
    severityCounts,
    departmentCounts,
    latestComplaints: history,
  };

  // --- Prediction center -------------------------------------------------
  const predictionCenter = {
    flood: rawPrediction['flood'] || null,
    traffic: rawPrediction['traffic'] || null,
    waste: rawPrediction['waste'] || null,
    power: rawPrediction['power'] || null,
    confidenceValues: safeParse<Record<string, number>>('civicpilot_predictionConfidence') || {},
    recommendations: safeParse<Record<string, string>>('civicpilot_predictionRecommendations') || {},
  };

  // --- Decision center --------------------------------------------------
  const decisionCenter = {
    pumpsDeployed: safeParse<boolean>('civicpilot_pumpsDeployed') ?? false,
    cleaningCrewsActive: safeParse<boolean>('civicpilot_cleaningActive') ?? false,
    trafficReroutingActive: safeParse<boolean>('civicpilot_reroutingActive') ?? false,
    activeSimulations: safeParse<number>('civicpilot_activeSimulations') ?? 0,
    resourceStatus: safeParse<Record<string, unknown>>('civicpilot_resourceStatus') || {},
  };

  // --- Analytics --------------------------------------------------------
  const totalComplaints = rawComplaints.length;
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(v => v[0]);
  const topWards = safeParse<string[]>('civicpilot_topWards') || [];
  const trendSummary = safeParse<string>('civicpilot_trendSummary') || 'No trend data available.';
  const searchFilterSummary = safeParse<string>('civicpilot_searchFilterSummary') || 'No filter summary available.';
  const analytics = {
    totalComplaints,
    topCategories,
    topWards,
    trendSummary,
    searchFilterSummary,
  };

  // --- Notifications -----------------------------------------------------
  const unreadCount = rawNotifications.filter(n => !n.read).length;
  const notifications = {
    unreadCount,
    latest: rawNotifications.slice(-10).reverse(),
  };

  // --- Audit logs --------------------------------------------------------
  const sortedAudit = [...rawAudit].sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
  const latestActions = sortedAudit.slice(0, 20);
  const dispatchHistory = latestActions.filter(a => a.action === 'dispatch');
  const userActions = latestActions.filter(a => a.action === 'user');
  const auditLogs = {
    latestActions,
    dispatchHistory,
    userActions,
  };

  // --- Reports -----------------------------------------------------------
  const reports = {
    lastGeneratedReport: safeParse<string>('civicpilot_lastReport') || null,
    executiveSummary: safeParse<string>('civicpilot_executiveSummary') || null,
    currentReportStats: safeParse<Record<string, unknown>>('civicpilot_reportStats') || {},
  };

  // Return the full structured snapshot
  return {
    selectedWard,
    dashboard,
    complaintAnalysis,
    predictionCenter,
    decisionCenter,
    analytics,
    notifications,
    auditLogs,
    reports,
  };
}
