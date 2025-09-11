
import React from 'react';
import { UserIcon } from '../components/icons';

const ProgressPage: React.FC = () => {
  const xp = 650;
  const nextLevelXp = 1000;
  const xpPercentage = (xp / nextLevelXp) * 100;

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

        {/* Right Column: Streak & Badges */}
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
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
