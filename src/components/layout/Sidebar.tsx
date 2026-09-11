import React, { useState } from 'react';
import { MiniCalendar } from '../calendar/MiniCalendar';
import { useCalendar } from '../../context/CalendarContext';
import { useFamily } from '../../context/FamilyContext';
import {
  Calendar as CalIcon,
  Plus,
  Check,
  Globe,
  Users,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    calendars,
    selectedCalendarIds,
    toggleCalendarSelection,
    createCalendar,
  } = useCalendar();

  const { members, selectedMemberFilter, setSelectedMemberFilter } = useFamily();

  const [isAddingCal, setIsAddingCal] = useState(false);
  const [newCalName, setNewCalName] = useState('');
  const [newCalColor, setNewCalColor] = useState('#FF4FA3');

  const handleCreateCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalName.trim()) return;
    await createCalendar({ name: newCalName.trim(), color: newCalColor });
    setNewCalName('');
    setIsAddingCal(false);
  };

  return (
    <aside
      id="app-sidebar"
      className="hidden lg:flex flex-col w-64 xl:w-72 bg-[#0B0D13] border-r border-[#242C3D]/60 p-4 gap-5 overflow-y-auto shrink-0 scrollbar-none"
    >
      {/* 1. Mini Month Date Picker */}
      <MiniCalendar />

      {/* 2. Calendars Multi-Select */}
      <div className="p-3.5 bg-[#121620] rounded-2xl border border-[#242C3D]/60 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <CalIcon className="w-3.5 h-3.5 text-[#FF4FA3]" /> Household Calendars
          </span>
          <button
            onClick={() => setIsAddingCal(!isAddingCal)}
            className="p-1 rounded-lg hover:bg-[#1A202C] text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="Create Calendar"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add Calendar inline mini-form */}
        {isAddingCal && (
          <form onSubmit={handleCreateCalendar} className="space-y-2 pt-1">
            <input
              type="text"
              required
              value={newCalName}
              onChange={(e) => setNewCalName(e.target.value)}
              placeholder="Calendar name..."
              className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4FA3]"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {['#FF4FA3', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCalColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-4 h-4 rounded-full ${newCalColor === c ? 'ring-2 ring-white' : 'opacity-70'}`}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="px-2.5 py-1 bg-[#FF4FA3] hover:bg-[#e63e90] text-white rounded-lg text-[10px] font-bold"
              >
                Add
              </button>
            </div>
          </form>
        )}

        {/* Calendars Checkbox List */}
        <div className="space-y-1.5">
          {calendars.map((cal) => {
            const isChecked = selectedCalendarIds.includes(cal.id);
            const isGoogle = cal.source === 'google';

            return (
              <label
                key={cal.id}
                className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-[#1A202C] cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCalendarSelection(cal.id)}
                    className="rounded bg-[#1A202C] border-[#242C3D] text-[#FF4FA3] focus:ring-[#FF4FA3] cursor-pointer"
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cal.color || '#FF4FA3' }}
                  />
                  <span className="text-xs text-gray-200 font-medium truncate group-hover:text-white">
                    {cal.name}
                  </span>
                </div>

                {isGoogle && (
                  <Globe className="w-3 h-3 text-blue-400 shrink-0" title="Google Synced" />
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Family Members Quick Status */}
      <div className="p-3.5 bg-[#121620] rounded-2xl border border-[#242C3D]/60 space-y-2.5">
        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#FF4FA3]" /> Family Members
        </span>

        <div className="space-y-1.5">
          <button
            onClick={() => setSelectedMemberFilter(null)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              selectedMemberFilter === null
                ? 'bg-[#1A202C] text-[#FF4FA3] font-bold'
                : 'text-gray-400 hover:text-white hover:bg-[#1A202C]'
            }`}
          >
            <span>All Members</span>
            {selectedMemberFilter === null && <Check className="w-3.5 h-3.5" />}
          </button>

          {members.map((m) => {
            const isSelected = selectedMemberFilter === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMemberFilter(isSelected ? null : m.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#1A202C] text-white font-bold'
                    : 'text-gray-300 hover:text-white hover:bg-[#1A202C]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: m.color || '#FF4FA3' }}
                  />
                  <span className="truncate">{m.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#FF4FA3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. App Info Badge */}
      <div className="mt-auto pt-2 text-center text-[10px] text-gray-500 flex flex-col items-center gap-1">
        <span>Yimly FamilyCal • Self-Hosted Edition</span>
        <span className="text-gray-600 font-mono">SQLite Local Database</span>
      </div>
    </aside>
  );
};
