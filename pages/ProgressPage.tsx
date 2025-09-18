import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { UserIcon, BarChartIcon, SparklesIcon } from '../components/icons';
import { Page, Arcana } from '../types';
import { ACHIEVEMENTS_LIST } from '../services/achievementService';

const levelTitles: { [key: number]: string } = {
  1: "Neophyte",
  5: "Initiate",
  10: "Adept",
  15: "Mystic",
  20: "Oracle",
};

const getCurrentTitle = (level: number): string => {
  let currentTitle = "Neophyte";
  for (const levelKey in levelTitles) {
    if (level >= parseInt(levelKey)) {
      currentTitle = levelTitles[levelKey];
    }
  }
  return currentTitle;
};

const getNextTitle = (level: number): string | null => {
    let nextTitle: string | null = null;
    const sortedLevels = Object.keys(levelTitles).map(Number).sort((a,b) => a-b);
    for (const levelKey of sortedLevels) {
        if (level < levelKey) {
            nextTitle = `${levelTitles[levelKey]} (Lvl ${levelKey})`;
            break;
        }
    }
    return nextTitle;
}


const ProgressPage: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
  const { isPremium, dailyDrawHistory, savedReadings, userProfile } = useApp();
  
  const { level, xp, unlockedAchievements } = userProfile;

  const xpForNextLevel = Math.round(500 * Math.pow(1.5, level - 1));
  const xpPercentage = (xp / xpForNextLevel) * 100;

  const allDrawnCards = useMemo(() => {
    const dailyCards = dailyDrawHistory.map(d => d.drawnCard);
    const readingCards = savedReadings.flatMap(r => r.cards);
    return [...dailyCards, ...readingCards];
  }, [dailyDrawHistory, savedReadings]);

  const readingStats = useMemo(() => {
    if (allDrawnCards.length === 0) {
      return {
        totalReadings: dailyDrawHistory.length + savedReadings.length,
        arcanaCounts: { Major: 0, Wands: 0, Cups: 0, Swords: 0, Pentacles: 0 },
        mostFrequentArcana: 'N/A',
        mostFrequentCard: 'N/A',
      };
    }

    const arcanaCounts: { [key in Arcana]: number } = { Major: 0, Wands: 0, Cups: 0, Swords: 0, Pentacles: 0 };
    const cardCounts: { [key: string]: number } = {};

    for (const drawnCard of allDrawnCards) {
      if (drawnCard?.card && 'arcana' in drawnCard.card) {
        arcanaCounts[drawnCard.card.arcana]++;
      }
      if (drawnCard?.card?.name) {
        cardCounts[drawnCard.card.name] = (cardCounts[drawnCard.card.name] || 0) + 1;
      }
    }

    const mostFrequentArcana = Object.entries(arcanaCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const mostFrequentCard = Object.entries(cardCounts).length > 0 ? Object.entries(cardCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0] : 'None';

    return {
      totalReadings: dailyDrawHistory.length + savedReadings.length,
      arcanaCounts,
      mostFrequentArcana,
      mostFrequentCard,
    };
  }, [allDrawnCards, dailyDrawHistory, savedReadings]);

  const dailyStreak = useMemo(() => {
    if (dailyDrawHistory.length === 0) return 0;
    let streak = 1;
    const sortedHistory = [...dailyDrawHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const today = new Date(new Date().toISOString().split('T')[0]);
    const mostRecentDrawDate = new Date(sortedHistory[0].date);
    const diffTimeToday = today.getTime() - mostRecentDrawDate.getTime();
    const diffDaysToday = Math.ceil(diffTimeToday / (1000 * 60 * 60 * 24));
    if(diffDaysToday > 1) return 0; // if most recent draw is not today or yesterday, streak is 0

    for (let i = 0; i < sortedHistory.length - 1; i++) {
        const current = new Date(sortedHistory[i].date);
        const previous = new Date(sortedHistory[i + 1].date);
        const diffTime = current.getTime() - previous.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            streak++;
        } else if (diffDays > 1){
            break; // Streak broken
        }
    }
    return streak;
  }, [dailyDrawHistory]);


  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-dm-sans text-text-primary">Progress</h1>
        <p className="text-text-muted">Track your growth and unlock achievements.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & XP */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111218] p-6 rounded-xl border border-[#232533] text-center">
            <div className="my-4 flex justify-center">
              <div className="w-32 h-32 rounded-full bg-[#0B0C10] flex items-center justify-center border-2 border-[#6E7BFF]">
                <UserIcon className="w-20 h-20 text-[#6E7BFF]" />
              </div>
            </div>
            <p className="font-bold text-lg text-text-primary">{getCurrentTitle(level)}</p>
            <p className="text-text-muted text-sm">Next: {getNextTitle(level) || 'Max Rank'}</p>
          </div>

          <div className="bg-[#111218] p-6 rounded-xl border border-[#232533]">
            <h3 className="text-xl font-semibold text-text-primary mb-3">Level {level}</h3>
            <div className="w-full bg-[#0B0C10] rounded-full h-4 border border-[#232533] overflow-hidden">
              <div className="bg-gradient-to-r from-[#21C7F2] to-[#6E7BFF] h-full rounded-full transition-all duration-500" style={{ width: `${xpPercentage}%` }}></div>
            </div>
            <p className="text-right text-sm text-text-muted mt-2">{Math.floor(xp)} / {xpForNextLevel} XP</p>
          </div>
           <div className="bg-[#111218] p-6 rounded-xl border border-[#232533]">
                <h3 className="text-xl font-semibold text-text-primary mb-3">Activity Streak</h3>
                <p className="text-4xl font-bold text-[#FF7A1A]">{dailyStreak} Days</p>
            </div>
        </div>

        {/* Right Column: Badges & Analysis */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111218] p-6 rounded-xl border border-[#232533]">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS_LIST.length})</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {ACHIEVEMENTS_LIST.map(ach => {
                        const isUnlocked = unlockedAchievements.includes(ach.id);
                        return (
                             <div key={ach.id} className="relative group flex flex-col items-center text-center">
                                <div className={`w-20 h-20 bg-[#0B0C10] border border-[#232533] rounded-lg flex items-center justify-center text-4xl transition-all duration-300 ${isUnlocked ? 'grayscale-0' : 'grayscale'}`}>
                                    {ach.icon}
                                </div>
                                <p className={`text-xs mt-2 font-semibold ${isUnlocked ? 'text-text-primary' : 'text-text-muted'}`}>{ach.name}</p>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#232533] text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                    <p className="font-bold">{ach.name} {isUnlocked && ' (Unlocked)'}</p>
                                    <p className="text-text-muted">{ach.description}</p>
                                </div>
                             </div>
                        );
                    })}
                </div>
            </div>
            <div className="bg-[#111218] p-6 rounded-xl border border-[#232533]">
                <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <BarChartIcon className="w-6 h-6 text-sky-400" />
                  Reading Analysis
                </h3>
                {isPremium ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-sm text-text-muted">Total Readings</p>
                            <p className="text-2xl font-bold">{readingStats.totalReadings}</p>
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Top Arcana</p>
                            <p className="text-2xl font-bold">{readingStats.mostFrequentArcana}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-text-muted">Most Frequent Card</p>
                            <p className="text-2xl font-bold truncate" title={readingStats.mostFrequentCard}>{readingStats.mostFrequentCard}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-text-muted mb-2 text-sm">Arcana Distribution</h4>
                        <div className="space-y-2">
                            {Object.entries(readingStats.arcanaCounts).map(([arcana, count]) => {
                                const tarotCardsDrawn = allDrawnCards.filter(c => c && 'arcana' in c.card).length;
                                const percentage = tarotCardsDrawn > 0 ? (count / tarotCardsDrawn) * 100 : 0;
                                return (
                                    <div key={arcana} className="flex items-center gap-2">
                                        <span className="w-20 text-xs text-text-muted">{arcana}</span>
                                        <div className="flex-grow bg-[#0B0C10] h-4 rounded-full border border-[#232533]">
                                            <div className="bg-sky-400 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                        <span className="w-8 text-xs font-bold text-right">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                ) : (
                  <div className="text-center py-6 bg-[#0B0C10]/50 rounded-lg">
                    <SparklesIcon className="w-12 h-12 mx-auto text-amber-400" />
                    <h4 className="mt-4 font-semibold text-lg text-text-primary">Unlock Deeper Insights</h4>
                    <p className="text-text-muted mt-1 max-w-xs mx-auto">Track patterns and analyze your readings over time with Premium.</p>
                    <button onClick={() => setPage('Profile')} className="mt-4 px-6 py-2 text-sm rounded-lg font-bold bg-[#D95B00] text-white hover:bg-opacity-80 transition-colors">
                        Upgrade to Premium
                    </button>
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;