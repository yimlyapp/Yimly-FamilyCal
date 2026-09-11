import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFamily } from '../../context/FamilyContext';
import { useCalendar } from '../../context/CalendarContext';
import {
  Calendar as CalIcon,
  Heart,
  LogOut,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'calendar' | 'tasks' | 'birthdays' | 'family' | 'settings';
  setActiveTab: (t: 'calendar' | 'tasks' | 'birthdays' | 'family' | 'settings') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, family, logout } = useAuth();
  const { members } = useFamily();
  const { openCreateEventModal, isSyncing, triggerGoogleSync } = useCalendar();

  return (
    <header id="app-navbar" className="h-16 bg-[#0E111A] border-b border-[#242C3D]/60 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
      {/* Brand & Household Name */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#1A202C] border border-[#242C3D] flex items-center justify-center shadow-sm">
          <div className="relative">
            <CalIcon className="w-5 h-5 text-[#FF4FA3]" />
            <Heart className="w-2.5 h-2.5 text-white fill-white absolute -bottom-0.5 -right-0.5" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-none font-serif">
              Yimly FamilyCal
            </h1>
            <span className="hidden sm:inline px-1.5 py-0.5 rounded-full bg-[#FF4FA3]/15 text-[#FF4FA3] text-[10px] font-bold">
              Family Hub
            </span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            {family?.name || 'Household Calendar'}
          </span>
        </div>
      </div>

      {/* Center Navigation on Desktop */}
      <nav className="hidden md:flex items-center gap-1 bg-[#121620] p-1 rounded-2xl border border-[#242C3D]">
        {(
          [
            { id: 'calendar', label: 'Calendar' },
            { id: 'tasks', label: 'Tasks' },
            { id: 'birthdays', label: 'Birthdays' },
            { id: 'family', label: 'Household' },
            { id: 'settings', label: 'Settings' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#FF4FA3] text-white shadow-xs'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A202C]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Right Controls: Quick Add, User Profile, Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Button */}
        <button
          id="nav-quick-add-btn"
          onClick={() => openCreateEventModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF4FA3] hover:bg-[#e63e90] text-white text-xs font-bold transition-all shadow-md shadow-[#FF4FA3]/25 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Event</span>
        </button>

        {/* User Pill */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-[#242C3D]/60">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: user.color || '#FF4FA3' }}
              title={`${user.name} (${user.role})`}
            >
              {user.name.slice(0, 1).toUpperCase()}
            </div>

            <button
              id="nav-logout-btn"
              onClick={logout}
              className="p-2 rounded-xl hover:bg-[#1A202C] text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
