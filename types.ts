export type Arcana = 'Major' | 'Wands' | 'Cups' | 'Swords' | 'Pentacles';

export type AstrologicalSign = 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces' | 'None';

export interface TarotCard {
  id: string;
  name: string;
  arcana: Arcana;
  keywords: string[];
  meaning: string;
  reversedMeaning: string;
  microQuest: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
}

export interface DailyDrawRecord {
  date: string; // YYYY-MM-DD
  drawnCard: DrawnCard;
}

export type SpreadType = '3-card' | 'the-great-work' | 'celtic-cross';

export interface SavedReading {
  id: string;
  date: string;
  spreadType: SpreadType;
  cards: DrawnCard[];
  title: string;
  notes: string;
}

export interface JournalEntry {
    id:string;
    date: string;
    text: string;
    linkedCard?: DrawnCard;
}


export type Page = 'Daily' | 'Readings' | 'Journal' | 'Progress' | 'Profile';