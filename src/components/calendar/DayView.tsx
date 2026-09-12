import React from 'react';
import {
  format,
  isSameDay,
} from 'date-fns';
import { useCalendar } from '../../context/CalendarContext';
import { useFamily } from '../../context/FamilyContext';
import { MapPin, Repeat, Globe, Clock, Plus } from 'lucide-react';
import { getPastelColorInfo, getEventTypeInfo } from '../../utils/colors';

export const DayView: React.FC = () => {
  const { currentDate, filteredEvents, eventTypes, openCreateEventModal, openEditEventModal } = useCalendar();
  const { members } = useFamily();

  const dayEvents = filteredEvents.filter((evt) => {
    const evtStart = new Date(evt.start_time);
    const evtEnd = new Date(evt.end_time);
    return isSameDay(evtStart, currentDate) || (currentDate >= evtStart && currentDate <= evtEnd);
  });

  return (
    <div id="calendar-day-view" className="flex flex-col flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
      {/* Day Title Bar */}
      <div className="py-4 px-6 border-b border-gray-200 bg-gray-50/75 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight font-serif">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'} planned for this day
          </p>
        </div>

        <button
          onClick={() => openCreateEventModal(currentDate)}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Daily Schedule Stream */}
      <div className="flex-1 overflow-y-auto max-h-[640px] p-4 pb-calendar-mobile md:pb-4 space-y-3 bg-white scrollbar-thin">
        {dayEvents.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm font-semibold text-gray-600">No scheduled events for this day.</p>
            <p className="text-xs text-gray-400 mt-1">Tap the button above to schedule family activities.</p>
          </div>
        ) : (
          dayEvents.map((evt) => {
            const startD = new Date(evt.start_time);
            const endD = new Date(evt.end_time);
            const assignedMember = members.find((m) =>
              evt.assigned_member_ids?.includes(m.id)
            );
            const memberColor = assignedMember?.color || evt.member_color || evt.color;
            const colorInfo = getPastelColorInfo(memberColor);
            const eventType = getEventTypeInfo(evt.title, evt.event_type, eventTypes);
            const memberName = assignedMember?.name || evt.member_name || 'Family';
            const isGoogle = evt.google_event_id || evt.calendar_source === 'google';

            return (
              <div
                key={evt.id}
                id={`day-event-card-${evt.id}`}
                onClick={() => openEditEventModal(evt)}
                style={{
                  backgroundColor: colorInfo.hex,
                  borderColor: colorInfo.borderHex,
                }}
                className="p-4 rounded-2xl border shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col gap-2.5 group"
              >
                {/* Top Row: Member Avatar & Name + Event Type Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs shrink-0 text-white"
                      style={{ backgroundColor: colorInfo.dotHex }}
                    >
                      {memberName.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-800 tracking-tight">
                      {memberName}
                    </span>
                  </div>

                  {/* Predefined Event Type Badge */}
                  <div
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white flex items-center gap-1 shadow-2xs shrink-0"
                    style={{ backgroundColor: eventType.bgHex }}
                  >
                    <span>{eventType.icon}</span>
                    <span>{eventType.name}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-900 transition-colors">
                      {evt.title}
                    </h4>
                    {evt.recurring_rule !== 'none' && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/5 border border-black/10 text-slate-700">
                        <Repeat className="w-2.5 h-2.5" /> {evt.recurring_rule}
                      </span>
                    )}
                    {isGoogle && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-900">
                        <Globe className="w-2.5 h-2.5" /> Google
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 opacity-90">
                    <Clock className="w-3.5 h-3.5 opacity-70" />
                    <span>
                      {evt.all_day
                        ? 'All Day'
                        : `${format(startD, 'h:mm a')} – ${format(endD, 'h:mm a')}`}
                    </span>
                  </div>
                </div>

                {evt.description && (
                  <p className="text-xs text-slate-700 opacity-90 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                )}

                {evt.location && (
                  <div className="flex items-center gap-1 text-xs text-slate-600 opacity-80 pt-1 border-t border-black/5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{evt.location}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
