import React from 'react';
import { Page } from '../../types';
import { HomeIcon, CardsIcon, JournalIcon, BarChartIcon, UserIcon, CompassIcon, SettingsIcon } from '../icons';

const navItems = [
  { name: 'Daily', icon: HomeIcon, page: 'Daily' as Page },
  { name: 'Readings', icon: CardsIcon, page: 'Readings' as Page },
  { name: 'Journal', icon: JournalIcon, page: 'Journal' as Page },
  { name: 'Guide', icon: CompassIcon, page: 'Guide' as Page },
  { name: 'Progress', icon: BarChartIcon, page: 'Progress' as Page },
  { name: 'Profile', icon: UserIcon, page: 'Profile' as Page },
  { name: 'Settings', icon: SettingsIcon, page: 'Settings' as Page },
];

interface SidebarProps {
    activePage: Page;
    setPage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setPage }) => (
    <nav className="hidden md:flex flex-col w-64 bg-[#111218] border-r border-[#232533] p-4 space-y-2">
      <div className="px-4 py-2 mb-4">
          <h1 className="text-2xl font-bold font-dm-sans text-white">Gridpunk Arcana</h1>
      </div>
      {navItems.map(item => (
        <button
          key={item.name}
          onClick={() => setPage(item.page)}
          className={`flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors ${
            activePage === item.page
              ? 'bg-[#5A67D8] text-white'
              : 'text-text-muted hover:bg-[#232533] hover:text-white'
          }`}
        >
          <item.icon className="w-6 h-6" />
          <span className="font-semibold">{item.name}</span>
        </button>
      ))}
    </nav>
  );

  export default Sidebar;