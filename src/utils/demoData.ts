// src/utils/demoData.ts

import { ComplaintAnalysis, Notification, AuditLog, PredictionData } from '../context/AppContext';
import { bangaloreWards } from '../services/bigqueryService';

// Utility: pick a random element from an array
const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generate a random ISO timestamp within the last 30 days
const randomTimestamp = (): string => {
  const now = Date.now();
  const past = now - 30 * 24 * 60 * 60 * 1000; // 30 days ago
  return new Date(past + Math.random() * (now - past)).toISOString();
};

/** ------------------------------------------------------------
 *  Complaints – 30 entries across multiple wards & categories
 * ------------------------------------------------------------ */
export const generateComplaints = (): ComplaintAnalysis[] => {
  const categories = ['Flood', 'Garbage', 'Traffic', 'Power'];
  const severities = ['Critical', 'High', 'Medium', 'Low'];
  const priorities = ['P1 - Immediate', 'P2 - High Priority', 'P3 - Routine', 'P4 - Scheduled'];
  const deptMap: Record<string, string> = {
    Flood: 'BWSSB & Stormwater Drains Division',
    Garbage: 'BBMP Solid Waste Management (SWM)',
    Traffic: 'BBMP Engineering & Roads Division',
    Power: 'BESCOM Streetlights Division',
  };

  const complaints: ComplaintAnalysis[] = [];
  for (let i = 0; i < 30; i++) {
    const category = randomPick(categories);
    const severity = randomPick(severities);
    const priority = randomPick(priorities);
    const ward = randomPick(bangaloreWards);
    complaints.push({
      id: `c-${i}-${Date.now()}`,
      imageUrl: '', // placeholder – UI can show a default icon
      category,
      severity,
      priority,
      department: deptMap[category],
      confidence: Number((0.8 + Math.random() * 0.2).toFixed(2)),
      estimatedResolutionTime: `${Math.ceil(Math.random() * 48)} Hours`,
      recommendation: `Deploy appropriate response for ${category.toLowerCase()} in ${ward.name}.`,
      timestamp: randomTimestamp(),
      location: `${ward.name} – Zone ${Math.ceil(Math.random() * 5)}`,
    });
  }
  return complaints;
};

/** ------------------------------------------------------------
 *  Notifications – latest 10 entries
 * ------------------------------------------------------------ */
export const generateNotifications = (): Notification[] => {
  const messages = [
    'New flood alert in Whitefield.',
    'Garbage collection schedule updated.',
    'Traffic congestion reported on MG Road.',
    'Power outage resolved in Koramangala.',
    'Community health score improved.',
    'Emergency crew dispatched.',
    'Prediction model refreshed.',
    'Audit log entry created.',
    'Report generated successfully.',
    'System maintenance scheduled tomorrow.',
  ];
  return messages.map((msg, idx) => ({
    id: `n-${idx}-${Date.now()}`,
    message: msg,
    read: Math.random() > 0.5,
    timestamp: Date.now() - idx * 60_000,
  }));
};

/** ------------------------------------------------------------
 *  Audit Logs – latest 20 entries
 * ------------------------------------------------------------ */
export const generateAuditLogs = (): AuditLog[] => {
  const actions = ['dispatch', 'user', 'system'];
  const statuses = ['Success', 'Warning', 'Failed'];
  const logs: AuditLog[] = [];
  for (let i = 0; i < 20; i++) {
    logs.push({
      id: `a-${i}-${Date.now()}`,
      action: randomPick(actions),
      timestamp: new Date(Date.now() - i * 120_000).toISOString(),
      status: randomPick(statuses),
    });
  }
  return logs;
};

/** ------------------------------------------------------------
 *  Predictions – one per category
 * ------------------------------------------------------------ */
export const generatePredictions = (): Record<string, PredictionData> => {
  const categories = ['flood', 'traffic', 'waste', 'power'];
  const preds: Record<string, PredictionData> = {};
  categories.forEach((cat) => {
    preds[cat] = {
      category: cat,
      kpis: { riskScore: Math.round(Math.random() * 100) },
      chartData: Array.from({ length: 7 }, () => Math.round(Math.random() * 100)),
      forecast: `Forecast for next week: ${Math.round(Math.random() * 100)}% chance of ${cat}.`,
      riskScore: Math.round(Math.random() * 100),
      confidenceScore: Number((0.75 + Math.random() * 0.25).toFixed(2)),
      recommendation: `Monitor ${cat} levels and prepare response teams.`,
    };
  });
  return preds;
};

/** ------------------------------------------------------------
 *  Dashboard – aggregates derived from the complaints list
 * ------------------------------------------------------------ */
export const generateDashboard = (complaints: ComplaintAnalysis[]) => {
  const incidentCount = complaints.filter(c => c.severity === 'Critical' || c.severity === 'High').length;
  const activeComplaints = complaints.length;
  const resolvedComplaints = 0; // demo does not track resolution yet
  const highSeverity = incidentCount;
  const communityHealthScore = Math.max(0, 100 - highSeverity * 4);
  const riskScore = incidentCount > 0 ? Math.min(100, Math.round((incidentCount / complaints.length) * 100)) : 0;
  return {
    communityHealthScore,
    riskScore,
    incidentCount,
    activeComplaints,
    resolvedComplaints,
    selectedWardKPIs: {},
  };
};

/** ------------------------------------------------------------
 *  Simple report placeholder
 * ------------------------------------------------------------ */
export const generateReport = () => ({
  lastGeneratedReport: new Date().toISOString(),
  executiveSummary: 'Bengaluru Smart City daily executive summary.',
  currentReportStats: { totalComplaints: 30, highRiskAreas: ['Whitefield', 'Electronic City'] },
});

/** ------------------------------------------------------------
 *  Ensure data exists in localStorage – call once on app start
 * ------------------------------------------------------------ */
export const ensureDemoData = () => {
  console.log('ensureDemoData started');
  const existingComplaints = JSON.parse(localStorage.getItem('civicpilot_complaintHistory') || '[]');
  if (existingComplaints.length === 0) {
    const complaints = generateComplaints();
    console.log('ensureDemoData - generated complaintHistory length:', complaints.length);
    localStorage.setItem('civicpilot_complaintHistory', JSON.stringify(complaints));
    const storedComplaints = JSON.parse(localStorage.getItem('civicpilot_complaintHistory') || '[]');
    console.log('ensureDemoData - stored complaintHistory length:', storedComplaints.length);
    // Dashboard snapshot derived from complaints
    const dashboard = generateDashboard(complaints);
    localStorage.setItem('civicpilot_dashboard', JSON.stringify(dashboard));
  }
  const existingNotifications = JSON.parse(localStorage.getItem('civicpilot_notifications') || '[]');
  if (existingNotifications.length === 0) {
    const notifications = generateNotifications();
    console.log('ensureDemoData - generated notifications length:', notifications.length);
    localStorage.setItem('civicpilot_notifications', JSON.stringify(notifications));
    const storedNotifications = JSON.parse(localStorage.getItem('civicpilot_notifications') || '[]');
    console.log('ensureDemoData - stored notifications length:', storedNotifications.length);
  }
  const existingAuditLogs = JSON.parse(localStorage.getItem('civicpilot_auditLogs') || '[]');
  if (existingAuditLogs.length === 0) {
    const auditLogs = generateAuditLogs();
    console.log('ensureDemoData - generated auditLogs length:', auditLogs.length);
    localStorage.setItem('civicpilot_auditLogs', JSON.stringify(auditLogs));
    const storedAuditLogs = JSON.parse(localStorage.getItem('civicpilot_auditLogs') || '[]');
    console.log('ensureDemoData - stored auditLogs length:', storedAuditLogs.length);
  }
  const existingPredictionState = JSON.parse(localStorage.getItem('civicpilot_predictionState') || '{}');
  if (Object.keys(existingPredictionState).length === 0) {
    const predictionState = generatePredictions();
    console.log('ensureDemoData - generated predictionState keys count:', Object.keys(predictionState).length);
    localStorage.setItem('civicpilot_predictionState', JSON.stringify(predictionState));
    const storedPredictionState = JSON.parse(localStorage.getItem('civicpilot_predictionState') || '{}');
    console.log('ensureDemoData - stored predictionState keys count:', Object.keys(storedPredictionState).length);
  }
  if (!localStorage.getItem('civicpilot_reports')) {
    localStorage.setItem('civicpilot_reports', JSON.stringify(generateReport()));
  }
};
