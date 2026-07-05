// src/context/AppContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GeminiResponse } from '../services/geminiService';
import { ensureDemoData } from '../utils/demoData';

import { WardData, bangaloreWards } from '../services/bigqueryService';

// ---------- Types ----------
export type Ward = string;

export type ChatMessage = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  responseDetails?: GeminiResponse;
};

export type ComplaintAnalysis = {
  id: string;
  imageUrl: string; // preview or dataURL
  category: string;
  severity: string;
  priority: string;
  department: string;
  confidence: number;
  estimatedResolutionTime: string;
  recommendation: string;
  timestamp: string;
  location?: string;
};

export type PredictionData = {
  category: string;
  kpis: Record<string, number>;
  chartData: number[]; // simplified line chart data
  forecast: string;
  riskScore: number;
  confidenceScore: number;
  recommendation: string;
};

export type Language = 'en' | 'kn' | 'hi' | string;
export type Notification = {
  id: string;
  message: string;
  read: boolean;
  timestamp: number;
};
export type AnalyticsFilters = {
  ward?: string;
  priority?: string;
  category?: string;
  keyword?: string;
  search: string;
};
export type Settings = {
  darkMode: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    emergency: boolean;
    aiRecommendations: boolean;
    report: boolean;
  };
  accentColor?: string; // optional accent color hex
};
export type SimulatorState = {
  pumpsDeployed: boolean;
  reroutingActive: boolean;
  cleaningActive: boolean;
  simulationTriggered: boolean;
};

// Additional user related types
export type Profile = {
  displayName: string;
  email: string;
  avatarUrl?: string;
};
export type AuditLog = {
  id?: string;
  action: string;
  timestamp: string;
  status: string;
};
export type CloudConfig = {
  geminiApiKey?: string;
  bigQueryProjectId?: string;
  storageBucket?: string;
  vertexRegion?: string;
};
export type CrewRecord = {
  type: string;
  dispatchedAt: string;
};

export type GlobalAlert = {
  messageKey: string;
  severity: 'info' | 'warning' | 'critical';
};
export type Role = 'Commissioner' | 'Officer' | 'Analyst' | 'Citizen';

// ---------- Context Interface ----------
type AppContextProps = {
  // Ward selection
  selectedWard: WardData | null;
  setSelectedWard: (ward: WardData) => void;

  // Simulator state
  pumpsDeployed: boolean;
  setPumpsDeployed: (v: boolean) => void;
  reroutingActive: boolean;
  setReroutingActive: (v: boolean) => void;
  cleaningActive: boolean;
  setCleaningActive: (v: boolean) => void;
  simulationTriggered: boolean;
  setSimulationTriggered: (v: boolean) => void;

  // Complaint analysis
  complaintHistory: ComplaintAnalysis[];
  addComplaint: (c: ComplaintAnalysis) => void;

  // Prediction center
  predictionState: Record<string, PredictionData>;
  updatePrediction: (category: string, data: PredictionData) => void;

  // Chat
  chatHistory: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  // Settings & language
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  language: Language;
  setLanguage: (lang: Language) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Analytics filters
  analyticsFilters: AnalyticsFilters;
  updateAnalyticsFilters: (filters: Partial<AnalyticsFilters>) => void;

  // User profile
  profile: Profile;
  updateProfile: (profile: Partial<Profile>) => void;

  // Role & permissions
  role: Role;
  setRole: (r: Role) => void;

  // Cloud configuration
  cloudConfig: CloudConfig;
  updateCloudConfig: (cfg: Partial<CloudConfig>) => void;

  // Audit logs
  auditLogs: AuditLog[];
  addAuditLog: (log: AuditLog) => void;

  // Crew status & global alerts (new)
  crewStatus: CrewRecord[];
  addCrewStatus: (record: CrewRecord) => void;
  globalAlert: GlobalAlert | null;
  setGlobalAlert: (alert: GlobalAlert | null) => void;

  // Security
  logout: () => void;
  lastLogin: string;
  setLastLogin: (date: string) => void;
};

// ---------- Default Settings ----------
const defaultSettings: Settings = {
  darkMode: false,
  notifications: {
    email: true,
    push: true,
    emergency: true,
    aiRecommendations: true,
    report: true,
  },
  accentColor: '#2563EB', // default blue
};

const defaultProfile: Profile = {
  displayName: 'User',
  email: 'user@example.com',
  avatarUrl: undefined,
};

const defaultCloudConfig: CloudConfig = {};

// ---------- Context Creation ----------
const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Core state
  const [selectedWard, setSelectedWard] = useState<WardData | null>(bangaloreWards[0]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [language, setLanguage] = useState<Language>('en');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analyticsFilters, setAnalyticsFilters] = useState<AnalyticsFilters>({ search: "" });

  // Simulator state
  const [pumpsDeployed, setPumpsDeployed] = useState<boolean>(false);
  const [reroutingActive, setReroutingActive] = useState<boolean>(false);
  const [cleaningActive, setCleaningActive] = useState<boolean>(false);
  const [simulationTriggered, setSimulationTriggered] = useState<boolean>(false);

  // Complaint history
  const [complaintHistory, setComplaintHistory] = useState<ComplaintAnalysis[]>([]);

  // Prediction state
  const [predictionState, setPredictionState] = useState<Record<string, PredictionData>>({});

  // Profile & role
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [role, setRole] = useState<Role>('Commissioner');

  // Cloud config
  const [cloudConfig, setCloudConfig] = useState<CloudConfig>(defaultCloudConfig);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  // New crew status state
  const [crewStatus, setCrewStatus] = useState<CrewRecord[]>([]);
  // Global alert state
  const [globalAlert, setGlobalAlert] = useState<GlobalAlert | null>(null);

  // Security & session
  const [lastLogin, setLastLogin] = useState<string>(new Date().toISOString());

  // ---------- Load persisted data on mount ----------
useEffect(() => {
  // Ensure demo data is seeded if not present
    // Seed demo data if not present
    ensureDemoData();
    // Debug: print counts of seeded data in localStorage
    const dbgKeys = ['civicpilot_complaintHistory','civicpilot_notifications','civicpilot_auditLogs','civicpilot_predictionState','civicpilot_dashboard'];
    dbgKeys.forEach(k => {
      const raw = localStorage.getItem(k);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const count = Array.isArray(parsed) ? parsed.length : (typeof parsed === 'object' ? Object.keys(parsed).length : 1);
          console.log(`AppContext debug - localStorage ${k} count:`, count);
        } catch (e) { console.warn('Failed to parse', k, e); }
      } else {
        console.warn('AppContext debug - localStorage key missing:', k);
      }
    });

  const stored = {
    selectedWard: localStorage.getItem('civicpilot_selectedWard'),
    chatHistory: localStorage.getItem('civicpilot_chatHistory'),
    settings: localStorage.getItem('civicpilot_settings'),
    language: localStorage.getItem('civicpilot_language'),
    notifications: localStorage.getItem('civicpilot_notifications'),
    analyticsFilters: localStorage.getItem('civicpilot_analyticsFilters'),
    pumpsDeployed: localStorage.getItem('civicpilot_pumpsDeployed'),
    reroutingActive: localStorage.getItem('civicpilot_reroutingActive'),
    cleaningActive: localStorage.getItem('civicpilot_cleaningActive'),
    simulationTriggered: localStorage.getItem('civicpilot_simulationTriggered'),
    complaintHistory: localStorage.getItem('civicpilot_complaintHistory'),
    predictionState: localStorage.getItem('civicpilot_predictionState'),
    profile: localStorage.getItem('civicpilot_profile'),
    role: localStorage.getItem('civicpilot_role'),
    cloudConfig: localStorage.getItem('civicpilot_cloudConfig'),
    auditLogs: localStorage.getItem('civicpilot_auditLogs'),
    lastLogin: localStorage.getItem('civicpilot_lastLogin'),
  };
  if (stored.selectedWard) {
    try {
      const parsed = JSON.parse(stored.selectedWard);
      if (parsed) setSelectedWard(parsed as WardData);
    } catch (e) {
      console.error('Failed to parse selectedWard from localStorage', e);
    }
  }
  if (stored.chatHistory) setChatHistory(JSON.parse(stored.chatHistory));
  if (stored.settings) setSettings(JSON.parse(stored.settings));
  if (stored.language) setLanguage(stored.language as Language);
  if (stored.notifications) setNotifications(JSON.parse(stored.notifications));
  if (stored.analyticsFilters) setAnalyticsFilters(JSON.parse(stored.analyticsFilters));
  if (stored.pumpsDeployed) setPumpsDeployed(JSON.parse(stored.pumpsDeployed));
  if (stored.reroutingActive) setReroutingActive(JSON.parse(stored.reroutingActive));
  if (stored.cleaningActive) setCleaningActive(JSON.parse(stored.cleaningActive));
  if (stored.simulationTriggered) setSimulationTriggered(JSON.parse(stored.simulationTriggered));
  if (stored.complaintHistory) setComplaintHistory(JSON.parse(stored.complaintHistory));
  if (stored.predictionState) setPredictionState(JSON.parse(stored.predictionState));
  if (stored.profile) setProfile(JSON.parse(stored.profile));
  if (stored.role) setRole(stored.role as Role);
  if (stored.cloudConfig) setCloudConfig(JSON.parse(stored.cloudConfig));
  if (stored.auditLogs) setAuditLogs(JSON.parse(stored.auditLogs));
  if (stored.lastLogin) setLastLogin(stored.lastLogin);
}, []);

  // Debug: log initial loaded state
  useEffect(() => {
    console.log('AppContext debug - complaintHistory length:', complaintHistory.length);
    console.log('AppContext debug - notifications length:', notifications?.length);
    console.log('AppContext debug - auditLogs length:', auditLogs?.length);
    console.log('AppContext debug - predictionState keys:', Object.keys(predictionState));
  }, []);

// ---------- Persist data on change ----------
  useEffect(() => {
    // Seed demo data if storage empty
    // ensureDemoData(); // removed to avoid reseeding on every state change

    const stored = {
      selectedWard: localStorage.getItem('civicpilot_selectedWard'),
      chatHistory: localStorage.getItem('civicpilot_chatHistory'),
      settings: localStorage.getItem('civicpilot_settings'),
      language: localStorage.getItem('civicpilot_language'),
      notifications: localStorage.getItem('civicpilot_notifications'),
      analyticsFilters: localStorage.getItem('civicpilot_analyticsFilters'),
      pumpsDeployed: localStorage.getItem('civicpilot_pumpsDeployed'),
      reroutingActive: localStorage.getItem('civicpilot_reroutingActive'),
      cleaningActive: localStorage.getItem('civicpilot_cleaningActive'),
      simulationTriggered: localStorage.getItem('civicpilot_simulationTriggered'),
      complaintHistory: localStorage.getItem('civicpilot_complaintHistory'),
      predictionState: localStorage.getItem('civicpilot_predictionState'),
      profile: localStorage.getItem('civicpilot_profile'),
      role: localStorage.getItem('civicpilot_role'),
      cloudConfig: localStorage.getItem('civicpilot_cloudConfig'),
      auditLogs: localStorage.getItem('civicpilot_auditLogs'),
      lastLogin: localStorage.getItem('civicpilot_lastLogin'),
    };
    if (stored.selectedWard) {
      try {
        const parsed = JSON.parse(stored.selectedWard);
        if (parsed) setSelectedWard(parsed as WardData);
      } catch (e) {
        console.error('Failed to parse selectedWard from localStorage', e);
      }
    }
    if (stored.chatHistory) setChatHistory(JSON.parse(stored.chatHistory));
    if (stored.settings) setSettings(JSON.parse(stored.settings));
    if (stored.language) setLanguage(stored.language as Language);
    if (stored.notifications) {
      const notifs = JSON.parse(stored.notifications);
      console.log('AppContext load - notifications length:', notifs.length);
      setNotifications(notifs);
    }
    if (stored.analyticsFilters) setAnalyticsFilters(JSON.parse(stored.analyticsFilters));
    if (stored.pumpsDeployed) setPumpsDeployed(JSON.parse(stored.pumpsDeployed));
    if (stored.reroutingActive) setReroutingActive(JSON.parse(stored.reroutingActive));
    if (stored.cleaningActive) setCleaningActive(JSON.parse(stored.cleaningActive));
    if (stored.simulationTriggered) setSimulationTriggered(JSON.parse(stored.simulationTriggered));
    if (stored.complaintHistory) {
      const comp = JSON.parse(stored.complaintHistory);
      console.log('AppContext load - complaintHistory length:', comp.length);
      setComplaintHistory(comp);
    }
    if (stored.predictionState) {
      const pred = JSON.parse(stored.predictionState);
      console.log('AppContext load - predictionState keys count:', Object.keys(pred).length);
      setPredictionState(pred);
    }
    if (stored.profile) setProfile(JSON.parse(stored.profile));
    if (stored.role) setRole(stored.role as Role);
    if (stored.cloudConfig) setCloudConfig(JSON.parse(stored.cloudConfig));
    if (stored.auditLogs) {
      const logs = JSON.parse(stored.auditLogs);
      console.log('AppContext load - auditLogs length:', logs.length);
      setAuditLogs(logs);
    }
    if (stored.lastLogin) setLastLogin(stored.lastLogin);
  }, []);

  // ---------- Persist data on change ----------
  useEffect(() => {
    if (selectedWard) localStorage.setItem('civicpilot_selectedWard', JSON.stringify(selectedWard));
    localStorage.setItem('civicpilot_chatHistory', JSON.stringify(chatHistory));
    localStorage.setItem('civicpilot_settings', JSON.stringify(settings));
    localStorage.setItem('civicpilot_language', language);
    localStorage.setItem('civicpilot_notifications', JSON.stringify(notifications));
    localStorage.setItem('civicpilot_analyticsFilters', JSON.stringify(analyticsFilters));
    localStorage.setItem('civicpilot_pumpsDeployed', JSON.stringify(pumpsDeployed));
    localStorage.setItem('civicpilot_reroutingActive', JSON.stringify(reroutingActive));
    localStorage.setItem('civicpilot_cleaningActive', JSON.stringify(cleaningActive));
    localStorage.setItem('civicpilot_simulationTriggered', JSON.stringify(simulationTriggered));
    localStorage.setItem('civicpilot_complaintHistory', JSON.stringify(complaintHistory));
    localStorage.setItem('civicpilot_predictionState', JSON.stringify(predictionState));
    localStorage.setItem('civicpilot_profile', JSON.stringify(profile));
    localStorage.setItem('civicpilot_role', role);
    localStorage.setItem('civicpilot_cloudConfig', JSON.stringify(cloudConfig));
    localStorage.setItem('civicpilot_auditLogs', JSON.stringify(auditLogs));
    localStorage.setItem('civicpilot_lastLogin', lastLogin);
  }, [
    selectedWard,
    chatHistory,
    settings,
    language,
    notifications,
    analyticsFilters,
    pumpsDeployed,
    reroutingActive,
    cleaningActive,
    simulationTriggered,
    complaintHistory,
    predictionState,
    profile,
    role,
    cloudConfig,
    auditLogs,
    lastLogin,
  ]);

  // ---------- Action helpers ----------
  const addMessage = (msg: ChatMessage) => setChatHistory((prev) => [...prev, msg]);
  const clearChat = () => setChatHistory([]);
  const updateSettings = (newSettings: Partial<Settings>) =>
    setSettings((prev) => ({ ...prev, ...newSettings }));
  const addComplaint = (c: ComplaintAnalysis) =>
    setComplaintHistory((prev) => [...prev, c]);
  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
      ...notif,
    };
    setNotifications((prev) => [...prev, newNotif]);
  };
  const markNotificationRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const clearNotifications = () => setNotifications([]);
  const updateAnalyticsFilters = (filters: Partial<AnalyticsFilters>) =>
    setAnalyticsFilters((prev) => ({ ...prev, ...filters }));
  const updatePrediction = (category: string, data: PredictionData) => {
    setPredictionState((prev) => ({ ...prev, [category]: data }));
  };
  const updateProfile = (partial: Partial<Profile>) => setProfile((prev) => ({ ...prev, ...partial }));
  const updateCloudConfig = (partial: Partial<CloudConfig>) => setCloudConfig((prev) => ({ ...prev, ...partial }));
  const addAuditLog = (log: AuditLog) => {
    const newLog = {
      id: log.id || Date.now().toString(),
      ...log,
    };
    setAuditLogs((prev) => [...prev, newLog]);
  };
  const addCrewStatus = (record: CrewRecord) => setCrewStatus((prev) => [...prev, record]);
  const logout = () => {
    // For demo, we clear most user‑specific slices
    setProfile(defaultProfile);
    setRole('Citizen');
    setCloudConfig(defaultCloudConfig);
    addNotification({ message: 'Logged out successfully.' });
    // Clear crew status and alerts on logout
    setCrewStatus([]);
    setGlobalAlert(null);
  };

  return (
    <AppContext.Provider
      value={{
        selectedWard,
        setSelectedWard,
        pumpsDeployed,
        setPumpsDeployed,
        reroutingActive,
        setReroutingActive,
        cleaningActive,
        setCleaningActive,
        simulationTriggered,
        setSimulationTriggered,
        complaintHistory,
        addComplaint,
        predictionState,
        updatePrediction,
        chatHistory,
        addMessage,
        clearChat,
        settings,
        updateSettings,
        language,
        setLanguage,
        notifications,
        addNotification,
        markNotificationRead,
        clearNotifications,
        analyticsFilters,
        updateAnalyticsFilters,
        profile,
        updateProfile,
        role,
        setRole,
        cloudConfig,
        updateCloudConfig,
        auditLogs,
        addAuditLog,
        // crew and alert helpers
        crewStatus,
        addCrewStatus,
        globalAlert,
        setGlobalAlert,
        logout,
        lastLogin,
        setLastLogin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
