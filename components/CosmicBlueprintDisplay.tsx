

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CosmicBlueprint, Pinnacle, Challenge } from '../types';
import { DestinyIcon, HeritageIcon, LifePathIcon, SoulUrgeIcon, PersonalityIcon, PinnacleIcon, ChallengeIcon, BirthdayIcon, MaturityIcon, SparklesIcon } from './icons';

interface NumberCardProps {
  icon: React.ReactNode;
  title: string;
  number: number;
  theme: string;
  description: string;
  colorClass: string;
}

const NumberCard: React.FC<NumberCardProps> = ({ icon, title, number, theme, description, colorClass }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-[#0B0C10]/50 p-4 rounded-lg border-l-4 ${colorClass} transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-text-primary flex items-center gap-2">
            {icon}
            {title}
          </h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-left text-text-muted hover:text-text-primary transition-colors focus:outline-none flex items-center gap-1 group"
            aria-expanded={isExpanded}
            aria-controls={`desc-${title.replace(/\s/g, '')}`}
          >
            {theme}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-text-muted/50 group-hover:text-text-primary transition-all duration-300 ${isExpanded ? 'rotate-90' : ''}`}><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
        <span className="text-3xl font-bold font-dm-sans text-text-primary">{number}</span>
      </div>
      <div
        id={`desc-${title.replace(/\s/g, '')}`}
        className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
            <p className="text-xs text-text-muted pt-2">
              {description}
            </p>
        </div>
      </div>
    </div>
  );
};

const PinnacleChallengeCard: React.FC<{
  item: Pinnacle | Challenge;
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  onUpgrade: () => void;
}> = ({ item, title, icon, colorClass, onUpgrade }) => {
    const { isPremium } = useApp();

    return (
        <div className={`relative bg-[#0B0C10]/50 p-4 rounded-lg border-l-4 ${colorClass} transition-all duration-300 overflow-hidden`}>
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="font-semibold text-text-primary flex items-center gap-2">
                        {icon}
                        {title}
                    </h4>
                    <p className="text-sm text-left text-text-muted">{item.theme}</p>
                    <p className="text-xs text-left text-text-muted/70">{item.ageRange}</p>
                </div>
                <span className="text-3xl font-bold font-dm-sans text-text-primary">{item.number}</span>
            </div>
            <div className="pt-2">
                <p className={`text-xs text-text-muted transition-all duration-300 ${!isPremium ? 'filter blur-sm select-none' : ''}`}>
                    {item.description}
                </p>
            </div>
            {!isPremium && (
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10]/90 to-transparent flex items-end justify-center p-4">
                     <button onClick={onUpgrade} className="w-full text-xs px-4 py-2 rounded-lg font-bold bg-[#D95B00]/80 text-white hover:bg-[#D95B00] transition-colors flex items-center justify-center gap-2">
                         <SparklesIcon className="w-4 h-4" />
                         Unlock with Premium
                     </button>
                 </div>
            )}
        </div>
    );
};


interface CosmicBlueprintDisplayProps {
  blueprint: CosmicBlueprint;
}

const CosmicBlueprintDisplay: React.FC<CosmicBlueprintDisplayProps> = ({ blueprint }) => {
  const { setPage } = useApp(); // Assuming setPage is in context to navigate
  const handleUpgradeClick = () => setPage?.('Profile');

  return (
    <div className="space-y-4">
      <NumberCard
        icon={<LifePathIcon className="w-4 h-4 text-purple-400" />}
        title="Life Path Number"
        number={blueprint.lifePath.number}
        theme={blueprint.lifePath.theme}
        description={blueprint.lifePath.description}
        colorClass="border-purple-400"
      />
      <NumberCard
        icon={<DestinyIcon className="w-4 h-4 text-sky-400" />}
        title="Destiny Number"
        number={blueprint.destiny.number}
        theme={blueprint.destiny.theme}
        description={blueprint.destiny.description}
        colorClass="border-sky-400"
      />
      <NumberCard
        icon={<SoulUrgeIcon className="w-4 h-4 text-pink-400" />}
        title="Soul Urge Number"
        number={blueprint.soulUrge.number}
        theme={blueprint.soulUrge.theme}
        description={blueprint.soulUrge.description}
        colorClass="border-pink-400"
      />
        <NumberCard
        icon={<PersonalityIcon className="w-4 h-4 text-amber-400" />}
        title="Current Vibe Number"
        number={blueprint.currentVibe.number}
        theme={blueprint.currentVibe.theme}
        description={blueprint.currentVibe.description}
        colorClass="border-amber-400"
      />
        <NumberCard
        icon={<BirthdayIcon className="w-4 h-4 text-green-400" />}
        title="Birthday Number"
        number={blueprint.birthday.number}
        theme={blueprint.birthday.theme}
        description={blueprint.birthday.description}
        colorClass="border-green-400"
      />
        <NumberCard
        icon={<MaturityIcon className="w-4 h-4 text-rose-400" />}
        title="Maturity Number"
        number={blueprint.maturity.number}
        theme={blueprint.maturity.theme}
        description={blueprint.maturity.description}
        colorClass="border-rose-400"
      />
      <NumberCard
        icon={<HeritageIcon className="w-4 h-4 text-emerald-400" />}
        title="Heritage Number"
        number={blueprint.heritage.number}
        theme={blueprint.heritage.theme}
        description={blueprint.heritage.description}
        colorClass="border-emerald-400"
      />

      <div className="pt-4 space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Your Life Cycles: Pinnacles</h3>
        {blueprint.pinnacles.map((p, i) => (
            <PinnacleChallengeCard 
                key={`pinnacle-${i}`}
                item={p}
                title={`Pinnacle ${i+1}`}
                icon={<PinnacleIcon className="w-4 h-4 text-yellow-400" />}
                colorClass="border-yellow-400"
                onUpgrade={handleUpgradeClick}
            />
        ))}
      </div>

       <div className="pt-4 space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Your Life Cycles: Challenges</h3>
        {blueprint.challenges.map((c, i) => (
            <PinnacleChallengeCard 
                key={`challenge-${i}`}
                item={c}
                title={`Challenge ${i+1}`}
                icon={<ChallengeIcon className="w-4 h-4 text-red-400" />}
                colorClass="border-red-400"
                onUpgrade={handleUpgradeClick}
            />
        ))}
      </div>
      
      {blueprint.karmicDebts.length > 0 && (
        <div className="pt-4">
             <h3 className="text-lg font-semibold text-text-primary">Karmic Debt Numbers</h3>
             <div className="bg-[#0B0C10]/50 p-4 rounded-lg border-l-4 border-gray-500">
                <p className="text-sm text-text-muted">You have the following Karmic Debt numbers present in your chart: <strong className="text-text-primary">{blueprint.karmicDebts.join(', ')}</strong>. These represent specific lessons from past lives that you are working to resolve in this lifetime.</p>
             </div>
        </div>
      )}
    </div>
  );
};

export default CosmicBlueprintDisplay;
