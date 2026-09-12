import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { useCalendar } from '../../context/CalendarContext';
import { useFamily } from '../../context/FamilyContext';
import { CalendarEvent } from '../../types';
import { getPastelColorInfo, getEventTypeInfo } from '../../utils/colors';
import { Plus, ChevronRight } from 'lucide-react';

export const MonthView: React.FC = () => {
  const {
    currentDate,
    setCurrentDate,
    filteredEvents,
    openCreateEventModal,
    openEditEventModal,
  } = useCalendar();
  const { members } = useFamily();

  const [selectedDay, setSelectedDay] = useState<Date>(currentDate);

  // Month Grid Calculation (Monday to Sunday weekStartsOn: 1)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (dayDate: Date) => {
    return filteredEvents.filter((evt) => {
      const evtStart = new Date(evt.start_time);
      const evtEnd = new Date(evt.end_time);

      if (isSameDay(evtStart, dayDate) || (dayDate >= evtStart && dayDate <= evtEnd)) return true;

      if (evt.recurring_rule === 'daily' && dayDate >= evtStart) {
        if (!evt.recurring_until || dayDate <= new Date(evt.recurring_until)) return true;
      }
      if (evt.recurring_rule === 'weekly' && dayDate >= evtStart) {
        if (dayDate.getDay() === evtStart.getDay()) {
          if (!evt.recurring_until || dayDate <= new Date(evt.recurring_until)) return true;
        }
      }
      if (evt.recurring_rule === 'monthly' && dayDate >= evtStart) {
        if (dayDate.getDate() === evtStart.getDate()) {
          if (!evt.recurring_until || dayDate <= new Date(evt.recurring_until)) return true;
        }
      }
      if (evt.recurring_rule === 'yearly' && dayDate >= evtStart) {
        if (dayDate.getMonth() === evtStart.getMonth() && dayDate.getDate() === evtStart.getDate()) {
          if (!evt.recurring_until || dayDate <= new Date(evt.recurring_until)) return true;
        }
      }

      return false;
    });
  };

  const selectedDayEvents = getEventsForDay(selectedDay);

  return (
    <div id="calendar-month-view" className="flex flex-col flex-1 gap-4">
      {/* --- DESKTOP MONTH VIEW (Matching Reference Bottom-Left Layout) --- */}
      <div className="hidden md:flex flex-col flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        {/* 7 Days Headers Bar */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/70 text-center text-xs font-bold text-gray-600 py-3 select-none">
          <div>Monday</div>
          <div>Tuesday</div>
          <div>Wednesday</div>
          <div>Thursday</div>
          <div>Friday</div>
          <div>Saturday</div>
          <div>Sunday</div>
        </div>

        {/* 7-Column Days Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-gray-100 bg-gray-50/20">
          {days.map((dayDate) => {
            const isCurrentMonth = isSameMonth(dayDate, monthStart);
            const isDayToday = isToday(dayDate);
            const isSelected = isSameDay(dayDate, selectedDay);
            const dayEvents = getEventsForDay(dayDate);
            const maxVisibleEvents = 2;
            const hasOverflow = dayEvents.length > maxVisibleEvents;
            const visibleEvents = dayEvents.slice(0, maxVisibleEvents);

            return (
              <div
                key={dayDate.toISOString()}
                onClick={() => setSelectedDay(dayDate)}
                className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors cursor-pointer select-none relative ${
                  !isCurrentMonth ? 'bg-gray-50/40 text-gray-300' : 'bg-white text-gray-800'
                } ${isSelected ? 'ring-2 ring-blue-500/80 ring-inset bg-blue-50/20' : ''}`}
              >
                {/* Date Number Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-extrabold flex items-center justify-center rounded-lg w-6 h-6 ${
                      isDayToday
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-gray-300'
                    }`}
                  >
                    {format(dayDate, 'd')}
                  </span>
                </div>

                {/* Event Pills inside day cell */}
                <div className="flex flex-col gap-1 my-1 flex-1 overflow-hidden">
                  {visibleEvents.map((evt) => {
                    const assignedMember = members.find((m) =>
                      evt.assigned_member_ids?.includes(m.id)
                    );
                    const memberColor = assignedMember?.color || evt.member_color || evt.color;
                    const colorInfo = getPastelColorInfo(memberColor);
                    const eventType = getEventTypeInfo(evt.title);

                    return (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditEventModal(evt);
                        }}
                        style={{
                          backgroundColor: colorInfo.hex,
                          borderColor: colorInfo.borderHex,
                        }}
                        className="px-2 py-1 rounded-lg border text-[11px] font-bold text-slate-800 truncate flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        <span className="text-[10px] shrink-0">{eventType.icon}</span>
                        <span className="truncate">{evt.title}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Overflow +X more link */}
                {hasOverflow && (
                  <div className="text-[11px] font-bold text-blue-600 hover:underline pl-0.5 pt-0.5">
                    +{dayEvents.length - maxVisibleEvents} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MOBILE MONTH VIEW (Matching Reference Far-Right Layout) --- */}
      <div className="flex md:hidden flex-col gap-4">
        {/* Mobile 7-Column Calendar Grid */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-2xs">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-gray-400 py-1">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-2 text-center pt-2">
            {days.map((dayDate) => {
              const isCurrentMonth = isSameMonth(dayDate, monthStart);
              const isSelected = isSameDay(dayDate, selectedDay);
              const dayEvents = getEventsForDay(dayDate);

              return (
                <button
                  key={dayDate.toISOString()}
                  onClick={() => setSelectedDay(dayDate)}
                  className="flex flex-col items-center justify-center p-1 cursor-pointer focus:outline-none"
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                        : isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-gray-300'
                    }`}
                  >
                    {format(dayDate, 'd')}
                  </span>

                  {/* Member Color Dots under date */}
                  <div className="flex items-center gap-0.5 h-2 mt-0.5">
                    {dayEvents.slice(0, 3).map((evt) => {
                      const assignedMember = members.find((m) =>
                        evt.assigned_member_ids?.includes(m.id)
                      );
                      const colorInfo = getPastelColorInfo(
                        assignedMember?.color || evt.member_color || evt.color
                      );
                      return (
                        <span
                          key={evt.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: colorInfo.dotHex }}
                        />
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Section */}
        <div className="flex flex-col gap-3 pt-1">
          <h3 className="text-base font-bold text-slate-900 px-1">
            {format(selectedDay, 'EEEE, d MMMM')}
          </h3>

          <div className="flex flex-col gap-2.5">
            {selectedDayEvents.length === 0 ? (
              <div className="py-4 px-4 rounded-2xl bg-white border border-dashed border-gray-200 text-gray-400 text-xs font-medium text-center">
                No events scheduled for this date
              </div>
            ) : (
              selectedDayEvents.map((evt) => {
                const assignedMember = members.find((m) =>
                  evt.assigned_member_ids?.includes(m.id)
                );
                const memberColor = assignedMember?.color || evt.member_color || evt.color;
                const colorInfo = getPastelColorInfo(memberColor);
                const eventType = getEventTypeInfo(evt.title);
                const memberName = assignedMember?.name || evt.member_name || 'Family';

                return (
                  <div
                    key={evt.id}
                    onClick={() => openEditEventModal(evt)}
                    style={{
                      backgroundColor: colorInfo.hex,
                      borderColor: colorInfo.borderHex,
                    }}
                    className="p-3.5 rounded-2xl border shadow-2xs active:scale-98 transition-transform cursor-pointer flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-2xs shrink-0"
                          style={{ backgroundColor: colorInfo.dotHex }}
                        >
                          {memberName.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {memberName}
                        </span>
                      </div>

                      <div
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-0.5 shadow-2xs"
                        style={{ backgroundColor: eventType.bgHex }}
                      >
                        <span>{eventType.icon}</span>
                        <span>{eventType.name}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {evt.title}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-600 block mt-0.5">
                        {evt.all_day
                          ? 'All Day'
                          : `${format(new Date(evt.start_time), 'h:mm a')} – ${format(
                              new Date(evt.end_time),
                              'h:mm a'
                            )}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
