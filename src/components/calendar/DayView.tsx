import React from 'react';
import {
  format,
  isSameDay,
  setHours,
  setMinutes,
  differenceInMinutes,
} from 'date-fns';
import { useCalendar } from '../../context/CalendarContext';
import { useFamily } from '../../context/FamilyContext';
import { MapPin, Repeat, Globe, Clock, FileText, User } from 'lucide-react';

export const DayView: React.FC = () => {
  const { currentDate, filteredEvents, openCreateEventModal, openEditEventModal } = useCalendar();
  const { members } = useFamily();

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const dayEvents = filteredEvents.filter((evt) => {
    const evtStart = new Date(evt.start_time);
    const evtEnd = new Date(evt.end_time);
    return isSameDay(evtStart, currentDate) || (currentDate >= evtStart && currentDate <= evtEnd);
  });

  return (
    <div id="calendar-day-view" className="flex flex-col flex-1 bg-[#0B0D13] rounded-2xl border border-[#242C3D]/60 overflow-hidden shadow-md">
      {/* Day Title Bar */}
      <div className="py-4 px-6 border-b border-[#242C3D]/60 bg-[#121620] flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'} planned for today
          </p>
        </div>

        <button
          onClick={() => openCreateEventModal(currentDate)}
          className="px-4 py-2 rounded-xl bg-[#FF4FA3] hover:bg-[#e63e90] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          + Add Today's Event
        </button>
      </div>

      {/* Hourly Schedule Stream */}
      <div className="flex-1 overflow-y-auto max-h-[640px] p-4 space-y-3 bg-[#0B0D13] scrollbar-thin scrollbar-thumb-[#242C3D]">
        {dayEvents.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <p className="text-base font-semibold text-gray-400">No scheduled events for this day.</p>
            <p className="text-xs text-gray-600 mt-1">Tap the button above or any time slot to schedule family activities.</p>
          </div>
        ) : (
          dayEvents.map((evt) => {
            const startD = new Date(evt.start_time);
            const endD = new Date(evt.end_time);
            const assignedMembers = members.filter((m) =>
              evt.assigned_member_ids?.includes(m.id)
            );
            const isGoogle = evt.google_event_id || evt.calendar_source === 'google';

            return (
              <div
                key={evt.id}
                id={`day-event-card-${evt.id}`}
                onClick={() => openEditEventModal(evt)}
                className="p-4 rounded-2xl bg-[#121620] hover:bg-[#181F2E] border border-[#242C3D] hover:border-[#FF4FA3]/40 transition-all cursor-pointer shadow-sm relative overflow-hidden group"
              >
                {/* Accent line on left */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: evt.color || '#FF4FA3' }}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white group-hover:text-[#FF4FA3] transition-colors">
                      {evt.title}
                    </h4>
                    {evt.recurring_rule !== 'none' && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                        <Repeat className="w-2.5 h-2.5 text-[#FF4FA3]" /> {evt.recurring_rule}
                      </span>
                    )}
                    {isGoogle && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Globe className="w-2.5 h-2.5" /> Google
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#FF4FA3]" />
                    <span>
                      {evt.all_day
                        ? 'All Day'
                        : `${format(startD, 'h:mm a')} – ${format(endD, 'h:mm a')}`}
                    </span>
                  </div>
                </div>

                {evt.description && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-[#242C3D]/50 text-xs">
                  {evt.location ? (
                    <div className="flex items-center gap-1 text-gray-400">
                      <MapPin className="w-3.5 h-3.5 text-[#FF4FA3]" />
                      <span>{evt.location}</span>
                    </div>
                  ) : (
                    <span />
                  )}

                  {assignedMembers.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500 font-medium">Assigned:</span>
                      <div className="flex items-center gap-1.5">
                        {assignedMembers.map((m) => (
                          <span
                            key={m.id}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-white"
                            style={{ backgroundColor: `${m.color}25`, borderColor: m.color, borderWidth: '1px' }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
