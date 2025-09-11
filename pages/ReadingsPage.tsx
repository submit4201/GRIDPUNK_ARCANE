import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SPREAD_DETAILS } from '../constants';
import { getShuffledPreparedDeck } from '../services/tarotService';
import { DrawnCard, SpreadType } from '../types';
import TarotCardFlip from '../components/TarotCard';
import PremiumModal from '../components/PremiumModal';
import { SparklesIcon } from '../components/icons';
import { GoogleGenAI, Type } from '@google/genai';

type ReadingState = 'selection' | 'shuffling' | 'picking' | 'reading';

// A helper function to get precise, traditional layouts
const getSpreadLayout = (spread: SpreadType, cards: DrawnCard[], cardClickHandler: (index: number) => void): React.ReactNode => {
    const cardElements = cards.map((drawnCard, index, arr) => (
        <div key={index} className="flex flex-col items-center gap-2">
            <TarotCardFlip
                drawnCard={drawnCard}
                isRevealed={drawnCard.card.id !== 'placeholder'} // Only reveal actual cards
                onClick={() => cardClickHandler(index)}
                className="!w-[100px] !h-[170px] md:!w-[140px] md:!h-[240px] cursor-pointer"
            />
            <p className="text-center text-xs md:text-sm font-semibold text-text-muted h-10">
                {SPREAD_DETAILS[spread].positions[index]}
            </p>
        </div>
    ));

    switch (spread) {
        case '3-card':
            return <div className="flex justify-center items-start gap-4 md:gap-8">{cardElements}</div>;
        
        case 'the-great-work':
            return (
                <div className="grid grid-cols-3 grid-rows-3 gap-x-4 gap-y-2 w-full max-w-2xl mx-auto">
                    <div className="col-start-2 row-start-1 flex justify-center">{cardElements[3]}</div>
                    <div className="col-start-1 row-start-2 flex justify-center">{cardElements[1]}</div>
                    <div className="col-start-2 row-start-2 flex justify-center">{cardElements[0]}</div>
                    <div className="col-start-3 row-start-2 flex justify-center">{cardElements[2]}</div>
                    <div className="col-start-2 row-start-3 flex justify-center">{cardElements[4]}</div>
                </div>
            );

        case 'celtic-cross':
             return (
                <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12">
                    {/* The Cross */}
                    <div className="grid grid-cols-3 grid-rows-3 gap-x-2 gap-y-1 w-[360px] md:w-[480px]">
                        <div className="col-start-2 row-start-1 flex justify-center">{cardElements[4]}</div>
                        <div className="col-start-1 row-start-2 flex justify-center">{cardElements[3]}</div>
                        <div className="col-start-2 row-start-2 flex justify-center relative">
                            {cardElements[0]}
                            <div className="absolute top-0 left-0 w-full h-full transform rotate-90">{cardElements[1]}</div>
                        </div>
                        <div className="col-start-3 row-start-2 flex justify-center">{cardElements[5]}</div>
                        <div className="col-start-2 row-start-3 flex justify-center">{cardElements[2]}</div>
                    </div>
                    {/* The Staff */}
                    <div className="flex flex-row md:flex-col gap-4">
                        {cardElements.slice(7, 11).reverse()}
                    </div>
                    {/* The Theme */}
                    <div className="md:absolute md:bottom-0 md:left-4">{cardElements[6]}</div>
                </div>
             );

        default:
            return null;
    }
}


const ReadingsPage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const { isPremium, addSavedReading } = useApp();
  const [selectedSpread, setSelectedSpread] = useState<SpreadType | null>(null);
  const [readingState, setReadingState] = useState<ReadingState>('selection');
  
  // Deck for picking
  const [pickableCards, setPickableCards] = useState<DrawnCard[]>([]);
  // Cards in the spread
  const [pickedCards, setPickedCards] = useState<DrawnCard[]>([]);

  const [revealedCards, setRevealedCards] = useState<boolean[]>([]);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [readingTitle, setReadingTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const oracleText = useMemo(() => {
    if (!selectedSpread) return "";
    const spreadDetails = SPREAD_DETAILS[selectedSpread];
    const nextCardIndex = pickedCards.length;

    if (readingState === 'picking') {
      if (nextCardIndex < spreadDetails.cardCount) {
        return `Let your intuition guide you. Select the card for: ${spreadDetails.positions[nextCardIndex]}`;
      }
    }
    if (readingState === 'reading') {
        return "The spread is complete. Click a card to reveal its message.";
    }
    return "Your reading awaits.";
  }, [readingState, pickedCards, selectedSpread]);


  const handleSelectSpread = (spread: SpreadType) => {
    const details = SPREAD_DETAILS[spread];
    if (details.isPremium && !isPremium) {
      setIsPremiumModalOpen(true);
      return;
    }
    setSelectedSpread(spread);
    setReadingTitle(`${details.name} - ${new Date().toLocaleDateString()}`);
    setSummary('');
    setPickedCards([]);

    // Shuffle and prepare the deck for picking
    const seed = Date.now();
    const fullShuffledDeck = getShuffledPreparedDeck(seed);
    setPickableCards(fullShuffledDeck);
    
    setIsShuffling(true);
    setTimeout(() => {
        setIsShuffling(false);
        setReadingState('picking');
    }, 600);
  };
  
  const handlePickCard = (indexInFan: number) => {
    if (readingState !== 'picking' || !selectedSpread) return;

    const spreadDetails = SPREAD_DETAILS[selectedSpread];
    if (pickedCards.length >= spreadDetails.cardCount) return;

    const selectedCard = pickableCards[indexInFan];
    
    const newPickedCards = [...pickedCards, selectedCard];
    setPickedCards(newPickedCards);

    const newPickableCards = pickableCards.filter((_, i) => i !== indexInFan);
    setPickableCards(newPickableCards);
    
    if (newPickedCards.length === spreadDetails.cardCount) {
      setReadingState('reading');
      setRevealedCards(new Array(spreadDetails.cardCount).fill(false));
    }
  };

  const handleRevealCard = (index: number) => {
    if (readingState !== 'reading') return;
    setRevealedCards(prev => {
      const newRevealed = [...prev];
      newRevealed[index] = true;
      return newRevealed;
    });
  };

  const handleNewReading = () => {
    setSelectedSpread(null);
    setPickedCards([]);
    setPickableCards([]);
    setRevealedCards([]);
    setReadingTitle('');
    setSummary('');
    setReadingState('selection');
  };
  
  const handleSaveReading = () => {
      if (!selectedSpread || !pickedCards.length) return;
      addSavedReading({
          spreadType: selectedSpread,
          cards: pickedCards,
          title: readingTitle,
          notes: summary,
      });
      handleNewReading();
  };

  const generateSummary = async () => {
    if (!pickedCards.length || !selectedSpread) return;

    setIsGeneratingSummary(true);
    setSummary('');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const spreadDetails = SPREAD_DETAILS[selectedSpread];
        const cardsInfo = pickedCards.map((c, i) => 
            `- ${spreadDetails.positions[i]}: ${c.card.name} (${c.isReversed ? 'Reversed' : 'Upright'})`
        ).join('\n');

        const prompt = `Provide a concise, insightful summary of a "${spreadDetails.name}" tarot reading. Synthesize the meanings of the following cards in their positions to create a coherent narrative about the user's situation. Focus on the overarching themes and advice.\n\nHere are the cards:\n${cardsInfo}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        setSummary(response.text);
    } catch (error) {
        console.error("Error generating reading summary:", error);
        setSummary("Could not generate a summary for this reading. Please check your connection or API key setup.");
    } finally {
        setIsGeneratingSummary(false);
    }
  };


  const ReadingView = () => {
      if (!selectedSpread) return null;
      const spreadDetails = SPREAD_DETAILS[selectedSpread];
      const placeholderCards = Array(spreadDetails.cardCount).fill({ card: { id: 'placeholder' }, isReversed: false });
      const displayCards = [...pickedCards, ...placeholderCards.slice(pickedCards.length)];

      return (
        <div className="flex flex-col h-full">
            <header className="mb-4 flex-shrink-0">
                <button onClick={handleNewReading} className="text-sm text-[#6E7BFF] hover:underline mb-2">&larr; Back to Spreads</button>
                <h1 className="text-3xl font-bold font-dm-sans text-text-primary">{spreadDetails.name}</h1>
                <p className="text-text-muted">{oracleText}</p>
            </header>
            
            <div className="flex-grow overflow-y-auto pr-4 -mr-4 flex flex-col justify-between">
                {/* Spread Layout */}
                <div className="flex-grow flex items-center justify-center my-4">
                    {getSpreadLayout(selectedSpread, displayCards.map((c, i) => ({...c, isRevealed: revealedCards[i]})), handleRevealCard)}
                </div>

                {/* Card Fan for Picking */}
                {readingState === 'picking' && (
                    <div className="flex-shrink-0 h-48 flex items-center justify-center -space-x-20 md:-space-x-24 overflow-x-auto p-4">
                        {pickableCards.map((drawnCard, index) => (
                           <div key={index} className="transition-transform hover:-translate-y-4 hover:scale-110 duration-200" onClick={() => handlePickCard(index)}>
                                <TarotCardFlip
                                    drawnCard={drawnCard}
                                    isRevealed={false}
                                    className="!w-[100px] !h-[170px] md:!w-[120px] md:!h-[205px]"
                                    style={{
                                        transform: `rotate(${index * 2 - pickableCards.length}deg)`
                                    }}
                                />
                           </div>
                        ))}
                    </div>
                )}
                
                {/* AI Summary Section */}
                {readingState === 'reading' && revealedCards.every(r => r) && (
                     <div className="mt-8 bg-[#111218] p-6 rounded-xl border border-[#232533]">
                        <h2 className="text-2xl font-semibold font-dm-sans text-text-primary mb-3 flex items-center gap-2">
                            <SparklesIcon className="w-6 h-6 text-[#21C7F2]" />
                            AI-Powered Summary
                        </h2>
                        {isGeneratingSummary ? (
                           <div className="flex items-center gap-2 text-text-muted">
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-text-muted"></div>
                             <p>The cards are speaking... generating your reading summary...</p>
                           </div>
                        ) : summary ? (
                           <p className="text-text-primary whitespace-pre-wrap">{summary}</p>
                        ) : (
                           <button onClick={generateSummary} className="px-6 py-2 rounded-lg font-bold bg-[#6E7BFF] text-white hover:bg-opacity-80 transition-colors">
                            Generate Summary
                           </button>
                        )}
                        {summary && !isGeneratingSummary && (
                            <div className="mt-6 border-t border-[#232533] pt-4">
                                <input 
                                    type="text"
                                    value={readingTitle}
                                    onChange={(e) => setReadingTitle(e.target.value)}
                                    className="w-full p-2 bg-[#0B0C10] border border-[#232533] rounded-lg mb-2 focus:ring-2 focus:ring-[#6E7BFF]"
                                    placeholder="Reading Title"
                                />
                                <button onClick={handleSaveReading} className="w-full px-6 py-2 rounded-lg font-bold bg-[#29C26A] text-white hover:bg-opacity-80 transition-colors">
                                    Save Reading to Journal
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      );
  }

  const SpreadSelectionView = () => (
    <div>
        <header className="mb-8">
            <h1 className="text-4xl font-bold font-dm-sans text-text-primary">Tarot Readings</h1>
            <p className="text-text-muted">Choose a spread to begin your ritual.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(SPREAD_DETAILS).map(([key, details]) => (
            <div key={key} className={`bg-[#111218] p-6 rounded-xl border border-[#232533] flex flex-col justify-between transition-all duration-300 ${isShuffling ? 'opacity-50' : 'opacity-100'}`}>
                <div>
                    <h2 className="text-2xl font-semibold font-dm-sans text-text-primary">{details.name}</h2>
                    <p className="text-text-muted mt-1 mb-4">{details.description}</p>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-muted">{details.cardCount} Cards</span>
                    {details.isPremium && <span className="text-xs font-bold text-[#FF7A1A] bg-[#FF7A1A]/20 px-2 py-1 rounded-full">PREMIUM</span>}
                </div>
                <button
                    onClick={() => handleSelectSpread(key as SpreadType)}
                    disabled={isShuffling}
                    className={`mt-4 w-full px-6 py-2 rounded-lg font-bold bg-[#6E7BFF] text-white hover:bg-opacity-80 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed ${isShuffling ? 'is-shuffling' : ''}`}
                >
                    {isShuffling ? 'Shuffling...' : 'Shuffle & Deal'}
                </button>
            </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto relative">
      <div className="absolute top-4 right-4 w-2 h-8 bg-amber-200/20 rounded-full candle-flicker" />
      <div className="absolute top-2 right-3 w-4 h-8 bg-amber-300/30 rounded-full candle-flicker animation-delay-[-2s]" />
      
      {readingState === 'selection' ? <SpreadSelectionView /> : <ReadingView />}
      <PremiumModal 
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onUpgrade={() => {
            setIsPremiumModalOpen(false);
            setPage('Profile');
        }}
      />
    </div>
  );
};

export default ReadingsPage;
