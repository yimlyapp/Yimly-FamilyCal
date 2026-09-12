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
import { PastelColorPicker, getPastelColorInfo } from '../../utils/colors';

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
  const [color, setColor] = useState('#F8BBD0');
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
      setColor(selectedEvent.color || '#F8BBD0');
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
        setColor(defaultCal.color || '#F8BBD0');
        if (defaultCal.member_id) {
          setAssignedMemberIds([defaultCal.member_id]);
        } else {
          setAssignedMemberIds([]);
        }
      } else {
        setColor('#F8BBD0');
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
  const colorInfo = getPastelColorInfo(color);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeEventModal();
      }}
    >
      <div
        id="event-modal-dialog"
        className="relative bg-white border border-gray-200 rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 max-h-[92vh] overflow-y-auto"
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div
              className="w-4 h-4 rounded-full shadow-2xs border shrink-0"
              style={{ backgroundColor: colorInfo.hex, borderColor: colorInfo.borderHex }}
            />
            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight font-serif">
              {selectedEvent ? (canSave ? 'Edit Event' : 'Event Details') : 'New Event'}
            </h3>
            {isGoogle && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <Globe className="w-2.5 h-2.5" /> Google
              </span>
            )}
          </div>
          <button
            onClick={closeEventModal}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
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
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors disabled:opacity-70 font-medium"
            />
          </div>

          {/* Calendar Select & 15-Color Palette */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <CalIcon className="w-3.5 h-3.5 text-gray-500" /> Calendar
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
                    setColor(selectedCal.color || '#F8BBD0');
                    if (!selectedEvent && selectedCal.member_id) {
                      setAssignedMemberIds([selectedCal.member_id]);
                    }
                  }
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-gray-900 cursor-pointer disabled:opacity-70 font-medium"
              >
                {calendars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.member_name ? `(${c.member_name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 15 Pastel Color Swatches */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-gray-500" /> Color Accent (15 Pastel Shades)
              </label>
              <PastelColorPicker
                selectedColor={color}
                onSelectColor={setColor}
                disabled={!canSave}
              />
            </div>
          </div>

          {/* Assigned Family Members Chips */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-500" /> Assigned Family Members
            </label>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => {
                const isAssigned = assignedMemberIds.includes(m.id);
                const mColorInfo = getPastelColorInfo(m.color);

                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={!canSave}
                    onClick={() => toggleMemberAssignment(m.id)}
                    style={{
                      backgroundColor: isAssigned ? mColorInfo.hex : '#F8FAFC',
                      borderColor: isAssigned ? mColorInfo.borderHex : '#E2E8F0',
                      color: isAssigned ? mColorInfo.textHex : '#64748B',
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs border font-medium transition-all cursor-pointer shadow-2xs ${
                      isAssigned ? 'font-bold ring-1 ring-black/10' : 'hover:border-gray-300'
                    } disabled:opacity-70`}
                  >
                    <span
                      className="w-2 h-2 rounded-full border"
                      style={{ backgroundColor: mColorInfo.dotHex, borderColor: mColorInfo.borderHex }}
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
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-500" /> Time & Schedule
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium">
                <input
                  type="checkbox"
                  disabled={!canSave}
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span>All Day</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-gray-500 font-semibold block mb-1">Start</span>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    required
                    disabled={!canSave}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900"
                  />
                  {!allDay && (
                    <input
                      type="time"
                      required
                      disabled={!canSave}
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-28 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 font-mono"
                    />
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 font-semibold block mb-1">End</span>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    required
                    disabled={!canSave}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900"
                  />
                  {!allDay && (
                    <input
                      type="time"
                      required
                      disabled={!canSave}
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-28 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 font-mono"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recurrence Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-gray-500" /> Repeat
              </label>
              <select
                value={recurringRule}
                disabled={!canSave}
                onChange={(e) => setRecurringRule(e.target.value as RecurrenceRule)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-gray-900 cursor-pointer disabled:opacity-70 font-medium"
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Repeat Until
                </label>
                <input
                  type="date"
                  disabled={!canSave}
                  value={recurringUntil}
                  onChange={(e) => setRecurringUntil(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-500" /> Location
            </label>
            <input
              id="event-location-input"
              type="text"
              disabled={!canSave}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Home, School Gym, Central Park..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 disabled:opacity-70"
            />
          </div>

          {/* Description Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-gray-500" /> Notes & Details
            </label>
            <textarea
              id="event-description-input"
              rows={3}
              disabled={!canSave}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, packing list, or notes for the family..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 resize-none disabled:opacity-70"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {selectedEvent && canDelete ? (
              <button
                type="button"
                id="event-delete-btn"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
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
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                {canSave ? 'Cancel' : 'Close'}
              </button>
              {canSave && (
                <button
                  type="submit"
                  id="event-save-btn"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
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
