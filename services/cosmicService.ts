import { UserProfile, CosmicBlueprint, CosmicNumber, Pinnacle, Challenge } from '../types';

const CHAR_TO_NUM: { [key: string]: number } = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

import { reduceNumber } from '../utils/numerology';

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

const getUnreducedSum = (value: string | number): number => {
    return String(value).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
}

// Calculates the numerological value of a name string
const calculateNameNumber = (name: string, type: 'all' | 'vowels' | 'consonants'): { reduced: number, unreduced: number } => {
  if (!name) return { reduced: 0, unreduced: 0 };
  let sum = 0;
  const lowerName = name.toLowerCase().replace(/[^a-z]/g, '');

  for (const char of lowerName) {
    if (type === 'vowels' && VOWELS.has(char)) {
      sum += CHAR_TO_NUM[char];
    } else if (type === 'consonants' && !VOWELS.has(char)) {
      sum += CHAR_TO_NUM[char];
    } else if (type === 'all') {
      sum += CHAR_TO_NUM[char];
    }
  }
  return { reduced: reduceNumber(sum), unreduced: sum };
};

// Calculates the Life Path number from a birth date
const calculateLifePathNumber = (birthDate: string): { reduced: number, unreduced: number } => {
  if (!birthDate) return { reduced: 0, unreduced: 0 };
  const [year, month, day] = birthDate.split('-').map(Number);
  if (!year || !month || !day) return { reduced: 0, unreduced: 0 };
  
  const totalSum = getUnreducedSum(month) + getUnreducedSum(day) + getUnreducedSum(year);
  return { reduced: reduceNumber(totalSum), unreduced: totalSum };
};

const calculateBirthdayNumber = (birthDate: string): number => {
    if (!birthDate) return 0;
    const day = parseInt(birthDate.split('-')[2], 10);
    return reduceNumber(day);
}

const calculateMaturityNumber = (lifePath: number, destiny: number): number => {
    return reduceNumber(lifePath + destiny);
}

const calculatePinnaclesAndChallenges = (birthDate: string, lifePath: number): { pinnacles: Pinnacle[], challenges: Challenge[] } => {
    if (!birthDate || !lifePath) return { pinnacles: [], challenges: [] };

    const [year, month, day] = birthDate.split('-').map(str => reduceNumber(parseInt(str, 10)));
    
    // Pinnacles
    const p1 = reduceNumber(month + day);
    const p2 = reduceNumber(day + year);
    const p3 = reduceNumber(p1 + p2);
    const p4 = reduceNumber(month + year);
    const pinnacleNumbers = [p1, p2, p3, p4];
    
    // Challenges
    const c1 = reduceNumber(Math.abs(month - day));
    const c2 = reduceNumber(Math.abs(day - year));
    const c3 = reduceNumber(Math.abs(c1 - c2));
    const c4 = reduceNumber(Math.abs(month - year));
    const challengeNumbers = [c1, c2, c3, c4];
    
    // Age Ranges
    const firstPinnacleEnd = 36 - lifePath;
    const ageRanges = [
        `Birth to ${firstPinnacleEnd}`,
        `${firstPinnacleEnd + 1} to ${firstPinnacleEnd + 9}`,
        `${firstPinnacleEnd + 10} to ${firstPinnacleEnd + 18}`,
        `${firstPinnacleEnd + 19} onwards`
    ];

    return {
        pinnacles: pinnacleNumbers.map((p, i) => ({
            number: p,
            ...PINNACLE_THEMES[p],
            ageRange: ageRanges[i]
        })),
        challenges: challengeNumbers.map((c, i) => ({
            number: c,
            ...CHALLENGE_THEMES[c],
            ageRange: ageRanges[i]
        }))
    };
};


const NUMEROLOGY_THEMES: { [key: number]: { theme: string; description: string } } = {
  0: { theme: "Incomplete Data", description: "Provide more details to calculate this number." },
  1: { theme: "The Leader", description: "Embodies independence, innovation, and leadership." },
  2: { theme: "The Diplomat", description: "Represents cooperation, harmony, and partnership." },
  3: { theme: "The Communicator", description: "Signifies creativity, self-expression, and joy." },
  4: { theme: "The Builder", description: "Stands for stability, hard work, and practicality." },
  5: { theme: "The Adventurer", description: "Symbolizes freedom, change, and curiosity." },
  6: { theme: "The Nurturer", description: "Represents responsibility, love, and community." },
  7: { theme: "The Seeker", description: "Embodies introspection, wisdom, and spirituality." },
  8: { theme: "The Powerhouse", description: "Signifies ambition, abundance, and authority." },
  9: { theme: "The Humanitarian", description: "Stands for compassion, completion, and universal love." },
  11: { theme: "The Visionary", description: "A Master Number of intuition, idealism, and spiritual insight." },
  22: { theme: "The Master Builder", description: "A Master Number of large-scale manifestation and practical dreams." },
  33: { theme: "The Master Teacher", description: "A Master Number of healing, compassion, and spiritual guidance." },
};

const PINNACLE_THEMES: { [key: number]: { theme: string; description: string } } = {
    0: { theme: "Rest & Recalibration", description: "A period of quiet contemplation and preparation for what is to come." },
    1: { theme: "The Innovator", description: "A time for developing independence, leadership, and pioneering new paths. Individuality is key." },
    2: { theme: "The Diplomat", description: "Focus on partnerships, cooperation, and developing intuition. Relationships are paramount." },
    3: { theme: "The Creative", description: "An expansive period for self-expression, creativity, and social engagement. Joy and communication are highlighted." },
    4: { theme: "The Builder", description: "A cycle for hard work, establishing security, and building lasting foundations. Discipline is required." },
    5: { theme: "The Liberator", description: "Expect change, freedom, and adventure. This is a time to adapt and embrace the unexpected." },
    6: { theme: "The Caretaker", description: "A period focused on home, family, responsibility, and community service. Matters of the heart are central." },
    7: { theme: "The Analyst", description: "A time for introspection, spiritual growth, and seeking deeper knowledge. Solitude and analysis are beneficial." },
    8: { theme: "The Executive", description: "Focus on personal power, financial success, and taking control. Ambition and authority are key themes." },
    9: { theme: "The Philanthropist", description: "A cycle of completion, compassion, and humanitarianism. Letting go and serving others are highlighted." },
    11: { theme: "The Spiritual Beacon", description: "A master cycle of heightened intuition, spiritual awakenings, and inspirational leadership." },
    22: { theme: "The Master Architect", description: "A powerful period for turning ambitious dreams into tangible reality on a large scale." },
    33: { theme: "The Master Healer", description: "A profound cycle of compassionate service, healing, and nurturing guidance on a wide scale." },
};

const CHALLENGE_THEMES: { [key: number]: { theme: string; description: string } } = {
    0: { theme: "The Open Path", description: "This challenge indicates a path of least resistance, or that the other challenges are the primary focus. It's a call to choose your own lesson." },
    1: { theme: "The Challenge of Assertion", description: "Learning to stand up for oneself without becoming aggressive or indecisive. The lesson is in finding your unique voice and confidence." },
    2: { theme: "The Challenge of Sensitivity", description: "Overcoming hypersensitivity and fear of collaboration. The lesson is in developing diplomacy and trusting partnerships." },
    3: { theme: "The Challenge of Expression", description: "Moving past self-doubt and scattered energies to express oneself creatively and joyfully. The lesson is in focused communication." },
    4: { theme: "The Challenge of Discipline", description: "Resisting the urge to be lazy or rigid. The lesson is in dedicated, consistent effort and building a stable life." },
    5: { theme: "The Challenge of Freedom", description: "Avoiding impulsive behavior and fear of change. The lesson is in using freedom constructively and embracing adaptability." },
    6: { theme: "The Challenge of Responsibility", description: "Balancing the needs of others with one's own, and avoiding perfectionism or neglect. The lesson is in healthy nurturing." },
    7: { theme: "The Challenge of Faith", description: "Overcoming skepticism, isolation, and superficiality. The lesson is in trusting one's inner wisdom and seeking deeper truths." },
    8: { theme: "The Challenge of Power", description: "Using authority and finances wisely, without becoming domineering or a victim. The lesson is in mastering the material world with integrity." },
    11: { theme: "The Challenge of Illusion", description: "Living up to high spiritual potential without succumbing to nervous tension or self-doubt. The lesson is in grounding visionary ideas." },
    22: { theme: "The Challenge of Scale", description: "Wielding immense power for the greater good without becoming overwhelmed or corrupt. The lesson is in practical idealism." },
    33: { theme: "The Challenge of Martyrdom", description: "Healing and helping others without sacrificing one's own well-being. The lesson is in compassionate detachment." },
};

export const generateCosmicBlueprint = (profile: UserProfile): CosmicBlueprint => {
  const { reduced: lifePathNum, unreduced: lifePathUnreduced } = calculateLifePathNumber(profile.birthDate);
  const { reduced: destinyNum, unreduced: destinyUnreduced } = calculateNameNumber(profile.givenName, 'all');
  const { reduced: soulUrgeNum } = calculateNameNumber(profile.givenName, 'vowels');
  const { reduced: personalityNum } = calculateNameNumber(profile.givenName, 'consonants');
  const { reduced: heritageNum } = calculateNameNumber(profile.mothersMaidenName, 'all');
  const { reduced: currentVibeNum } = calculateNameNumber(profile.currentName, 'all');
  const birthdayNum = calculateBirthdayNumber(profile.birthDate);
  const maturityNum = calculateMaturityNumber(lifePathNum, destinyNum);
  const { pinnacles, challenges } = calculatePinnaclesAndChallenges(profile.birthDate, lifePathNum);

  const karmicDebts: number[] = [];
  const karmicNumbers = [13, 14, 16, 19];
  if (karmicNumbers.includes(lifePathUnreduced)) karmicDebts.push(lifePathUnreduced);
  if (karmicNumbers.includes(destinyUnreduced)) karmicDebts.push(destinyUnreduced);

  return {
    lifePath: { number: lifePathNum, ...NUMEROLOGY_THEMES[lifePathNum] },
    destiny: { number: destinyNum, ...NUMEROLOGY_THEMES[destinyNum] },
    soulUrge: { number: soulUrgeNum, ...NUMEROLOGY_THEMES[soulUrgeNum] },
    personality: { number: personalityNum, ...NUMEROLOGY_THEMES[personalityNum] },
    heritage: { number: heritageNum, ...NUMEROLOGY_THEMES[heritageNum] },
    currentVibe: { number: currentVibeNum, ...NUMEROLOGY_THEMES[currentVibeNum] },
    birthday: { number: birthdayNum, ...NUMEROLOGY_THEMES[birthdayNum] },
    maturity: { number: maturityNum, ...NUMEROLOGY_THEMES[maturityNum] },
    pinnacles,
    challenges,
    karmicDebts: [...new Set(karmicDebts)], // Ensure unique values
  };
};