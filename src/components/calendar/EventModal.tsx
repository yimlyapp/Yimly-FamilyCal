import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarEvent, RecurrenceRule } from '../../types';
import { useCalendar } from '../../context/CalendarContext';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Trash2,
  Calendar as CalIcon,
  Clock,
  MapPin,
  FileText,
  Repeat,
  Users,
  Palette,
  Globe,
} from 'lucide-react';

const PRESET_COLORS = [
  '#FF4FA3', // Yimly Pink
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Rose
  '#3B82F6', // Blue
  '#EF4444', // Red
];

export const EventModal: React.FC = () => {
  const {
    selectedEvent,
    isEventModalOpen,
    eventModalInitialDate,
    closeEventModal,
    calendars,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useCalendar();

  const { members } = useFamily();
  const { hasPermission, isAdmin, canEditEvent, canDeleteEvent } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [color, setColor] = useState('#FF4FA3');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);
  const [recurringRule, setRecurringRule] = useState<RecurrenceRule>('none');
  const [recurringUntil, setRecurringUntil] = useState('');
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = selectedEvent ? canEditEvent(selectedEvent) : (isAdmin || hasPermission('event_create'));
  const canDelete = selectedEvent ? canDeleteEvent(selectedEvent) : false;

  // Initialize form when modal opens or selectedEvent changes
  useEffect(() => {
    if (!isEventModalOpen) return;

    if (selectedEvent) {
      setTitle(selectedEvent.title);
      setDescription(selectedEvent.description || '');
      setLocation(selectedEvent.location || '');
      setCalendarId(selectedEvent.calendar_id);
      setColor(selectedEvent.color || '#FF4FA3');
      setAllDay(Boolean(selectedEvent.all_day));
      setRecurringRule(selectedEvent.recurring_rule || 'none');
      setRecurringUntil(selectedEvent.recurring_until ? selectedEvent.recurring_until.slice(0, 10) : '');
      setAssignedMemberIds(selectedEvent.assigned_member_ids || []);

      const sDate = new Date(selectedEvent.start_time);
      const eDate = new Date(selectedEvent.end_time);
      setStartDate(format(sDate, 'yyyy-MM-dd'));
      setStartTime(format(sDate, 'HH:mm'));
      setEndDate(format(eDate, 'yyyy-MM-dd'));
      setEndTime(format(eDate, 'HH:mm'));
    } else {
      // New Event Defaults
      const baseDate = eventModalInitialDate || new Date();
      const sDateStr = format(baseDate, 'yyyy-MM-dd');
      
      setTitle('');
      setDescription('');
      setLocation('');
      setStartDate(sDateStr);
      setEndDate(sDateStr);
      setStartTime(format(baseDate, 'HH:mm') === '00:00' ? '09:00' : format(baseDate, 'HH:mm'));
      setEndTime('10:00');
      setAllDay(false);
      setRecurringRule('none');
      setRecurringUntil('');
      setAssignedMemberIds([]);

      // Default Calendar & Color
      const defaultCal = calendars.find((c) => c.is_default) || calendars[0];
      if (defaultCal) {
        setCalendarId(defaultCal.id);
        setColor(defaultCal.color || '#FF4FA3');
        if (defaultCal.member_id) {
          setAssignedMemberIds([defaultCal.member_id]);
        } else {
          setAssignedMemberIds([]);
        }
      } else {
        setColor('#FF4FA3');
        setAssignedMemberIds([]);
      }
    }
    setError(null);
  }, [isEventModalOpen, selectedEvent, eventModalInitialDate, calendars]);

  if (!isEventModalOpen) return null;

  const toggleMemberAssignment = (memberId: string) => {
    setAssignedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) {
      setError('You do not have permission to save this event.');
      return;
    }
    if (!title.trim()) {
      setError('Event title is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let startIso: string;
      let endIso: string;

      if (allDay) {
        startIso = `${startDate}T00:00:00Z`;
        endIso = `${endDate || startDate}T23:59:59Z`;
      } else {
        startIso = new Date(`${startDate}T${startTime}:00`).toISOString();
        endIso = new Date(`${endDate || startDate}T${endTime}:00`).toISOString();
      }

      const eventPayload: Partial<CalendarEvent> = {
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        calendar_id: calendarId,
        color,
        start_time: startIso,
        end_time: endIso,
        all_day: allDay,
        recurring_rule: recurringRule,
        recurring_until: recurringUntil ? `${recurringUntil}T23:59:59Z` : null,
        assigned_member_ids: assignedMemberIds,
      };

      if (selectedEvent) {
        await updateEvent(selectedEvent.id, eventPayload);
      } else {
        await createEvent(eventPayload);
      }
      closeEventModal();
    } catch (err: any) {
      setError(err?.message || 'Failed to save event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent || !canDelete) return;
    if (confirm('Are you sure you want to delete this event?')) {
      setIsSubmitting(true);
      try {
        await deleteEvent(selectedEvent.id);
        closeEventModal();
      } catch (err: any) {
        setError(err?.message || 'Failed to delete event.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isGoogle = selectedEvent?.google_event_id || selectedEvent?.calendar_source === 'google';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="event-modal-dialog"
        className="relative bg-[#121620] border border-[#242C3D] rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#242C3D]">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full shadow-xs"
              style={{ backgroundColor: color }}
            />
            <h3 className="text-lg font-bold text-white tracking-tight">
              {selectedEvent ? (canSave ? 'Edit Family Event' : 'Event Details') : 'Create New Event'}
            </h3>
            {isGoogle && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Globe className="w-2.5 h-2.5" /> Google Synced
              </span>
            )}
          </div>
          <button
            onClick={closeEventModal}
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Event Title *
            </label>
            <input
              id="event-title-input"
              type="text"
              required
              disabled={!canSave}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Family Pizza Night, Soccer Practice..."
              className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4FA3] transition-colors disabled:opacity-70"
            />
          </div>

          {/* Calendar Select & Color Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                <CalIcon className="w-3.5 h-3.5 text-[#FF4FA3]" /> Calendar
              </label>
              <select
                id="event-calendar-select"
                value={calendarId}
                disabled={!canSave}
                onChange={(e) => {
                  const newCalId = e.target.value;
                  setCalendarId(newCalId);
                  const selectedCal = calendars.find((c) => c.id === newCalId);
                  if (selectedCal) {
                    setColor(selectedCal.color);
                    if (!selectedEvent && selectedCal.member_id) {
                      setAssignedMemberIds([selectedCal.member_id]);
                    }
                  }
                }}
                className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF4FA3] cursor-pointer disabled:opacity-70"
              >
                {calendars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.member_name ? `(${c.member_name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-[#FF4FA3]" /> Event Color
              </label>
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={!canSave}
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full shrink-0 transition-transform ${
                      color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121620] scale-110' : 'opacity-80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Assigned Family Members Chips */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#FF4FA3]" /> Assigned Family Members
            </label>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => {
                const isAssigned = assignedMemberIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={!canSave}
                    onClick={() => toggleMemberAssignment(m.id)}
                    style={{
                      backgroundColor: isAssigned ? `${m.color}25` : '#1A202C',
                      borderColor: isAssigned ? m.color : '#242C3D',
                      color: isAssigned ? '#FFFFFF' : '#94A3B8',
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition-all cursor-pointer ${
                      isAssigned ? 'font-semibold shadow-xs' : 'hover:border-gray-600'
                    } disabled:opacity-70`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FF4FA3]" /> Time & Schedule
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                <input
                  type="checkbox"
                  disabled={!canSave}
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="rounded bg-[#1A202C] border-[#242C3D] text-[#FF4FA3] focus:ring-[#FF4FA3]"
                />
                <span>All Day</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold block mb-1">Start</span>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    required
                    disabled={!canSave}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
                  />
                  {!allDay && (
                    <input
                      type="time"
                      required
                      disabled={!canSave}
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-28 bg-[#1A202C] border border-[#242C3D] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
                    />
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-semibold block mb-1">End</span>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    required
                    disabled={!canSave}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
                  />
                  {!allDay && (
                    <input
                      type="time"
                      required
                      disabled={!canSave}
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-28 bg-[#1A202C] border border-[#242C3D] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recurrence Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-[#FF4FA3]" /> Repeat
              </label>
              <select
                value={recurringRule}
                disabled={!canSave}
                onChange={(e) => setRecurringRule(e.target.value as RecurrenceRule)}
                className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF4FA3] cursor-pointer disabled:opacity-70"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Every day</option>
                <option value="weekly">Every week</option>
                <option value="monthly">Every month</option>
                <option value="yearly">Every year</option>
              </select>
            </div>

            {recurringRule !== 'none' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Repeat Until
                </label>
                <input
                  type="date"
                  disabled={!canSave}
                  value={recurringUntil}
                  onChange={(e) => setRecurringUntil(e.target.value)}
                  className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF4FA3]" /> Location
            </label>
            <input
              id="event-location-input"
              type="text"
              disabled={!canSave}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Home, School Gym, Central Park..."
              className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4FA3] disabled:opacity-70"
            />
          </div>

          {/* Description Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#FF4FA3]" /> Notes & Details
            </label>
            <textarea
              id="event-description-input"
              rows={3}
              disabled={!canSave}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, packing list, or notes for the family..."
              className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4FA3] resize-none disabled:opacity-70"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#242C3D]">
            {selectedEvent && canDelete ? (
              <button
                type="button"
                id="event-delete-btn"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeEventModal}
                className="px-4 py-2 rounded-xl bg-[#1A202C] hover:bg-[#242C3D] text-gray-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                {canSave ? 'Cancel' : 'Close'}
              </button>
              {canSave && (
                <button
                  type="submit"
                  id="event-save-btn"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#FF4FA3] hover:bg-[#e63e90] text-white text-xs font-bold transition-all shadow-md shadow-[#FF4FA3]/25 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : selectedEvent ? 'Update Event' : 'Create Event'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
