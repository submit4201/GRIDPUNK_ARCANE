import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { JournalEntry, SavedReading, DrawnCard, AstrologicalSign, DailyDrawRecord, UserProfile, DrawnDivinationCard, Page } from '../types';

interface AppContextType {
  journalEntries: JournalEntry[];
  addJournalEntry: (text: string, linkedCard?: DrawnCard) => void;
  savedReadings: SavedReading[];
  addSavedReading: (reading: Omit<SavedReading, 'id' | 'date'>) => void;
  updateSavedReadingNotes: (readingId: string, notes: string) => void;
  isPremium: boolean;
  setIsPremium: (isPremium: boolean) => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  dailyDrawHistory: DailyDrawRecord[];
  addDailyDrawToHistory: (draw: DrawnCard) => void;
  isOnboarded: boolean;
  setIsOnboarded: (status: boolean) => void;
  runeCastsToday: number;
  incrementRuneCast: () => void;
  // FIX: Added page navigation state to the context to make it globally accessible.
  activePage: Page;
  setPage: (page: Page) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialProfile: UserProfile = {
    givenName: '',
    usedName: '',
    mothersMaidenName: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    astrologicalSign: 'None',
    readingStyle: 'mystical',
    readingFocus: 'general',
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);
  const [savedReadings, setSavedReadings] = useLocalStorage<SavedReading[]>('savedReadings', []);
  const [isPremium, setIsPremium] = useLocalStorage<boolean>('isPremium', false);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('userProfile', initialProfile);
  const [dailyDrawHistory, setDailyDrawHistory] = useLocalStorage<DailyDrawRecord[]>('dailyDrawHistory', []);
  const [isOnboarded, setIsOnboarded] = useLocalStorage<boolean>('isOnboarded', false);
  const [runeCasts, setRuneCasts] = useLocalStorage<{ date: string; count: number }>('runeCasts', { date: '', count: 0 });
  // FIX: Moved page navigation state here to be provided by the context.
  const [activePage, setPage] = useLocalStorage<Page>('activePage', 'Daily');

  const todayStr = new Date().toISOString().split('T')[0];
  const runeCastsToday = runeCasts.date === todayStr ? runeCasts.count : 0;

  const incrementRuneCast = () => {
      const currentCount = runeCasts.date === todayStr ? runeCasts.count : 0;
      setRuneCasts({ date: todayStr, count: currentCount + 1 });
  };

  const addJournalEntry = (text: string, linkedCard?: DrawnCard) => {
    const newEntry: JournalEntry = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      text,
      linkedCard,
    };
    setJournalEntries([newEntry, ...journalEntries]);
  };

  const addSavedReading = (reading: Omit<SavedReading, 'id' | 'date'>) => {
    const newReading: SavedReading = {
      ...reading,
      id: new Date().toISOString(),
      date: new Date().toISOString(),
    };
    setSavedReadings([newReading, ...savedReadings]);
  };

  const updateSavedReadingNotes = (readingId: string, notes: string) => {
    setSavedReadings(
      savedReadings.map(r =>
        r.id === readingId ? { ...r, userNotes: notes } : r
      )
    );
  };

  const addDailyDrawToHistory = (drawnCard: DrawnCard) => {
    const today = new Date().toISOString().split('T')[0];
    const newRecord: DailyDrawRecord = { date: today, drawnCard };
    // Prevent duplicates for the same day and keep the list tidy
    const filteredHistory = dailyDrawHistory.filter(record => record.date !== today);
    setDailyDrawHistory([newRecord, ...filteredHistory].slice(0, 30)); // Keep last 30 readings
  };

  const value = {
    journalEntries,
    addJournalEntry,
    savedReadings,
    addSavedReading,
    updateSavedReadingNotes,
    isPremium,
    setIsPremium,
    userProfile,
    setUserProfile,
    dailyDrawHistory,
    addDailyDrawToHistory,
    isOnboarded,
    setIsOnboarded,
    runeCastsToday,
    incrementRuneCast,
    // FIX: Provide page navigation state through the context.
    activePage,
    setPage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};