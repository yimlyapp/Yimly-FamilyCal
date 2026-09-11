import React from 'react';
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Users,
  CheckCircle2,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';
import { useFamily } from '../../context/FamilyContext';
import { CalendarViewMode } from '../../types';

export const CalendarHeader: React.FC = () => {
  const {
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    openCreateEventModal,
    isSyncing,
    triggerGoogleSync,
    googleAccounts,
  } = useCalendar();

  const { members, selectedMemberFilter, setSelectedMemberFilter } = useFamily();

  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formattedHeaderTitle = () => {
    if (viewMode === 'month') return format(currentDate, 'MMMM yyyy');
    if (viewMode === 'week') return `Week of ${format(currentDate, 'MMM d, yyyy')}`;
    if (viewMode === 'day') return format(currentDate, 'EEEE, MMMM d, yyyy');
    return `${format(currentDate, 'MMMM yyyy')} Agenda`;
  };

  const isGoogleConnected = googleAccounts.length > 0 && googleAccounts.some(a => a.sync_status === 'connected');

  return (
    <div id="calendar-header-section" className="flex flex-col gap-4 pb-2 border-b border-[#242C3D]/60">
      {/* Top Bar: Navigation, Title, View Mode & Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Date controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="cal-today-btn"
            onClick={handleToday}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#1A202C] hover:bg-[#242C3D] text-gray-200 border border-[#242C3D] transition-all cursor-pointer shadow-sm"
          >
            Today
          </button>

          <div className="flex items-center rounded-xl bg-[#121620] border border-[#242C3D] p-0.5">
            <button
              id="cal-prev-btn"
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-[#1A202C] text-gray-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="cal-next-btn"
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-[#1A202C] text-gray-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 id="calendar-current-title" className="text-lg sm:text-xl font-bold text-white tracking-tight ml-1 font-serif">
            {formattedHeaderTitle()}
          </h2>
        </div>

        {/* Right: Sync Status, View Mode Switcher, and Add Event Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Google Sync Button / Status */}
          {isGoogleConnected && (
            <button
              id="cal-google-sync-btn"
              onClick={triggerGoogleSync}
              disabled={isSyncing}
              title="Sync with Google Calendar"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121620] hover:bg-[#1A202C] text-xs font-medium text-gray-300 border border-[#242C3D] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#FF4FA3] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Google Sync'}</span>
            </button>
          )}

          {/* View Mode Switcher */}
          <div id="calendar-view-mode-tabs" className="flex items-center bg-[#121620] p-1 rounded-xl border border-[#242C3D]">
            {(['month', 'week', 'day', 'agenda'] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                id={`cal-mode-${mode}`}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-semibold capitalize rounded-lg transition-all cursor-pointer ${
                  viewMode === mode
                    ? 'bg-[#FF4FA3] text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A202C]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Add Event Button */}
          <button
            id="cal-add-event-btn"
            onClick={() => openCreateEventModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF4FA3] hover:bg-[#e63e90] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF4FA3]/25 hover:shadow-[#FF4FA3]/40 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Event</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Member Filter Pills Bar */}
      <div id="family-member-filter-bar" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-gray-500 font-medium whitespace-nowrap flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-gray-400" /> Filter:
        </span>

        <button
          id="filter-member-all"
          onClick={() => setSelectedMemberFilter(null)}
          className={`px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
            selectedMemberFilter === null
              ? 'bg-white/10 text-white border border-white/20 font-semibold shadow-xs'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A202C] border border-transparent'
          }`}
        >
          All Household
        </button>

        {members.map((member) => {
          const isSelected = selectedMemberFilter === member.id;
          return (
            <button
              key={member.id}
              id={`filter-member-${member.id}`}
              onClick={() => setSelectedMemberFilter(isSelected ? null : member.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? 'bg-[#1A202C] text-white border-[#FF4FA3] shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-[#121620] border-[#242C3D]/60'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: member.color || '#FF4FA3' }}
              />
              <span>{member.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
