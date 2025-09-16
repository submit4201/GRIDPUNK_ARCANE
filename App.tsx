import React from 'react';
import { Page } from './types';
import DailyPage from './pages/DailyPage';
import ReadingsPage from './pages/ReadingsPage';
import JournalPage from './pages/JournalPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';
import GuidePage from './pages/GuidePage';
import { HomeIcon, CardsIcon, JournalIcon, BarChartIcon, UserIcon, CompassIcon } from './components/icons';
import { AppProvider, useApp } from './context/AppContext';

const navItems = [
  { name: 'Daily', icon: HomeIcon, page: 'Daily' as Page },
  { name: 'Readings', icon: CardsIcon, page: 'Readings' as Page },
  { name: 'Journal', icon: JournalIcon, page: 'Journal' as Page },
  { name: 'Guide', icon: CompassIcon, page: 'Guide' as Page },
  { name: 'Progress', icon: BarChartIcon, page: 'Progress' as Page },
  { name: 'Profile', icon: UserIcon, page: 'Profile' as Page },
];

const Sidebar: React.FC<{ activePage: Page; setPage: (page: Page) => void }> = ({ activePage, setPage }) => (
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

const BottomNav: React.FC<{ activePage: Page; setPage: (page: Page) => void }> = ({ activePage, setPage }) => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111218]/80 backdrop-blur-lg border-t border-[#232533] flex justify-around">
    {navItems.map(item => (
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

const pageComponents: { [key in Page]: React.ComponentType<any> } = {
  Daily: DailyPage,
  Readings: ReadingsPage,
  Journal: JournalPage,
  Guide: GuidePage,
  Progress: ProgressPage,
  Profile: ProfilePage,
  Onboarding: OnboardingPage,
};

// FIX: Merged MainApp into AppContent to consume navigation state from the context.
const AppContent: React.FC = () => {
    const { isOnboarded, activePage, setPage } = useApp();

    if (!isOnboarded) {
        return <OnboardingPage />;
    }

    const ActivePageComponent = pageComponents[activePage];
  
    return (
      <div className="w-screen h-screen flex bg-[#0B0C10] text-text-primary overflow-hidden">
        <Sidebar activePage={activePage} setPage={setPage} />
        <main className="flex-1 overflow-hidden pb-16 md:pb-0">
          <ActivePageComponent setPage={setPage} />
        </main>
        <BottomNav activePage={activePage} setPage={setPage} />
      </div>
    );
}

const App: React.FC = () => {
  return (
    <AppProvider>
        <AppContent />
    </AppProvider>
  );
};

export default App;