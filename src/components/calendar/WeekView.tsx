import React, { useRef, useEffect } from 'react';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  setHours,
  setMinutes,
  differenceInMinutes,
} from 'date-fns';
import { useCalendar } from '../../context/CalendarContext';
import { useFamily } from '../../context/FamilyContext';
import { Globe, Repeat, MapPin } from 'lucide-react';

export const WeekView: React.FC = () => {
  const { currentDate, filteredEvents, openCreateEventModal, openEditEventModal } = useCalendar();
  const { members } = useFamily();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const start = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Auto-scroll to 8am on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 8 * 60; // 8:00 AM position
    }
  }, []);

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((evt) => {
      const evtStart = new Date(evt.start_time);
      const evtEnd = new Date(evt.end_time);
      return isSameDay(evtStart, day) || (day >= evtStart && day <= evtEnd);
    });
  };

  return (
    <div id="calendar-week-view" className="flex flex-col flex-1 bg-[#0B0D13] rounded-2xl border border-[#242C3D]/60 overflow-hidden shadow-md">
      {/* Week Header: Days & Date Labels */}
      <div className="grid grid-cols-8 border-b border-[#242C3D]/60 bg-[#121620]">
        {/* Time column header */}
        <div className="py-3 text-center text-xs font-semibold text-gray-500 border-r border-[#242C3D]/40">
          GMT
        </div>
        {/* 7 Days Headers */}
        {weekDays.map((day) => {
          const isDayToday = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={`py-2.5 text-center flex flex-col items-center justify-center border-r border-[#242C3D]/40 last:border-r-0 ${
                isDayToday ? 'bg-[#FF4FA3]/10' : ''
              }`}
            >
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                {format(day, 'EEE')}
              </span>
              <span
                className={`text-sm font-bold mt-0.5 flex items-center justify-center rounded-lg w-7 h-7 ${
                  isDayToday ? 'bg-[#FF4FA3] text-white shadow-xs' : 'text-gray-200'
                }`}
              >
                {format(day, 'd')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hourly Grid Scrollable Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto max-h-[640px] divide-y divide-[#242C3D]/30 bg-[#0B0D13] relative scrollbar-thin scrollbar-thumb-[#242C3D]"
      >
        <div className="grid grid-cols-8 relative min-h-[1440px]">
          {/* Time Labels Column */}
          <div className="border-r border-[#242C3D]/40 bg-[#0E111A]">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-[#242C3D]/30 pr-2 text-right text-[11px] font-mono text-gray-500 pt-1 select-none"
              >
                {format(setHours(new Date(), hour), 'HH:00')}
              </div>
            ))}
          </div>

          {/* 7 Days Columns */}
          {weekDays.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isDayToday = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`relative border-r border-[#242C3D]/40 last:border-r-0 ${
                  isDayToday ? 'bg-[#FF4FA3]/5' : ''
                }`}
              >
                {/* 24 Hour Slots */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => {
                      const clickedTime = setMinutes(setHours(day, hour), 0);
                      openCreateEventModal(clickedTime);
                    }}
                    className="h-[60px] border-b border-[#242C3D]/25 hover:bg-[#1A202C]/40 cursor-pointer transition-colors"
                  />
                ))}

                {/* Event Blocks positioned absolutely */}
                {dayEvents.map((evt) => {
                  const startD = new Date(evt.start_time);
                  const endD = new Date(evt.end_time);
                  const startMin = startD.getHours() * 60 + startD.getMinutes();
                  let durationMin = differenceInMinutes(endD, startD);
                  if (durationMin < 25) durationMin = 25;
                  if (evt.all_day) durationMin = 50;

                  const topPx = evt.all_day ? 0 : startMin;
                  const heightPx = evt.all_day ? 45 : durationMin;

                  const assignedMembers = members.filter((m) =>
                    evt.assigned_member_ids?.includes(m.id)
                  );
                  const isGoogle = evt.google_event_id || evt.calendar_source === 'google';

                  return (
                    <div
                      key={evt.id}
                      id={`week-evt-${evt.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditEventModal(evt);
                      }}
                      style={{
                        top: `${topPx}px`,
                        height: `${Math.max(heightPx, 28)}px`,
                        borderLeftColor: evt.color || '#FF4FA3',
                      }}
                      className="absolute inset-x-1 p-1.5 rounded-lg bg-[#181F2E]/95 hover:bg-[#20293D] border-l-4 border-y border-r border-[#242C3D] shadow-md hover:shadow-lg transition-all z-10 cursor-pointer overflow-hidden flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[11px] font-bold text-white truncate leading-tight">
                          {evt.title}
                        </span>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {evt.recurring_rule !== 'none' && (
                            <Repeat className="w-2.5 h-2.5 text-gray-400" />
                          )}
                          {isGoogle && (
                            <Globe className="w-2.5 h-2.5 text-blue-400" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-0.5 font-mono">
                        <span>
                          {evt.all_day ? 'All day' : `${format(startD, 'HH:mm')} - ${format(endD, 'HH:mm')}`}
                        </span>

                        {assignedMembers.length > 0 && (
                          <div className="flex -space-x-1">
                            {assignedMembers.map((m) => (
                              <span
                                key={m.id}
                                className="w-2.5 h-2.5 rounded-full border border-[#181F2E]"
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
