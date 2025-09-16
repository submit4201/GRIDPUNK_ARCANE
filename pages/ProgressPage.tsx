import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { UserIcon, BarChartIcon, SparklesIcon } from '../components/icons';
import { Page, Arcana } from '../types';

const ProgressPage: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
  const { isPremium, dailyDrawHistory, savedReadings } = useApp();
  
  const xp = 650;
  const nextLevelXp = 1000;
  const xpPercentage = (xp / nextLevelXp) * 100;

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
      // FIX: Check if the card is a Tarot card before accessing the 'arcana' property, as Runes do not have it.
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
            <h2 className="text-2xl font-semibold font-dm-sans text-text-primary">Avatar</h2>
            <div className="my-4 flex justify-center">
              <div className="w-32 h-32 rounded-full bg-[#0B0C10] flex items-center justify-center border-2 border-[#6E7BFF]">
                <UserIcon className="w-20 h-20 text-[#6E7BFF]" />
              </div>
            </div>
            <p className="font-bold text-lg text-text-primary">Stage: Neophyte</p>
            <p className="text-text-muted text-sm">Next: Initiate</p>
          </div>

          <div className="bg-[#111218] p-6 rounded-xl border border-[#232533]">
            <h3 className="text-xl font-semibold text-text-primary mb-3">Level 5</h3>
            <div className="w-full bg-[#0B0C10] rounded-full h-4 border border-[#232533]">
              <div className="bg-[#21C7F2] h-full rounded-full" style={{ width: `${xpPercentage}%` }}></div>
            </div>
            <p className="text-right text-sm text-text-muted mt-2">{xp} / {nextLevelXp} XP</p>
          </div>
           <div className="bg-[#111218] p-6 rounded-xl border border-[#232533]">
            <h3 className="text-xl font-semibold text-text-primary mb-3">Today's Buffs</h3>
            <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 bg-[#FF7A1A]/20 text-[#FF7A1A] text-sm font-semibold rounded-full">Fire Element Day</div>
                <div className="px-3 py-1 bg-[#29C26A]/20 text-[#29C26A] text-sm font-semibold rounded-full">+10% Journal XP</div>
            </div>
          </div>
        </div>

        {/* Right Column: Streak, Badges & Analysis */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111218] p-6 rounded-xl border border-[#232533]">
                <h3 className="text-xl font-semibold text-text-primary mb-3">Activity Streak</h3>
                <p className="text-4xl font-bold text-[#FF7A1A]">14 Days</p>
            </div>
            <div className="bg-[#111218] p-6 rounded-xl border border-[#232533]">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Badges</h3>
                <div className="flex flex-wrap gap-4">
                    <div className="w-20 h-20 bg-[#0B0C10] border border-[#232533] rounded-lg flex items-center justify-center text-3xl" title="First Reading">🃏</div>
                    <div className="w-20 h-20 bg-[#0B0C10] border border-[#232533] rounded-lg flex items-center justify-center text-3xl" title="7-Day Streak">🔥</div>
                    <div className="w-20 h-20 bg-[#232533] border border-[#232533] rounded-lg flex items-center justify-center text-3xl text-text-muted" title="Locked">?</div>
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
                                const total = Math.max(1, allDrawnCards.length);
                                const percentage = total > 0 ? (count / total) * 100 : 0;
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