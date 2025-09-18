
import React from 'react';
import { DrawnDivinationCard, TarotCard, Rune } from '../types';
import { ELEMENT_BORDERS, ELEMENT_COLORS, ELEMENT_HEX_COLORS } from '../constants';
import { SunIcon } from './icons';
import { SeededRandom, createNumericSeed } from '../services/tarotService';

interface DivinationCardDisplayProps {
  drawnCard: DrawnDivinationCard;
  isRevealed: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const GenerativeCardArt: React.FC<{ card: TarotCard }> = ({ card }) => {
    const seed = createNumericSeed(card.name + card.element);
    const random = new SeededRandom(seed);
    const color = ELEMENT_HEX_COLORS[card.element];
    const numLines = 10 + random.nextInt(0, 15);
    const numCircles = 5 + random.nextInt(0, 10);

    const lines = Array.from({ length: numLines }).map((_, i) => ({
        x1: random.nextInt(0, 100),
        y1: random.nextInt(0, 100),
        x2: random.nextInt(0, 100),
        y2: random.nextInt(0, 100),
        opacity: 0.1 + random.nextFloat() * 0.4,
        strokeWidth: 1 + random.nextFloat() * 2,
    }));

    const circles = Array.from({ length: numCircles }).map((_, i) => ({
        cx: random.nextInt(10, 90),
        cy: random.nextInt(10, 90),
        r: 1 + random.nextInt(0, 8),
        opacity: 0.2 + random.nextFloat() * 0.5,
    }));

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 opacity-80" preserveAspectRatio="none">
            <defs>
                <radialGradient id={`grad-${card.id}`}>
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="100" height="100" fill={`url(#grad-${card.id})`} />
            {lines.map((l, i) => (
                <line key={`line-${i}`} {...l} stroke={color} style={{ opacity: l.opacity, strokeWidth: `${l.strokeWidth}px` }} />
            ))}
            {circles.map((c, i) => (
                <circle key={`circle-${i}`} {...c} fill="none" stroke={color} style={{ opacity: c.opacity }} />
            ))}
        </svg>
    );
};


const AngelCardDisplay: React.FC<{ drawnCard: DrawnDivinationCard, isRevealed: boolean, className?: string, style?: React.CSSProperties, onClick?: () => void }> = ({ drawnCard, isRevealed, className, style, onClick }) => {
    const { card } = drawnCard;
    
    const Back = () => (
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-[#1c2c4c] to-[#0d1629] rounded-2xl border border-[#3a5a9d] flex flex-col items-center justify-center p-4 overflow-hidden group-hover:shadow-[0_0_20px_rgba(150,180,255,0.6)] group-hover:-translate-y-1 transition-all duration-300">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(180,200,255,0.2),rgba(255,255,255,0))] opacity-50"></div>
           <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[#a8c0ff]"><path d="M2 12c0-2.8 1.4-5.2 3.5-6.6"/><path d="M20 13.3V9c0-1.7-1.3-3-3-3h-2.5c-1.4 0-2.5-1.1-2.5-2.5V2"/><path d="M22 12c0 2.8-1.4 5.2-3.5 6.6"/><path d="M4 10.7V15c0 1.7 1.3 3 3 3h2.5c-1.4 0-2.5 1.1-2.5 2.5V22"/><path d="M12 2v2.5c0 1.4 1.1 2.5 2.5 2.5H17c1.7 0 3 1.3 3 3v4.3"/><path d="M12 22v-2.5c0-1.4-1.1-2.5-2.5-2.5H7c-1.7 0-3-1.3-3-3v-4.3"/></svg>
             <h4 className="text-lg font-semibold tracking-wider uppercase text-[#a8c0ff]">Angel Guidance</h4>
           </div>
           <div className={`absolute inset-0 rounded-2xl border-2 border-[#a8c0ff] opacity-30`}></div>
        </div>
    );

    const Front = () => (
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-[#1c2c4c] to-[#0d1629] rounded-2xl border border-[#3a5a9d] flex flex-col items-center justify-center p-6 overflow-hidden" style={{ transform: 'rotateY(180deg)' }}>
            <div className={`relative flex h-full w-full flex-col items-center justify-center transition-opacity duration-500 text-center ${isRevealed ? 'opacity-100 delay-300' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(180,200,255,0.3),rgba(255,255,255,0))] opacity-70"></div>
                <div className={`absolute inset-0 rounded-2xl border-2 border-[#a8c0ff] opacity-50`}></div>
                <p className="mt-4 text-2xl text-[#f0f4ff] font-semibold tracking-wide">{card.name}</p>
            </div>
        </div>
    );
     return (
        <div className={`w-[280px] h-[480px] perspective-[1000px] group ${className}`} style={style} onClick={onClick}>
            <div className="relative w-full h-full transition-transform duration-1000 ease-in-out" style={{ transformStyle: 'preserve-3d', transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                <Back />
                <Front />
            </div>
        </div>
    );
};

const RuneDisplay: React.FC<{ drawnCard: DrawnDivinationCard, isRevealed: boolean, className?: string, style?: React.CSSProperties, onClick?: () => void }> = ({ drawnCard, isRevealed, className, style, onClick }) => {
    const { card, isReversed } = drawnCard;
    if (!card || !('symbol' in card)) {
        return <div className={`w-[280px] h-[480px] bg-[#111218] rounded-2xl border border-[#232533] ${className}`} style={style}></div>;
    }
    const rune = card as Rune;

    // A smaller, stone-like component with a more distinct, ancient feel
    return (
        <div
            className={`relative group transition-all duration-300 ${className}`}
            style={style}
            onClick={onClick}
        >
            <div className="w-full h-full bg-gradient-to-br from-[#3c3c43] via-[#242428] to-[#111218] rounded-lg shadow-inner shadow-black/70 flex items-center justify-center p-2 border border-[#55596b] group-hover:border-[#9fa8c2] group-hover:-translate-y-1 group-hover:shadow-[0_0_15px_rgba(199,210,225,0.2)] transition-all duration-300">
                <span className={`font-mono font-bold text-slate-300 transition-transform duration-500 text-4xl md:text-5xl [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)] ${isReversed ? 'rotate-180' : ''}`}>
                    {rune.symbol}
                </span>
            </div>
        </div>
    );
};


const TarotCardDisplay: React.FC<{ drawnCard: DrawnDivinationCard, isRevealed: boolean, className?: string, style?: React.CSSProperties, onClick?: () => void }> = ({ drawnCard, isRevealed, className, style, onClick }) => {
  const { card, isReversed } = drawnCard;
  
  if (!card) {
      return <div className={`w-[280px] h-[480px] bg-[#111218] rounded-2xl border border-[#232533] ${className}`} style={style}></div>;
  }
  
  const tarotCard = card as TarotCard;

  if (!tarotCard.element) {
    return (
      <div 
        className={`w-[280px] h-[480px] relative ${className}`}
        style={style}
        onClick={onClick}
      >
        <div className="absolute w-full h-full bg-[#111218]/50 backdrop-blur-md rounded-2xl border border-[#232533] flex flex-col items-center justify-center p-4 overflow-hidden">
           <div className="absolute inset-0 bg-grid opacity-20"></div>
           <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-center">
            <SunIcon className="w-24 h-24 text-[#6E7BFF]/50" />
             <h3 className="text-lg font-semibold tracking-wider uppercase text-text-muted">Gridpunk Arcana</h3>
           </div>
           <div className={`absolute inset-0 rounded-2xl border-2 border-[#6E7BFF] opacity-30`}></div>
        </div>
      </div>
    );
  }

  const elementBorder = ELEMENT_BORDERS[tarotCard.element];
  const elementColor = ELEMENT_COLORS[tarotCard.element];

  return (
    <div
      className={`w-[280px] h-[480px] perspective-[1000px] group ${className}`}
      style={style}
      onClick={onClick}
    >
      <div
        className="relative w-full h-full transition-transform duration-1000 ease-in-out"
        style={{ transformStyle: 'preserve-3d', transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Card Back */}
        <div className="absolute w-full h-full backface-hidden bg-[#111218]/50 backdrop-blur-md rounded-2xl border border-[#232533] flex flex-col items-center justify-center p-4 overflow-hidden group-hover:shadow-[0_0_20px_rgba(110,123,255,0.5)] group-hover:-translate-y-1 transition-all duration-300">
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
          {tarotCard && (
            <div className={`relative flex h-full w-full flex-col justify-between transition-opacity duration-500 ${isRevealed ? 'opacity-100 delay-300' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-grid opacity-10"></div>
              <div className={`absolute inset-0 rounded-2xl border-2 ${elementBorder} opacity-50`}></div>
              
              <div className="relative z-10 text-left">
                <h2 className={`text-3xl font-bold font-dm-sans ${elementColor}`}>{tarotCard.name}</h2>
                <p className="text-sm text-text-muted">{tarotCard.arcana} Arcana</p>
              </div>
              
              <div className="relative z-10 flex items-center justify-center grow">
                <GenerativeCardArt card={tarotCard} />
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


const DivinationCardDisplay: React.FC<DivinationCardDisplayProps> = (props) => {
    const { drawnCard } = props;

    if (!drawnCard || !drawnCard.card || !drawnCard.card.id) {
        // Render a placeholder or empty state
        return <TarotCardDisplay {...props} drawnCard={{ card: {} as TarotCard, isReversed: false }} />;
    }
    
    const cardId = drawnCard.card.id;
    if (cardId.startsWith('rune_')) {
        return <RuneDisplay {...props} />;
    } else if (cardId.startsWith('angel_')) {
        return <AngelCardDisplay {...props} />;
    } else {
        return <TarotCardDisplay {...props} />;
    }
};

export default DivinationCardDisplay;
