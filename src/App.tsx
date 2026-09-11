import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FamilyProvider } from './context/FamilyContext';
import { CalendarProvider, useCalendar } from './context/CalendarContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { CalendarHeader } from './components/calendar/CalendarHeader';
import { MonthView } from './components/calendar/MonthView';
import { WeekView } from './components/calendar/WeekView';
import { DayView } from './components/calendar/DayView';
import { AgendaView } from './components/calendar/AgendaView';
import { EventModal } from './components/calendar/EventModal';
import { TasksView } from './components/tasks/TasksView';
import { BirthdaysView } from './components/birthdays/BirthdaysView';
import { FamilyView } from './components/family/FamilyView';
import { IntegrationsView } from './components/settings/IntegrationsView';
import { AuthModal } from './components/auth/AuthModal';
import { Loader2 } from 'lucide-react';

function CalendarContainer() {
  const { viewMode } = useCalendar();

  return (
    <div className="flex flex-col flex-1 h-full gap-4">
      <CalendarHeader />
      <div className="flex-1 flex flex-col min-h-0">
        {viewMode === 'month' && <MonthView />}
        {viewMode === 'week' && <WeekView />}
        {viewMode === 'day' && <DayView />}
        {viewMode === 'agenda' && <AgendaView />}
      </div>
    </div>
  );
}

function MainDashboard() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'calendar' | 'tasks' | 'birthdays' | 'family' | 'settings'>('calendar');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0D13]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#FF4FA3] animate-spin" />
          <span className="text-xs text-gray-400 font-medium">Loading Yimly FamilyCal...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div id="yimly-app-root" className="flex flex-col h-screen bg-[#0B0D13] text-gray-100 font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar on Calendar & Overview tabs */}
        {activeTab === 'calendar' && <Sidebar />}

        {/* Dynamic Center Stage */}
        <main
          id="main-stage-content"
          className="flex-1 flex flex-col overflow-y-auto p-3 sm:p-5 pb-20 md:pb-5 bg-[#0B0D13]"
        >
          {activeTab === 'calendar' && <CalendarContainer />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'birthdays' && <BirthdaysView />}
          {activeTab === 'family' && <FamilyView />}
          {activeTab === 'settings' && <IntegrationsView />}
        </main>
      </div>

      {/* Global Event Modal for Add / Edit */}
      <EventModal />

      {/* Bottom Navigation for Mobile Devices */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <FamilyProvider>
        <CalendarProvider>
          <MainDashboard />
        </CalendarProvider>
      </FamilyProvider>
    </AuthProvider>
  );
}

export default App;
