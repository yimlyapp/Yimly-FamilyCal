import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { GoogleConfigResponse, GoogleAccount, GoogleSyncLog, SystemStats } from '../../types';
import {
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Download,
  Database,
  ExternalLink,
  Shield,
  Layers,
  Clock,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';

export const IntegrationsView: React.FC = () => {
  const [googleConfig, setGoogleConfig] = useState<GoogleConfigResponse | null>(null);
  const [syncLogs, setSyncLogs] = useState<GoogleSyncLog[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [configRes, logsRes, statsRes] = await Promise.all([
        api.getGoogleConfig(),
        api.getGoogleLogs().catch(() => []),
        api.getSystemStats().catch(() => null),
      ]);
      setGoogleConfig(configRes);
      setSyncLogs(logsRes);
      setSystemStats(statsRes);
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleConnectGoogle = async () => {
    try {
      const res = await api.getGoogleAuthUrl();
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      alert(err?.message || 'Google OAuth is not configured in server environment yet.');
    }
  };

  const handleManualSync = async (accountId?: string) => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.syncGoogle(accountId);
      setSyncMessage(`Successfully synced ${res.eventsSynced} events with Google Calendar!`);
      await loadAll();
    } catch (err: any) {
      setSyncMessage(`Sync failed: ${err?.message || 'Error communicating with Google API'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDiscoverCalendars = async (accountId?: string) => {
    setIsSyncing(true);
    try {
      const res = await api.discoverGoogleCalendars(accountId);
      setSyncMessage(`Discovered and linked ${res.count} calendars from Google.`);
      await loadAll();
    } catch (err: any) {
      setSyncMessage(`Discovery error: ${err?.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async (accountId?: string) => {
    if (confirm('Are you sure you want to disconnect this Google Account?')) {
      try {
        await api.disconnectGoogle(accountId);
        await loadAll();
      } catch (err: any) {
        alert(err?.message || 'Failed to disconnect account.');
      }
    }
  };

  const handleExportBackup = () => {
    const token = localStorage.getItem('yimly_jwt_token');
    window.open(`/api/system/export${token ? `?token=${token}` : ''}`, '_blank');
  };

  const connectedAccounts = googleConfig?.connectedAccounts || [];

  return (
    <div id="integrations-view-container" className="flex flex-col flex-1 max-w-5xl mx-auto w-full space-y-6">
      {/* View Header */}
      <div className="pb-4 border-b border-[#242C3D]/60">
        <h2 className="text-2xl font-bold text-white tracking-tight font-serif">
          Integrations & System Settings
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Configure Google Calendar synchronization, export household backups, and check container health.
        </p>
      </div>

      {syncMessage && (
        <div className="p-3.5 rounded-2xl bg-[#1A202C] border border-[#FF4FA3]/40 text-[#FF4FA3] text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Google Calendar Card */}
      <div className="p-6 rounded-3xl bg-[#121620] border border-[#242C3D] shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Google Calendar Integration
                {connectedAccounts.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    Connected
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400">
                Two-way sync between Yimly FamilyCal and your family Google Calendars.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Adheres to Google API Services User Data Policy.</span>
                <a
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState(null, '', '/privacy');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="text-[#FF4FA3] hover:underline font-semibold ml-0.5 cursor-pointer"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {connectedAccounts.length > 0 ? (
              <button
                onClick={() => handleManualSync()}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF4FA3] hover:bg-[#e63e90] text-white text-xs font-bold transition-all shadow-md shadow-[#FF4FA3]/25 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            ) : (
              <button
                onClick={handleConnectGoogle}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Connect Google Calendar</span>
              </button>
            )}
          </div>
        </div>

        {/* Connected Accounts List */}
        {connectedAccounts.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Connected Accounts
            </h4>
            <div className="space-y-2">
              {connectedAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3.5 rounded-2xl bg-[#1A202C] border border-[#242C3D] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-white font-mono">{acc.google_email}</span>
                      <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span>
                          Last Synced:{' '}
                          {acc.last_synced_at
                            ? format(new Date(acc.last_synced_at), 'MMM d, yyyy HH:mm')
                            : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDiscoverCalendars(acc.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#121620] hover:bg-[#242C3D] text-gray-300 text-xs font-medium border border-[#242C3D] transition-colors cursor-pointer"
                    >
                      Discover Calendars
                    </button>
                    <button
                      onClick={() => handleDisconnect(acc.id)}
                      className="p-1.5 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Disconnect Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OAuth Domain Instructions Box */}
        <div className="p-4 rounded-2xl bg-[#0E111A] border border-[#242C3D]/60 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-gray-300 font-semibold">
            <Shield className="w-4 h-4 text-[#FF4FA3]" />
            <span>Google Cloud Console OAuth 2.0 Setup</span>
          </div>
          <p className="text-gray-400 leading-relaxed">
            To enable Google Calendar sync on your custom domain, register your Google Client ID & Secret in <code className="text-gray-200 font-mono">docker-compose.yml</code> and authorize this Redirect URI:
          </p>
          <div className="p-2.5 rounded-xl bg-[#121620] border border-[#242C3D] font-mono text-emerald-400 select-all break-all">
            {googleConfig?.redirectUri || 'https://familycal.robinhort.link/api/v1/calendar/google/callback'}
          </div>
        </div>
      </div>

      {/* Backup & Export Card */}
      <div className="p-6 rounded-3xl bg-[#121620] border border-[#242C3D] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Full Household Backup Export</h3>
            <p className="text-xs text-gray-400">
              Download your complete family schedule, members, events, and tasks as JSON.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportBackup}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1A202C] hover:bg-[#242C3D] text-gray-200 border border-[#242C3D] text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#FF4FA3]" />
          <span>Export JSON Backup</span>
        </button>
      </div>

      {/* Container Health & Diagnostic Stats */}
      {systemStats && (
        <div className="p-6 rounded-3xl bg-[#121620] border border-[#242C3D] shadow-md space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FF4FA3]" />
            <h3 className="text-base font-bold text-white">System Diagnostics</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#1A202C] border border-[#242C3D]/60">
              <span className="text-gray-400 block mb-1">Status</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {systemStats.status.toUpperCase()}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#1A202C] border border-[#242C3D]/60">
              <span className="text-gray-400 block mb-1">Total Events</span>
              <span className="font-bold text-white font-mono text-sm">{systemStats.events}</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#1A202C] border border-[#242C3D]/60">
              <span className="text-gray-400 block mb-1">Total Tasks</span>
              <span className="font-bold text-white font-mono text-sm">{systemStats.tasks}</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#1A202C] border border-[#242C3D]/60">
              <span className="text-gray-400 block mb-1">App Version</span>
              <span className="font-bold text-[#FF4FA3] font-mono text-sm">v{systemStats.version}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
