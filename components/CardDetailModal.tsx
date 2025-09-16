import React from 'react';
import { DrawnDivinationCard, TarotCard, AngelCard } from '../types';
import { ELEMENT_COLORS, ELEMENT_BORDERS } from '../constants';
import { SparklesIcon, ZapIcon, AirIcon, EarthIcon, FireIcon, WaterIcon, MajorArcanaIcon } from './icons';

const CardDetailModal: React.FC<{ drawnCard: DrawnDivinationCard | null; onClose: () => void; }> = ({ drawnCard, onClose }) => {
    if (!drawnCard) return null;

    const { card } = drawnCard;
    const cardId = card.id;
    const isTarot = 'arcana' in card;
    const isAngel = cardId.startsWith('angel_');
    
    let borderColor = 'border-[#232533]';
    let textColor = 'text-text-primary';

    if (isTarot) {
        borderColor = ELEMENT_BORDERS[(card as TarotCard).element] + '/50';
        textColor = ELEMENT_COLORS[(card as TarotCard).element];
    } else if (isAngel) {
        borderColor = 'border-[#a8c0ff]/50';
        textColor = 'text-[#a8c0ff]';
    }


    const ElementIcon = () => {
        if (!isTarot) return null;
        const tarotCard = card as TarotCard;
        const iconProps = { className: `w-5 h-5 ${ELEMENT_COLORS[tarotCard.element]}`};
        if (tarotCard.arcana === 'Major') { return <MajorArcanaIcon {...iconProps} />; }
        switch (tarotCard.element) {
            case 'Fire': return <FireIcon {...iconProps} />;
            case 'Water': return <WaterIcon {...iconProps} />;
            case 'Air': return <AirIcon {...iconProps} />;
            case 'Earth': return <EarthIcon {...iconProps} />;
            default: return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className={`relative max-w-lg w-full bg-[#111218] rounded-2xl border ${borderColor} p-6 md:p-8 space-y-4 overflow-y-auto max-h-[90vh] shadow-2xl shadow-black/40`}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="card-detail-title"
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
                    aria-label="Close card details"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                
                <div className="text-center border-b border-[#232533] pb-4">
                    <h2 id="card-detail-title" className={`text-3xl font-bold font-dm-sans ${textColor}`}>{card.name}</h2>
                    {isTarot && <p className="text-sm text-text-muted">{(card as TarotCard).arcana} Arcana</p>}
                     {isAngel && <p className="text-sm text-text-muted">Angelic Guidance</p>}
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-amber-400"/> Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                            {card.keywords.map(kw => (
                                <span key={kw} className="px-3 py-1 bg-[#232533] text-sm text-text-primary rounded-full">{kw}</span>
                            ))}
                        </div>
                    </div>
                    
                    {isTarot ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#0B0C10]/50 p-4 rounded-lg">
                                <h4 className="font-semibold text-text-primary mb-1">Upright Meaning</h4>
                                <p className="text-sm text-text-muted">{card.meaning}</p>
                            </div>
                            <div className="bg-[#0B0C10]/50 p-4 rounded-lg">
                                <h4 className="font-semibold text-text-primary mb-1">Reversed Meaning</h4>
                                <p className="text-sm text-text-muted">{(card as TarotCard).reversedMeaning}</p>
                            </div>
                        </div>
                    ) : (
                         <div className="bg-[#0B0C10]/50 p-4 rounded-lg">
                            <h4 className="font-semibold text-text-primary mb-1">Meaning</h4>
                            <p className="text-sm text-text-muted">{card.meaning}</p>
                        </div>
                    )}

                    {isTarot && (
                        <>
                        <div>
                            <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2"><ZapIcon className="w-5 h-5 text-green-400"/> Micro Quest</h3>
                            <p className="text-sm text-text-muted italic">{(card as TarotCard).microQuest}</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2"><ElementIcon /> Element</h3>
                            <p className={`text-sm font-bold ${textColor}`}>{(card as TarotCard).element}</p>
                        </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CardDetailModal;