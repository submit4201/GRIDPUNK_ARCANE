import React from 'react';
import { DrawnCard, TarotCard, Arcana } from '../types';
import { ELEMENT_BORDERS, ELEMENT_COLORS } from '../constants';
import { SunIcon, FireIcon, WaterIcon, AirIcon, EarthIcon, MajorArcanaIcon } from './icons';

interface TarotCardProps {
  drawnCard: DrawnCard;
  isRevealed: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const CardArt: React.FC<{ card: TarotCard, className?:string }> = ({ card, className }) => {
    const elementColorClass = ELEMENT_COLORS[card.element].replace('text-', '');
    const iconProps = { className: `w-32 h-32 text-[${elementColorClass}]/80 ${className}`};

    if (card.arcana === 'Major') {
        return <MajorArcanaIcon {...iconProps} />;
    }
    switch (card.element) {
        case 'Fire': return <FireIcon {...iconProps} />;
        case 'Water': return <WaterIcon {...iconProps} />;
        case 'Air': return <AirIcon {...iconProps} />;
        case 'Earth': return <EarthIcon {...iconProps} />;
        default: return <SunIcon {...iconProps} />;
    }
};


const TarotCardFlip: React.FC<TarotCardProps> = ({ drawnCard, isRevealed, className, style, onClick }) => {
  const { card, isReversed } = drawnCard;
  if (!card) {
      return <div className={`w-[280px] h-[480px] bg-[#111218] rounded-2xl border border-[#232533] ${className}`} style={style}></div>;
  }
  const elementBorder = ELEMENT_BORDERS[card.element];
  const elementColor = ELEMENT_COLORS[card.element];

  return (
    <div
      className={`w-[280px] h-[480px] perspective-[1000px] ${className}`}
      style={style}
      onClick={onClick}
    >
      <div
        className="relative w-full h-full transition-transform duration-700 ease-out"
        style={{ transformStyle: 'preserve-3d', transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Card Back */}
        <div className="absolute w-full h-full backface-hidden bg-[#111218]/50 backdrop-blur-md rounded-2xl border border-[#232533] flex flex-col items-center justify-center p-4 overflow-hidden">
           <div className="absolute inset-0 bg-grid opacity-20"></div>
           <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-center">
            <SunIcon className="w-24 h-24 text-[#6E7BFF]/50" />
             <h3 className="text-lg font-semibold tracking-wider uppercase text-text-muted">Gridpunk Arcana</h3>
           </div>
           <div className={`absolute inset-0 rounded-2xl border-2 border-[#6E7BFF] opacity-30`}></div>
        </div>
        
        {/* Card Front */}
        <div
          className="absolute w-full h-full backface-hidden bg-[#111218]/80 backdrop-blur-md rounded-2xl border border-[#232533] flex flex-col justify-between p-6 overflow-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          {card && (
            <div className={`relative flex h-full w-full flex-col justify-between transition-opacity duration-500 ${isRevealed ? 'opacity-100 delay-300' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-grid opacity-10"></div>
              <div className={`absolute inset-0 rounded-2xl border-2 ${elementBorder} opacity-50`}></div>
              
              <div className="relative z-10 text-left">
                <h2 className={`text-3xl font-bold font-dm-sans ${elementColor}`}>{card.name}</h2>
                <p className="text-sm text-text-muted">{card.arcana} Arcana</p>
              </div>
              
              <div className="relative z-10 flex items-center justify-center grow">
                <CardArt card={card} />
              </div>
              
              <div className={`relative z-10 text-right transition-transform duration-300 ${isReversed ? 'transform -rotate-180' : ''}`}>
                <h3 className={`text-xl font-semibold font-dm-sans ${elementColor}`}>{isReversed ? 'Reversed' : 'Upright'}</h3>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TarotCardFlip;