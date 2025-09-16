
export type Arcana = 'Major' | 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';

export interface TarotCard {
  id: string;
  name: string;
  arcana: Arcana;
  keywords: string[];
  meaning: string;
  reversedMeaning: string;
  microQuest: string;
  element: Element;
}

export interface Rune {
  id: string;
  name: string;
  symbol: string;
  keywords: string[];
  meaning: string;
  reversible: boolean;
}

export interface AngelCard {
  id: string;
  name: string;
  keywords: string[];
  meaning: string;
}

export type DivinationCard = TarotCard | Rune | AngelCard;

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
}

export interface DrawnDivinationCard {
  card: DivinationCard;
  isReversed?: boolean;
  // For rune casting
  x?: number;
  y?: number;
  rotation?: number;
  clusterId?: number;
  proximity?: 'inner' | 'middle' | 'outer';
}

export type SpreadType =
  '3-card' |
  'mind-body-spirit' |
  'career-path' |
  'the-great-work' |
  'relationship' |
  'decision-making' |
  'celtic-cross' |
  'single-rune' |
  'three-rune-norn' |
  'five-rune-cross' |
  'nine-rune-grid' |
  'full-cast';

export type DeckType = 'tarot' | 'runes' | 'angel-cards';

export const ASTROLOGICAL_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export type AstrologicalSign = (typeof ASTROLOGICAL_SIGNS)[number] | 'None';

export interface UserProfile {
  givenName: string;
  usedName: string;
  mothersMaidenName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  astrologicalSign: AstrologicalSign;
  readingStyle: 'mystical' | 'practical' | 'psychological';
  readingFocus: 'general' | 'love' | 'career' | 'growth';
  currentName?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  linkedCard?: DrawnCard;
}

export interface SavedReading {
  id: string;
  date: string;
  spreadType: SpreadType;
  deckType: DeckType;
  positions: string[];
  cards: DrawnDivinationCard[];
  title: string;
  aiSummary: string;
  userNotes: string;
}

export interface DailyDrawRecord {
  date: string;
  drawnCard: DrawnCard;
}

export type Page = 'Daily' | 'Readings' | 'Journal' | 'Guide' | 'Progress' | 'Profile' | 'Onboarding';

// Numerology specific types
export interface CosmicNumber {
  number: number;
  theme: string;
  description: string;
}

export interface Pinnacle {
  number: number;
  theme: string;
  description: string;
  ageRange: string;
}

export interface Challenge {
  number: number;
  theme: string;
  description: string;
  // FIX: Added missing ageRange property to the Challenge interface.
  ageRange: string;
}

export interface CosmicBlueprint {
  lifePath: CosmicNumber;
  destiny: CosmicNumber;
  soulUrge: CosmicNumber;
  personality: CosmicNumber;
  heritage: CosmicNumber;
  currentVibe: CosmicNumber;
  birthday: CosmicNumber;
  maturity: CosmicNumber;
  pinnacles: Pinnacle[];
  challenges: Challenge[];
  karmicDebts: number[];
}