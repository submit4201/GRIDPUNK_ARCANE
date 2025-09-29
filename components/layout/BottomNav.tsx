import React from 'react';
import { Page } from '../../types';
import { HomeIcon, CardsIcon, JournalIcon, UserIcon, SettingsIcon } from '../icons';

const bottomNavItems = [
    { name: 'Daily', icon: HomeIcon, page: 'Daily' as Page },
    { name: 'Readings', icon: CardsIcon, page: 'Readings' as Page },
    { name: 'Journal', icon: JournalIcon, page: 'Journal' as Page },
    { name: 'Profile', icon: UserIcon, page: 'Profile' as Page },
    { name: 'Settings', icon: SettingsIcon, page: 'Settings' as Page },
];

interface BottomNavProps {
    activePage: Page;
    setPage: (page: Page) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setPage }) => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111218]/80 backdrop-blur-lg border-t border-[#232533] flex justify-around">
      {bottomNavItems.map(item => (
        <button
          key={item.name}
          onClick={() => setPage(item.page)}
          className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${
            activePage === item.page ? 'text-[#6E7BFF]' : 'text-text-muted hover:text-white'
          }`}
        >
          <item.icon className="w-6 h-6" />
          <span className="text-xs">{item.name}</span>
        </button>
      ))}
    </nav>
  );

export default BottomNav;