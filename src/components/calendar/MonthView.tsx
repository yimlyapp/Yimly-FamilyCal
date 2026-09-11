import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { CalendarEvent } from '../../types';
import { useCalendar } from '../../context/CalendarContext';
import { useFamily } from '../../context/FamilyContext';
import { Repeat, MapPin, Globe } from 'lucide-react';

export const MonthView: React.FC = () => {
  const { currentDate, filteredEvents, openCreateEventModal, openEditEventModal } = useCalendar();
  const { members } = useFamily();
  const [popoverDate, setPopoverDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((evt) => {
      const evtStart = new Date(evt.start_time);
      const evtEnd = new Date(evt.end_time);

      if (isSameDay(evtStart, day)) return true;
      if (day >= evtStart && day <= evtEnd) return true;

      // Handle recurring rule matching for display
      if (evt.recurring_rule === 'daily' && day >= evtStart) {
        if (!evt.recurring_until || day <= new Date(evt.recurring_until)) return true;
      }
      if (evt.recurring_rule === 'weekly' && day >= evtStart) {
        if (day.getDay() === evtStart.getDay()) {
          if (!evt.recurring_until || day <= new Date(evt.recurring_until)) return true;
        }
      }
      if (evt.recurring_rule === 'monthly' && day >= evtStart) {
        if (day.getDate() === evtStart.getDate()) {
          if (!evt.recurring_until || day <= new Date(evt.recurring_until)) return true;
        }
      }
      if (evt.recurring_rule === 'yearly' && day >= evtStart) {
        if (day.getMonth() === evtStart.getMonth() && day.getDate() === evtStart.getDate()) {
          if (!evt.recurring_until || day <= new Date(evt.recurring_until)) return true;
        }
      }

      return false;
    });
  };

  return (
    <div id="calendar-month-view" className="flex flex-col flex-1 bg-[#0B0D13] rounded-2xl border border-[#242C3D]/60 overflow-hidden shadow-md">
      {/* Day Name Headers */}
      <div className="grid grid-cols-7 border-b border-[#242C3D]/60 bg-[#121620]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name, i) => (
          <div
            key={name}
            className="py-2.5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider"
          >
            <span className="hidden sm:inline">{name}</span>
            <span className="sm:hidden">{name.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-[#242C3D]/40 bg-[#0B0D13] min-h-[580px]">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);
          const dayEvents = getEventsForDay(day);
          const maxVisible = 3;
          const visibleEvents = dayEvents.slice(0, maxVisible);
          const overflowCount = dayEvents.length - maxVisible;

          return (
            <div
              key={day.toISOString()}
              id={`month-day-cell-${format(day, 'yyyy-MM-dd')}`}
              onClick={() => openCreateEventModal(day)}
              className={`group relative p-1.5 sm:p-2 transition-colors flex flex-col justify-between cursor-pointer min-h-[95px] sm:min-h-[110px] ${
                isCurrentMonth ? 'bg-[#0E111A]/90 hover:bg-[#151A26]' : 'bg-[#08090D]/80 opacity-40 hover:opacity-75'
              }`}
            >
              {/* Day Header with Number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs sm:text-sm font-semibold flex items-center justify-center rounded-lg transition-transform ${
                    isDayToday
                      ? 'w-6 h-6 sm:w-7 sm:h-7 bg-[#FF4FA3] text-white font-bold shadow-md shadow-[#FF4FA3]/30 scale-105'
                      : isCurrentMonth
                      ? 'text-gray-200'
                      : 'text-gray-500'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {/* Event count dot on mobile if small */}
                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-gray-500 font-medium sm:hidden">
                    {dayEvents.length} evt
                  </span>
                )}
              </div>

              {/* Event Pills List */}
              <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                {visibleEvents.map((evt) => {
                  const assignedMembers = members.filter((m) =>
                    evt.assigned_member_ids?.includes(m.id)
                  );
                  const isGoogle = evt.google_event_id || evt.calendar_source === 'google';

                  return (
                    <div
                      key={evt.id}
                      id={`event-pill-${evt.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditEventModal(evt);
                      }}
                      style={{
                        borderLeftColor: evt.color || '#FF4FA3',
                      }}
                      className="flex items-center justify-between gap-1 px-1.5 py-1 text-[11px] font-medium rounded-md bg-[#181F2E] hover:bg-[#20293D] text-gray-100 border-l-[3px] border-[#242C3D] transition-all truncate group/pill shadow-xs"
                    >
                      <div className="flex items-center gap-1 min-w-0 truncate">
                        {!evt.all_day && (
                          <span className="text-[10px] text-gray-400 font-mono shrink-0">
                            {format(new Date(evt.start_time), 'HH:mm')}
                          </span>
                        )}
                        <span className="truncate font-medium">{evt.title}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {evt.recurring_rule !== 'none' && (
                          <Repeat className="w-2.5 h-2.5 text-gray-400" />
                        )}
                        {isGoogle && (
                          <Globe className="w-2.5 h-2.5 text-blue-400" title="Google Calendar Event" />
                        )}
                        {assignedMembers.length > 0 && (
                          <div className="flex -space-x-1">
                            {assignedMembers.slice(0, 2).map((m) => (
                              <span
                                key={m.id}
                                className="w-3 h-3 rounded-full border border-[#181F2E]"
                                style={{ backgroundColor: m.color }}
                                title={m.name}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* More Events Counter Pill */}
                {overflowCount > 0 && (
                  <button
                    id={`overflow-btn-${format(day, 'yyyy-MM-dd')}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopoverDate(day);
                    }}
                    className="text-[10px] font-semibold text-[#FF4FA3] hover:text-[#ff78b9] text-left px-1 hover:underline cursor-pointer"
                  >
                    +{overflowCount} more...
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overflow Day Modal Popover */}
      {popoverDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#121620] border border-[#242C3D] rounded-2xl p-5 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242C3D]">
              <h3 className="font-bold text-white text-base">
                Events for {format(popoverDate, 'EEEE, MMMM d')}
              </h3>
              <button
                onClick={() => setPopoverDate(null)}
                className="text-gray-400 hover:text-white text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {getEventsForDay(popoverDate).map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => {
                    setPopoverDate(null);
                    openEditEventModal(evt);
                  }}
                  className="p-2.5 rounded-xl bg-[#1A202C] hover:bg-[#242C3D] border border-[#242C3D] text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">{evt.title}</span>
                    <span className="text-[10px] text-gray-400">
                      {evt.all_day ? 'All day' : format(new Date(evt.start_time), 'h:mm a')}
                    </span>
                  </div>
                  {evt.location && (
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                      <MapPin className="w-3 h-3 text-[#FF4FA3]" />
                      <span>{evt.location}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const target = popoverDate;
                setPopoverDate(null);
                openCreateEventModal(target);
              }}
              className="mt-4 w-full py-2 bg-[#FF4FA3] hover:bg-[#e63e90] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              + Add Event for this day
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
