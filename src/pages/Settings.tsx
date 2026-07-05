// src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import { useAppContext, Role, Settings as SettingsType } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation, TranslationKey } from '../utils/translations';
import {
  User,
  Shield,
  Bell,
  Cloud,
  Moon,
  Sun,
  Palette,
  Lock,
  Edit,
  Settings as SettingsIcon,
  Database,
} from 'lucide-react';

// Simple toast component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded shadow-lg animate-fade-in z-50">
    {message}
    <button onClick={onClose} className="ml-2 text-xs underline">
      ✕
    </button>
  </div>
);

export const Settings: React.FC = () => {
  const {
    settings,
    updateSettings,
    language,
    setLanguage,
    profile,
    updateProfile,
    role,
    setRole,
    cloudConfig,
    updateCloudConfig,
    auditLogs,
    addAuditLog,
    logout,
    lastLogin,
    setLastLogin,
    addNotification,
  } = useAppContext();

  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation(language);

  // Toast management
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };


  // ---------- Profile ----------
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editName, setEditName] = useState(profile.displayName);

  const saveProfile = () => {
    updateProfile({ displayName: editName });
    setShowProfileEdit(false);
    showToast('Profile updated');
    addNotification({ message: 'Profile changed' });
  };

  // ---------- Appearance ----------
  const toggleDarkMode = () => {
    toggleTheme();
    updateSettings({ darkMode: theme === 'light' });
    showToast('Theme toggled');
  };

  const changeAccent = (color: string) => {
    updateSettings({ accentColor: color });
    showToast('Accent color changed');
  };

  // ---------- Language ----------
  const changeLanguage = (lang: string) => {
    setLanguage(lang as any);
    showToast('Language changed');
  };

  // ---------- Notifications ----------
  const toggleNotif = (field: keyof SettingsType['notifications']) => {
    updateSettings({
      notifications: { ...settings.notifications, [field]: !settings.notifications[field] },
    });
    showToast(`${field} notification toggled`);
  };

  // ---------- Security ----------
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const submitPassword = () => {
    if (newPwd !== confirmPwd) {
      showToast('Passwords do not match');
      return;
    }
    setPwdLoading(true);
    setTimeout(() => {
      setPwdLoading(false);
      setShowPwdModal(false);
      setNewPwd('');
      setConfirmPwd('');
      showToast('Password changed');
      addNotification({ message: 'Password updated' });
    }, 1200);
  };

  // ---------- Role Permissions ----------
  const roles: Role[] = ['Commissioner', 'Officer', 'Analyst', 'Citizen'];

  // ---------- Audit Logs ----------
  const [auditSearch, setAuditSearch] = useState('');
  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.status.toLowerCase().includes(auditSearch.toLowerCase())
  );

  // ---------- Cloud Config ----------
  const [cloudEdits, setCloudEdits] = useState(cloudConfig);
  const saveCloudConfig = () => {
    updateCloudConfig(cloudEdits);
    showToast('Cloud configuration saved');
    addNotification({ message: 'Cloud config updated' });
  };

  // ---------- Logout ----------
  const handleLogout = () => {
    logout();
    showToast('Logged out');
  };

  // Sync local edits when cloudConfig changes
  useEffect(() => {
    setCloudEdits(cloudConfig);
  }, [cloudConfig]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Profile Card */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-premium p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <User className="w-5 h-5" /> Profile
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-2xl text-slate-500">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-800 dark:text-slate-200">{profile.displayName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Bangalore Municipal Corp.</p>
          </div>
          <button
            onClick={() => setShowProfileEdit(true)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <Edit className="w-4 h-4" /> Edit
          </button>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Edit className="w-5 h-5" /> Edit Profile
            </h3>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowProfileEdit(false)} className="px-3 py-1 rounded border">
                Cancel
              </button>
              <button onClick={saveProfile} className="px-3 py-1 bg-blue-600 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appearance */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
          <Palette className="w-5 h-5 text-blue-500" /> {t('Theme')}
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={toggleDarkMode} 
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-xs font-bold text-slate-700 dark:text-slate-350"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            {theme === 'dark' ? t('Light Mode') : t('Dark Mode')}
          </button>
        </div>
        <div className="flex gap-2">
          {['#2563EB', '#10B981', '#EF4444', '#F59E0B'].map((c) => (
            <button
              key={c}
              onClick={() => changeAccent(c)}
              className={`w-8 h-8 rounded-full border-2 ${settings.accentColor === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'} transition-all`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </section>

      {/* Language */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
          <SettingsIcon className="w-5 h-5 text-blue-500" /> {t('Language')}
        </h2>
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="w-full max-w-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
        >
          <option value="en">English</option>
          <option value="kn">Kannada (ಕನ್ನಡ)</option>
          <option value="hi">Hindi (हिन्दी)</option>
        </select>
      </section>

      {/* Notifications */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
          <Bell className="w-5 h-5 text-blue-500" /> {t('Notifications')}
        </h2>
        <div className="space-y-2">
          {(
            [
              { label: 'Email', field: 'email' },
              { label: 'Push', field: 'push' },
              { label: 'Emergency', field: 'emergency' },
              { label: 'AI Recommendations', field: 'aiRecommendations' },
              { label: 'Report', field: 'report' },
            ] as const
          ).map((item) => (
            <label key={item.field} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.notifications[item.field]}
                onChange={() => toggleNotif(item.field as any)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
          <Lock className="w-5 h-5 text-blue-500" /> {t('Security')}
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => setShowPwdModal(true)} 
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
          >
            {t('Change Password')}
          </button>
          <button 
            onClick={handleLogout} 
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-bold text-xs transition-colors"
          >
            {t('Logout')}
          </button>
        </div>
        <p className="text-sm text-slate-500">Last login: {new Date(lastLogin).toLocaleString()}</p>
      </section>

      {/* Change Password Modal */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" /> Change Password
            </h3>
            <label className="block mb-2">New Password</label>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3"
            />
            <label className="block mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPwdModal(false)} className="px-3 py-1 border rounded">
                Cancel
              </button>
              <button
                onClick={submitPassword}
                disabled={pwdLoading}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                {pwdLoading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Permissions */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
          <Shield className="w-5 h-5 text-blue-500" /> Role Permissions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roles.map((r) => (
            <div
              key={r}
              onClick={() => setRole(r)}
              className={`p-4 border rounded cursor-pointer transition ${role === r ? 'border-blue-600 bg-blue-50 dark:bg-blue-900' : 'border-slate-300'}`}
            >
              <p className="font-medium text-center text-slate-800 dark:text-slate-200">{r}</p>
            </div>
          ))}
        </div>
      </section>

      {role === 'Commissioner' && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
            <Cloud className="w-5 h-5 text-blue-500" /> {t('Google Cloud Configuration')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Gemini API Key (demo)</label>
              <input
                type="text"
                value={cloudEdits.geminiApiKey || ''}
                onChange={(e) => setCloudEdits((prev) => ({ ...prev, geminiApiKey: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">BigQuery Project ID</label>
              <input
                type="text"
                value={cloudEdits.bigQueryProjectId || ''}
                onChange={(e) => setCloudEdits((prev) => ({ ...prev, bigQueryProjectId: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Cloud Storage Bucket</label>
              <input
                type="text"
                value={cloudEdits.storageBucket || ''}
                onChange={(e) => setCloudEdits((prev) => ({ ...prev, storageBucket: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Vertex AI Region</label>
              <input
                type="text"
                value={cloudEdits.vertexRegion || ''}
                onChange={(e) => setCloudEdits((prev) => ({ ...prev, vertexRegion: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <button onClick={saveCloudConfig} className="px-4 py-2 bg-indigo-600 text-white rounded">
              Save Cloud Config
            </button>
          </div>
        </section>
      )}

      {/* Audit Logs */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
          <Database className="w-5 h-5 text-blue-500" /> {t('Audit Logs')}
        </h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search logs…"
            value={auditSearch}
            onChange={(e) => setAuditSearch(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="p-2 text-xs font-medium">Action</th>
                <th className="p-2 text-xs font-medium">Timestamp</th>
                <th className="p-2 text-xs font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, i) => (
                <tr key={i} className="border-b border-slate-200 dark:border-slate-700">
                  <td className="p-2 text-sm">{log.action}</td>
                  <td className="p-2 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-slate-500">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Settings;
