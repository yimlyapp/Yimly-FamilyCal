import React, { useState } from 'react';
import { format, isToday, isTomorrow, isPast, isSameDay } from 'date-fns';
import { useCalendar } from '../../context/CalendarContext';
import { useFamily } from '../../context/FamilyContext';
import { CalendarEvent } from '../../types';
import { MapPin, Clock, Search, Globe, Repeat, Calendar as CalIcon } from 'lucide-react';

export const AgendaView: React.FC = () => {
  const { filteredEvents, openEditEventModal, openCreateEventModal } = useCalendar();
  const { members } = useFamily();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter events based on search query
  const searchedEvents = filteredEvents.filter((evt) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      evt.title.toLowerCase().includes(query) ||
      (evt.description && evt.description.toLowerCase().includes(query)) ||
      (evt.location && evt.location.toLowerCase().includes(query))
    );
  });

  // Sort upcoming
  searchedEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Group by Day Date String (yyyy-MM-dd)
  const groupedEvents: Record<string, CalendarEvent[]> = {};
  for (const evt of searchedEvents) {
    const key = format(new Date(evt.start_time), 'yyyy-MM-dd');
    if (!groupedEvents[key]) {
      groupedEvents[key] = [];
    }
    groupedEvents[key].push(evt);
  }

  const dateKeys = Object.keys(groupedEvents);

  const getDayHeading = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'EEEE, MMMM d, yyyy');
  };

  return (
    <div id="calendar-agenda-view" className="flex flex-col flex-1 bg-[#0B0D13] rounded-2xl border border-[#242C3D]/60 overflow-hidden shadow-md">
      {/* Search Header */}
      <div className="p-4 border-b border-[#242C3D]/60 bg-[#121620] flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="agenda-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search family events, places, notes..."
            className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4FA3] transition-colors"
          />
        </div>

        <button
          onClick={() => openCreateEventModal()}
          className="px-4 py-2 rounded-xl bg-[#FF4FA3] hover:bg-[#e63e90] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          + Add Event
        </button>
      </div>

      {/* Events Stream */}
      <div className="flex-1 overflow-y-auto max-h-[640px] p-4 space-y-6 bg-[#0B0D13] scrollbar-thin scrollbar-thumb-[#242C3D]">
        {dateKeys.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <CalIcon className="w-10 h-10 mx-auto text-gray-600 mb-2" />
            <p className="text-sm font-semibold text-gray-400">No events found matching criteria.</p>
          </div>
        ) : (
          dateKeys.map((dateKey) => {
            const dayEvents = groupedEvents[dateKey];
            const dateObj = new Date(dateKey + 'T00:00:00');
            const isDayToday = isToday(dateObj);

            return (
              <div key={dateKey} className="space-y-2">
                {/* Date Group Heading */}
                <div className="flex items-center gap-2 sticky top-0 bg-[#0B0D13]/90 backdrop-blur-xs py-1 z-10">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      isDayToday ? 'bg-[#FF4FA3] text-white shadow-xs' : 'bg-[#181F2E] text-gray-300'
                    }`}
                  >
                    {getDayHeading(dateKey)}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    {format(dateObj, 'MMM d, yyyy')}
                  </span>
                  <div className="flex-1 h-[1px] bg-[#242C3D]/50" />
                </div>

                {/* Event Cards */}
                <div className="space-y-2 pl-2">
                  {dayEvents.map((evt) => {
                    const startD = new Date(evt.start_time);
                    const endD = new Date(evt.end_time);
                    const assignedMembers = members.filter((m) =>
                      evt.assigned_member_ids?.includes(m.id)
                    );
                    const isGoogle = evt.google_event_id || evt.calendar_source === 'google';

                    return (
                      <div
                        key={evt.id}
                        id={`agenda-evt-${evt.id}`}
                        onClick={() => openEditEventModal(evt)}
                        className="p-3.5 rounded-xl bg-[#121620] hover:bg-[#181F2E] border border-[#242C3D] hover:border-[#FF4FA3]/40 transition-all cursor-pointer shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-3 h-3 rounded-full mt-1 shrink-0"
                            style={{ backgroundColor: evt.color || '#FF4FA3' }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white group-hover:text-[#FF4FA3] transition-colors">
                                {evt.title}
                              </h4>
                              {evt.recurring_rule !== 'none' && (
                                <Repeat className="w-3 h-3 text-gray-400" />
                              )}
                              {isGoogle && (
                                <Globe className="w-3 h-3 text-blue-400" title="Google Synced" />
                              )}
                            </div>
                            {evt.description && (
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                {evt.description}
                              </p>
                            )}
                            {evt.location && (
                              <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                                <MapPin className="w-3 h-3 text-[#FF4FA3]" />
                                <span>{evt.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                          <span className="text-xs font-mono text-gray-300">
                            {evt.all_day
                              ? 'All day'
                              : `${format(startD, 'h:mm a')} - ${format(endD, 'h:mm a')}`}
                          </span>

                          {assignedMembers.length > 0 && (
                            <div className="flex items-center gap-1">
                              {assignedMembers.map((m) => (
                                <span
                                  key={m.id}
                                  className="w-4 h-4 rounded-full border border-[#181F2E] text-[9px] flex items-center justify-center font-bold text-white"
                                  style={{ backgroundColor: m.color }}
                                  title={m.name}
                                >
                                  {m.name.slice(0, 1)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
