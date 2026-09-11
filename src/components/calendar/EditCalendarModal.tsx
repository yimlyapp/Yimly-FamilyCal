import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';
import { Calendar } from '../../types';
import {
  X,
  Calendar as CalIcon,
  Palette,
  Users,
  Globe,
  Loader2,
  Check,
  Trash2,
} from 'lucide-react';

interface EditCalendarModalProps {
  calendar: Calendar | null;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#FF4FA3',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#3B82F6',
  '#EF4444',
  '#14B8A6',
];

export const EditCalendarModal: React.FC<EditCalendarModalProps> = ({
  calendar,
  isOpen,
  onClose,
}) => {
  const { updateCalendar, deleteCalendar } = useCalendar();
  const { members } = useFamily();
  const { hasPermission, isAdmin } = useAuth();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#FF4FA3');
  const [memberId, setMemberId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDeleteCalendar = (isAdmin || hasPermission('calendar_delete')) && calendar?.is_default !== 1;
  const canAssignCalendar = isAdmin || hasPermission('calendar_assign');

  useEffect(() => {
    if (calendar && isOpen) {
      setName(calendar.name);
      setColor(calendar.color || '#FF4FA3');
      setMemberId(calendar.member_id || '');
      setError(null);
    }
  }, [calendar, isOpen]);

  if (!isOpen || !calendar) return null;

  const activeMembers = members.filter((m) => m.is_active !== 0);
  const isGoogle = calendar.source === 'google';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Calendar name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateCalendar(calendar.id, {
        name: name.trim(),
        color,
        member_id: canAssignCalendar ? (memberId || null) : calendar.member_id,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update calendar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${calendar.name}"? All events on this calendar will also be removed.`)) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteCalendar(calendar.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete calendar.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      id="edit-calendar-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="edit-calendar-dialog"
        className="relative bg-[#121620] border border-[#242C3D] rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#242C3D]">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full shadow-xs shrink-0"
              style={{ backgroundColor: color }}
            />
            <h3 className="text-lg font-bold text-white tracking-tight">Edit Calendar</h3>
            {isGoogle && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Globe className="w-2.5 h-2.5" /> Google Synced
              </span>
            )}
          </div>
          <button
            id="close-edit-calendar-button"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#1A202C] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Name input */}
          <div>
            <label
              htmlFor="edit-cal-name-input"
              className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5"
            >
              <CalIcon className="w-3.5 h-3.5 text-[#FF4FA3]" /> Calendar Name
            </label>
            <input
              id="edit-cal-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dad's Work, School, Family..."
              className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4FA3] transition-colors"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#FF4FA3]" /> Color
            </label>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                    color === c
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121620] scale-110'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />}
                </button>
              ))}
            </div>
          </div>

          {/* Assigned Member dropdown */}
          {canAssignCalendar && (
            <div>
              <label
                htmlFor="edit-cal-member-select"
                className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-[#FF4FA3]" /> Assigned Member
              </label>
              <select
                id="edit-cal-member-select"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full bg-[#1A202C] border border-[#242C3D] text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FF4FA3] cursor-pointer font-medium"
              >
                <option value="">Shared Household</option>
                {activeMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role.charAt(0).toUpperCase() + m.role.slice(1)})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                Assign to a specific member or leave as Shared Household.
              </p>
            </div>
          )}

          {/* Google Calendar Informational Banner */}
          {isGoogle && (
            <div className="p-3 rounded-2xl bg-[#0E111A] border border-[#242C3D]/60 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-gray-300 font-medium">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Google Calendar Details</span>
              </div>
              <p className="text-[11px] text-gray-400 break-all font-mono">
                ID: {calendar.google_calendar_id || calendar.id}
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                The friendly name chosen here customizes how this calendar is displayed across
                FamilyCal. Your Google account connection and event sync remain unchanged.
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#242C3D]">
            {canDeleteCalendar ? (
              <button
                id="delete-calendar-button"
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                id="cancel-edit-calendar-button"
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#1A202C] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                id="save-calendar-button"
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF4FA3] hover:bg-[#e63e90] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-[#FF4FA3]/20"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
