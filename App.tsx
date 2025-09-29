import React, { useEffect } from 'react';
import { Page } from './types';
import DailyPage from './pages/DailyPage';
import ReadingsPage from './pages/ReadingsPage';
import JournalPage from './pages/JournalPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';
import GuidePage from './pages/GuidePage';
import SettingsPage from './pages/SettingsPage';
import { AppProvider, useApp } from './context/AppContext';
import { checkAndUnlockAchievements } from './services/achievementService';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';

const pageComponents: { [key in Page]: React.ComponentType<any> } = {
  Daily: DailyPage,
  Readings: ReadingsPage,
  Journal: JournalPage,
  Guide: GuidePage,
  Progress: ProgressPage,
  Profile: ProfilePage,
  Onboarding: OnboardingPage,
  Settings: SettingsPage,
};

const AppContent: React.FC = () => {
    const { isOnboarded, activePage, setPage, dailyDrawHistory, savedReadings, journalEntries, userProfile, unlockAchievement } = useApp();

    useEffect(() => {
        if (isOnboarded) {
            const stateForAchievements = {
                dailyDrawHistory,
                savedReadings,
                journalEntries,
                unlockedAchievements: userProfile.unlockedAchievements
            };
            checkAndUnlockAchievements(stateForAchievements, unlockAchievement);
        }
    }, [isOnboarded, dailyDrawHistory, savedReadings, journalEntries]);


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