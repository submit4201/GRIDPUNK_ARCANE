import { TAROT_DECK, NUMEROLOGY_MEANINGS, RUNE_DECK } from '../constants';
import { DrawnCard, TarotCard, SpreadType, DivinationCard, DrawnDivinationCard, Rune } from '../types';

// A simple Linear Congruential Generator (LCG) for seeded random numbers.
export class SeededRandom {
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

// Reduces a number to a single digit or a master number (11, 22, 33)
const reduceNumber = (num: number): number => {
  if (num === 11 || num === 22 || num === 33) {
    return num;
  }
  if (num < 10) {
    return num;
  }
  let sum = 0;
  String(num).split('').forEach(digit => {
    sum += parseInt(digit, 10);
  });
  // Recursively reduce until it's a single digit or master number
  if (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    return reduceNumber(sum);
  }
  return sum;
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

export const getShuffledPreparedDeck = (deck: DivinationCard[], seed: number): DrawnDivinationCard[] => {
    const random = new SeededRandom(seed);
    
    const shuffledDeck = [...deck];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = random.nextInt(0, i + 1);
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    
    return shuffledDeck.map(card => {
        const drawnCard: DrawnDivinationCard = {
            card,
            isReversed: 'arcana' in card ? random.nextFloat() < 0.3 : undefined
        };
        return drawnCard;
    });
};

export const castRunes = (count: number): DrawnDivinationCard[] => {
    // Shuffle runes using true randomness for unique casts
    const shuffledRunes = [...RUNE_DECK].sort(() => Math.random() - 0.5);
    const castedSelection = shuffledRunes.slice(0, count);

    // Assign positions and other attributes
    let runesWithPositions = castedSelection.map(card => {
        const rune = card as Rune;
        return {
            card: rune,
            isReversed: rune.reversible ? Math.random() < 0.5 : false,
            x: Math.floor(Math.random() * 80) + 10, // position as percentage (10-90)
            y: Math.floor(Math.random() * 80) + 10,
            rotation: Math.floor(Math.random() * 90) - 45, // rotation in degrees (-45 to 45)
            clusterId: undefined as (number | undefined),
            proximity: undefined as ('inner' | 'middle' | 'outer' | undefined),
        };
    });

    // Calculate proximity
    runesWithPositions.forEach(rune => {
        const dist = Math.sqrt(Math.pow(rune.x! - 50, 2) + Math.pow(rune.y! - 50, 2));
        if (dist < 15) {
            rune.proximity = 'inner';
        } else if (dist < 30) {
            rune.proximity = 'middle';
        } else {
            rune.proximity = 'outer';
        }
    });

    // Calculate clusters robustly
    const CLUSTER_THRESHOLD = 15;
    let currentClusterId = 1;
    const clusterCounts: { [key: number]: number } = {};

    for (let i = 0; i < runesWithPositions.length; i++) {
        if (runesWithPositions[i].clusterId) continue; // Already clustered

        runesWithPositions[i].clusterId = currentClusterId;
        const queue = [runesWithPositions[i]];
        let membersInCluster = 1;

        while (queue.length > 0) {
            const currentRune = queue.shift()!;
            for (let j = 0; j < runesWithPositions.length; j++) {
                if (i === j || runesWithPositions[j].clusterId) continue;
                
                const dist = Math.sqrt(
                    Math.pow(currentRune.x! - runesWithPositions[j].x!, 2) +
                    Math.pow(currentRune.y! - runesWithPositions[j].y!, 2)
                );

                if (dist <= CLUSTER_THRESHOLD) {
                    runesWithPositions[j].clusterId = currentClusterId;
                    queue.push(runesWithPositions[j]);
                    membersInCluster++;
                }
            }
        }
        clusterCounts[currentClusterId] = membersInCluster;
        currentClusterId++;
    }
    
    // Post-process to identify isolated runes (clusters of 1)
    runesWithPositions.forEach(rune => {
        if (rune.clusterId && clusterCounts[rune.clusterId] === 1) {
            rune.clusterId = undefined; // Remove clusterId for isolated runes
        }
    });


    return runesWithPositions;
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

    const reducedMonth = reduceNumber(month);
    const reducedDay = reduceNumber(day);
    const reducedYear = reduceNumber(year);

    const total = reduceNumber(reducedMonth + reducedDay + reducedYear);

    return {
        number: total,
        theme: NUMEROLOGY_MEANINGS[total]?.theme || "Calculation Error",
        description: NUMEROLOGY_MEANINGS[total]?.description || "Could not calculate daily number.",
    };
};

// Universal Month Number
export const calculateMonthlyNumber = (date: Date): { number: number; theme: string; description: string } => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const reducedMonth = reduceNumber(month);
    const reducedYear = reduceNumber(year);
    
    const total = reduceNumber(reducedMonth + reducedYear);

    return {
        number: total,
        theme: NUMEROLOGY_MEANINGS[total]?.theme || "Calculation Error",
        description: NUMEROLOGY_MEANINGS[total]?.description || "Could not calculate monthly number.",
    };
};

// Universal Year Number
export const calculateYearlyNumber = (date: Date): { number: number; theme: string; description: string } => {
    const year = date.getFullYear();
    const total = reduceNumber(year);

    return {
        number: total,
        theme: NUMEROLOGY_MEANINGS[total]?.theme || "Calculation Error",
        description: NUMEROLOGY_MEANINGS[total]?.description || "Could not calculate yearly number.",
    };
};