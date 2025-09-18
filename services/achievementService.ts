import { DailyDrawRecord, SavedReading, JournalEntry, TarotCard, AchievementID } from '../types';

export interface Achievement {
  id: AchievementID;
  name: string;
  description: string;
  icon: string; // Emoji
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'first_draw', name: 'First Light', description: 'Complete your first Daily Draw.', icon: '🌅' },
  { id: 'first_reading', name: 'The Initiate', description: 'Complete and save your first multi-card reading.', icon: '🃏' },
  { id: 'scribe_1', name: 'First Scroll', description: 'Write your first journal entry or note.', icon: '✍️' },
  { id: 'scribe_10', name: 'The Scribe', description: 'Write 10 journal entries or notes.', icon: '📜' },
  { id: 'historian_5', name: 'The Historian', description: 'Save 5 readings to your journal.', icon: '📚' },
  { id: 'streak_3', name: 'Consistency', description: 'Maintain a 3-day daily draw streak.', icon: '🥉' },
  { id: 'streak_7', name: 'Dedication', description: 'Maintain a 7-day daily draw streak.', icon: '🔥' },
  { id: 'major_arcana_initiate', name: 'Secret Keeper', description: 'Draw 5 different Major Arcana cards.', icon: '🔑' },
  { id: 'major_arcana_master', name: 'Arcana Master', description: 'Draw all 22 Major Arcana cards.', icon: '👑' },
  { id: 'wands_adept', name: 'Spark of Genius', description: 'Draw 10 cards from the Suit of Wands.', icon: '🔥' },
  { id: 'cups_adept', name: 'River of Emotion', description: 'Draw 10 cards from the Suit of Cups.', icon: '💧' },
  { id: 'swords_adept', name: 'Sharp Mind', description: 'Draw 10 cards from the Suit of Swords.', icon: '⚔️' },
  { id: 'pentacles_adept', name: 'Worldly Touch', description: 'Draw 10 cards from the Suit of Pentacles.', icon: '🌿' },
  { id: 'rune_caster_1', name: 'First Cast', description: 'Perform your first rune cast.', icon: 'ᚠ' },
  { id: 'rune_caster_5', name: 'Rune Master', description: 'Perform 5 rune casts.', icon: 'ᛝ' },
];

interface AppStateForAchievements {
  dailyDrawHistory: DailyDrawRecord[];
  savedReadings: SavedReading[];
  journalEntries: JournalEntry[];
  unlockedAchievements: AchievementID[];
}

export function checkAndUnlockAchievements(
  state: AppStateForAchievements,
  unlockFn: (id: AchievementID) => void
) {
    const { dailyDrawHistory, savedReadings, journalEntries, unlockedAchievements } = state;
    const allDrawnCards = [...dailyDrawHistory.map(d => d.drawnCard), ...savedReadings.flatMap(r => r.cards)];

    const check = (id: AchievementID, condition: boolean) => {
        if (condition && !unlockedAchievements.includes(id)) {
            unlockFn(id);
        }
    };

    // Simple checks
    check('first_draw', dailyDrawHistory.length > 0);
    check('first_reading', savedReadings.length > 0);
    const totalNotes = journalEntries.length + savedReadings.filter(r => r.userNotes).length;
    check('scribe_1', totalNotes > 0);
    check('scribe_10', totalNotes >= 10);
    check('historian_5', savedReadings.length >= 5);
    
    // Rune checks
    const runeReadings = savedReadings.filter(r => r.deckType === 'runes').length;
    check('rune_caster_1', runeReadings > 0);
    check('rune_caster_5', runeReadings >= 5);

    // Streak checks
    if (dailyDrawHistory.length > 1) {
        let streak = 1;
        const sortedHistory = [...dailyDrawHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        for (let i = 0; i < sortedHistory.length - 1; i++) {
            const current = new Date(sortedHistory[i].date);
            const previous = new Date(sortedHistory[i + 1].date);
            const diffTime = current.getTime() - previous.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                streak++;
            } else if (diffDays > 1) {
                break; // Streak broken
            }
        }
        check('streak_3', streak >= 3);
        check('streak_7', streak >= 7);
    } else if (dailyDrawHistory.length === 1) {
        // Handle case for the very first draw
    }

    // Card collection checks
    const majorArcanaDrawn = new Set<string>();
    const suitCounts = { Wands: 0, Cups: 0, Swords: 0, Pentacles: 0 };

    allDrawnCards.forEach(drawn => {
        if(drawn && drawn.card && 'arcana' in drawn.card) {
            const card = drawn.card as TarotCard;
            if (card.arcana === 'Major') {
                majorArcanaDrawn.add(card.name);
            } else if (card.arcana in suitCounts) {
                suitCounts[card.arcana]++;
            }
        }
    });

    check('major_arcana_initiate', majorArcanaDrawn.size >= 5);
    check('major_arcana_master', majorArcanaDrawn.size >= 22);
    check('wands_adept', suitCounts.Wands >= 10);
    check('cups_adept', suitCounts.Cups >= 10);
    check('swords_adept', suitCounts.Swords >= 10);
    check('pentacles_adept', suitCounts.Pentacles >= 10);
}