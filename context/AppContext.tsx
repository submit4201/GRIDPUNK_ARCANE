import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { JournalEntry, SavedReading, DrawnCard, DailyDrawRecord, UserProfile, Page, AchievementID } from '../types';

interface AppContextType {
  journalEntries: JournalEntry[];
  addJournalEntry: (text: string, linkedCard?: DrawnCard) => void;
  savedReadings: SavedReading[];
  addSavedReading: (reading: Omit<SavedReading, 'id' | 'date'>) => void;
  updateSavedReadingNotes: (readingId: string, notes: string) => void;
  updateReadingChatHistory: (readingId: string, chatHistory: Message[]) => void;
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
  activePage: Page;
  setPage: (page: Page) => void;
  addXp: (amount: number) => void;
  unlockAchievement: (id: AchievementID) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialProfile: UserProfile = {
    givenName: '',
    currentName: '',
    mothersMaidenName: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    astrologicalSign: 'None',
    birthConstellation: '',
    readingStyle: 'mystical',
    readingFocus: 'general',
    level: 1,
    xp: 0,
    unlockedAchievements: [],
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);
  const [savedReadings, setSavedReadings] = useLocalStorage<SavedReading[]>('savedReadings', []);
  const [isPremium, setIsPremium] = useLocalStorage<boolean>('isPremium', false);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('userProfile', initialProfile);
  const [dailyDrawHistory, setDailyDrawHistory] = useLocalStorage<DailyDrawRecord[]>('dailyDrawHistory', []);
  const [isOnboarded, setIsOnboarded] = useLocalStorage<boolean>('isOnboarded', false);
  const [runeCasts, setRuneCasts] = useLocalStorage<{ date: string; count: number }>('runeCasts', { date: '', count: 0 });
  const [activePage, setPage] = useLocalStorage<Page>('activePage', 'Daily');

  const todayStr = new Date().toISOString().split('T')[0];
  const runeCastsToday = runeCasts.date === todayStr ? runeCasts.count : 0;

  const incrementRuneCast = () => {
      const currentCount = runeCasts.date === todayStr ? runeCasts.count : 0;
      setRuneCasts({ date: todayStr, count: currentCount + 1 });
  };

  const addXp = (amount: number) => {
    // FIX: The useLocalStorage hook setter doesn't support functional updates like useState.
    // We now read the userProfile from the context's scope and pass a new object to the setter.
    const prevProfile = userProfile;
    let newXp = prevProfile.xp + amount;
    let newLevel = prevProfile.level;
    let xpForNextLevel = Math.round(500 * Math.pow(1.5, newLevel - 1));

    while (newXp >= xpForNextLevel) {
        newXp -= xpForNextLevel;
        newLevel++;
        xpForNextLevel = Math.round(500 * Math.pow(1.5, newLevel - 1));
    }
    setUserProfile({ ...prevProfile, xp: newXp, level: newLevel });
  };

  const unlockAchievement = (id: AchievementID) => {
    // FIX: The useLocalStorage hook setter doesn't support functional updates like useState.
    // We now read the userProfile from the context's scope and pass a new object to the setter.
    const prevProfile = userProfile;
    if (prevProfile.unlockedAchievements.includes(id)) {
        return;
    }
    setUserProfile({
        ...prevProfile,
        unlockedAchievements: [...prevProfile.unlockedAchievements, id]
    });
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

  const updateReadingChatHistory = (readingId: string, chatHistory: Message[]) => {
    setSavedReadings(
        savedReadings.map(r =>
            r.id === readingId ? { ...r, chatHistory: chatHistory } : r
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
    updateReadingChatHistory,
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
    activePage,
    setPage,
    addXp,
    unlockAchievement,
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