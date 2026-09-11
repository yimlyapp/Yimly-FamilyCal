import React from 'react';
import {
  Calendar,
  CheckSquare,
  Cake,
  Users,
  Settings,
} from 'lucide-react';

interface MobileNavProps {
  activeTab: 'calendar' | 'tasks' | 'birthdays' | 'family' | 'settings';
  setActiveTab: (t: 'calendar' | 'tasks' | 'birthdays' | 'family' | 'settings') => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'birthdays', label: 'Birthdays', icon: Cake },
    { id: 'family', label: 'Household', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0E111A]/95 backdrop-blur-md border-t border-[#242C3D]/80 flex items-center justify-around px-2 z-40"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`mobile-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              isActive ? 'text-[#FF4FA3]' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-semibold mt-1">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
