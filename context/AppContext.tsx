import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { JournalEntry, SavedReading, DrawnCard, AstrologicalSign, DailyDrawRecord } from '../types';

interface AppContextType {
  journalEntries: JournalEntry[];
  addJournalEntry: (text: string, linkedCard?: DrawnCard) => void;
  savedReadings: SavedReading[];
  addSavedReading: (reading: Omit<SavedReading, 'id' | 'date'>) => void;
  isPremium: boolean;
  setIsPremium: (isPremium: boolean) => void;
  astrologicalSign: AstrologicalSign;
  setAstrologicalSign: (sign: AstrologicalSign) => void;
  dailyDrawHistory: DailyDrawRecord[];
  addDailyDrawToHistory: (draw: DrawnCard) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);
  const [savedReadings, setSavedReadings] = useLocalStorage<SavedReading[]>('savedReadings', []);
  const [isPremium, setIsPremium] = useLocalStorage<boolean>('isPremium', false);
  const [astrologicalSign, setAstrologicalSign] = useLocalStorage<AstrologicalSign>('astrologicalSign', 'None');
  const [dailyDrawHistory, setDailyDrawHistory] = useLocalStorage<DailyDrawRecord[]>('dailyDrawHistory', []);


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
    isPremium,
    setIsPremium,
    astrologicalSign,
    setAstrologicalSign,
    dailyDrawHistory,
    addDailyDrawToHistory,
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