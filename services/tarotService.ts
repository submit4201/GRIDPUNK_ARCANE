import { TAROT_DECK, NUMEROLOGY_MEANINGS } from '../constants';
import { DrawnCard, TarotCard, SpreadType } from '../types';

// A simple Linear Congruential Generator (LCG) for seeded random numbers.
class SeededRandom {
  private seed: number;
  private readonly a = 1664525;
  private readonly c = 1013904223;
  private readonly m = 2 ** 32;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Returns a random float between 0 (inclusive) and 1 (exclusive)
  nextFloat(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }

  // Returns a random integer between min (inclusive) and max (exclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.nextFloat() * (max - min)) + min;
  }
}

// Simple string hash function to create a numeric seed
const createNumericSeed = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export const getDailySeed = (userId: string, date: Date): number => {
  const dateISO = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const seedString = `${userId}|${dateISO}`;
  return createNumericSeed(seedString);
};

export const drawDailyCard = (seed: number): DrawnCard => {
  const random = new SeededRandom(seed);
  const cardIndex = random.nextInt(0, TAROT_DECK.length);
  const isReversed = random.nextFloat() < 0.3; // 30% chance of being reversed
  return {
    card: TAROT_DECK[cardIndex],
    isReversed,
  };
};

export const getShuffledPreparedDeck = (seed: number): DrawnCard[] => {
    const random = new SeededRandom(seed);
    
    const shuffledDeck = [...TAROT_DECK];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = random.nextInt(0, i + 1);
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    
    return shuffledDeck.map(card => ({
        card,
        isReversed: random.nextFloat() < 0.3,
    }));
};

export const dealSpread = (seed: number, spreadType: SpreadType): DrawnCard[] => {
  const random = new SeededRandom(seed);
  
  // Create a shuffled deck using the Fisher-Yates algorithm
  const shuffledDeck = [...TAROT_DECK];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = random.nextInt(0, i + 1);
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }

  let cardCount: number;
  switch (spreadType) {
    case '3-card':
      cardCount = 3;
      break;
    case 'the-great-work':
      cardCount = 5;
      break;
    case 'celtic-cross':
      cardCount = 11;
      break;
    default:
      cardCount = 3;
  }
  
  const drawnCards = shuffledDeck.slice(0, cardCount).map(card => ({
    card,
    isReversed: random.nextFloat() < 0.3,
  }));

  return drawnCards;
};

export const calculateDailyNumber = (date: Date): { number: number; theme: string; description: string } => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const sumDigits = (num: number): number => {
        let sum = 0;
        String(num).split('').forEach(digit => {
            sum += parseInt(digit, 10);
        });
        return sum;
    };
    
    let total = sumDigits(day) + sumDigits(month) + sumDigits(year);

    while (total > 9) {
        total = sumDigits(total);
    }

    return {
        number: total,
        theme: NUMEROLOGY_MEANINGS[total].theme,
        description: NUMEROLOGY_MEANINGS[total].description,
    };
};