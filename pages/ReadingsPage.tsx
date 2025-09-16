import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SpreadType, DrawnDivinationCard, Page, DeckType, DivinationCard, Rune } from '../types';
import { SPREAD_DETAILS, TAROT_DECK, RUNE_DECK, ANGEL_CARD_DECK } from '../constants';
import { getShuffledPreparedDeck, SeededRandom, castRunes } from '../services/tarotService';
import DivinationCardDisplay from '../components/TarotCard';
import PremiumModal from '../components/PremiumModal';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon, CardsIcon } from '../components/icons';
import { generateCosmicBlueprint } from '../services/cosmicService';

const ShufflingAnimation: React.FC<{ deckType: DeckType }> = ({ deckType }) => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-semibold font-dm-sans text-text-primary mb-8 animate-pulse">
            {deckType === 'runes' ? 'Casting the runes...' : 'Shuffling the digital ether...'}
        </h2>
        <div className="relative w-40 h-64">
            <div className={`absolute w-full h-full bg-[#111218] rounded-lg border ${deckType === 'runes' ? 'border-[#34384a]' : 'border-[#232533]'} animate-shuffle-1`}></div>
            <div className={`absolute w-full h-full bg-[#111218] rounded-lg border ${deckType === 'runes' ? 'border-[#34384a]' : 'border-[#232533]'} animate-shuffle-2`}></div>
            <div className={`absolute w-full h-full bg-[#111218] rounded-lg border ${deckType === 'runes' ? 'border-[#34384a]' : 'border-[#232533]'} animate-shuffle-3`}></div>
        </div>
    </div>
);

const PlaceholderCard: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`relative bg-[#111218]/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-[#232533] ${className}`}>
    </div>
);


const ReadingsPage: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
    const { isPremium, addSavedReading, userProfile, runeCastsToday, incrementRuneCast } = useApp();
    const [readingStep, setReadingStep] = useState<'select-deck' | 'select-spread' | 'shuffling' | 'draw-cards' | 'view-reading'>('select-deck');
    const [selectedDeckType, setSelectedDeckType] = useState<DeckType | null>(null);
    const [selectedSpread, setSelectedSpread] = useState<SpreadType | null>(null);
    const [shuffledDeck, setShuffledDeck] = useState<DrawnDivinationCard[]>([]);
    const [drawnCards, setDrawnCards] = useState<(DrawnDivinationCard | null)[]>([]);
    const [areCardsRevealed, setAreCardsRevealed] = useState(false);
    const [aiSummary, setAiSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [readingTitle, setReadingTitle] = useState('');
    const [error, setError] = useState('');
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [readingSeed, setReadingSeed] = useState(0);
    const [pickedCardIds, setPickedCardIds] = useState<Set<string>>(new Set());
    const [areRunesSettled, setAreRunesSettled] = useState(false);

    const cosmicBlueprint = generateCosmicBlueprint(userProfile);

    const cardPositions = useMemo(() => {
        if (readingStep !== 'draw-cards' || !shuffledDeck.length) return [];
        const random = new SeededRandom(readingSeed);
        return shuffledDeck.map(() => ({
            x: random.nextInt(-45, 45), // Percent of container
            y: random.nextInt(-40, 40), // Percent of container
            rot: random.nextInt(-60, 60), // Degrees
        }));
    }, [readingStep, shuffledDeck, readingSeed]);
    
    const handleSelectDeck = (deckType: DeckType) => {
        if ((deckType === 'runes' || deckType === 'angel-cards') && !isPremium) {
            setIsPremiumModalOpen(true);
            return;
        }
        setSelectedDeckType(deckType);
        setReadingStep('select-spread');
    }

    const handleSelectSpread = (spreadType: SpreadType) => {
        if (!selectedDeckType) return;
        
        if (selectedDeckType === 'runes' && !isPremium && runeCastsToday >= 1) {
            setError("You've reached your daily limit of 1 free rune cast. Upgrade to Premium for unlimited casts.");
            setTimeout(() => setError(''), 5000);
            return;
        }

        const spreadDetails = SPREAD_DETAILS[spreadType];
        if (spreadDetails.isPremium && !isPremium) {
            setIsPremiumModalOpen(true);
            return;
        }
        
        const seed = Date.now();
        setReadingSeed(seed);
        
        if (selectedDeckType === 'runes') {
             const castedRunes = castRunes(spreadDetails.cardCount);
             setDrawnCards(castedRunes);
             incrementRuneCast();
        } else {
            let deck: DivinationCard[];
            switch(selectedDeckType) {
                case 'tarot': deck = TAROT_DECK; break;
                case 'angel-cards': deck = ANGEL_CARD_DECK; break;
                default: deck = TAROT_DECK;
            }
            const preparedDeck = getShuffledPreparedDeck(deck, seed);
            setShuffledDeck(preparedDeck);
            setDrawnCards(Array(spreadDetails.cardCount).fill(null));
        }
        
        setSelectedSpread(spreadType);
        setReadingTitle(`${spreadDetails.name} ${selectedDeckType === 'runes' ? 'Rune' : selectedDeckType === 'angel-cards' ? 'Angel' : 'Tarot'} Reading - ${new Date().toLocaleDateString()}`);
        setAreCardsRevealed(false);
        setAiSummary('');
        setError('');
        setIsGenerating(false);
        setPickedCardIds(new Set());
        setAreRunesSettled(false);

        setReadingStep('shuffling');
        setTimeout(() => {
            if (selectedDeckType === 'runes') {
                setReadingStep('view-reading');
                setTimeout(() => setAreCardsRevealed(true), 50); // Reveal runes immediately
                setTimeout(() => setAreRunesSettled(true), 100); // Trigger animation
            } else {
                setReadingStep('draw-cards');
            }
        }, 1500);
    };
    
    const handleSelectCardFromScatter = (cardToDraw: DrawnDivinationCard) => {
        if (!selectedSpread || pickedCardIds.has(cardToDraw.card.id)) return;
    
        const nextCardIndex = drawnCards.findIndex(c => c === null);
        if (nextCardIndex === -1) return;
    
        const newDrawnCards = [...drawnCards];
        newDrawnCards[nextCardIndex] = cardToDraw;
        setDrawnCards(newDrawnCards);
    
        setPickedCardIds(prev => new Set(prev).add(cardToDraw.card.id));
    
        if (nextCardIndex === SPREAD_DETAILS[selectedSpread].cardCount - 1) {
            setTimeout(() => setReadingStep('view-reading'), 300);
        }
    };
    
    const resetReading = (to: 'select-deck' | 'select-spread' = 'select-deck') => {
        setReadingStep(to);
        setSelectedSpread(null);
        setDrawnCards([]);
        setShuffledDeck([]);
        if (to === 'select-deck') {
            setSelectedDeckType(null);
        }
    };


    const generateSummary = async () => {
        if (!selectedSpread || !selectedDeckType || drawnCards.includes(null)) return;
        setIsGenerating(true);
        setError('');
        
        const spreadDetails = SPREAD_DETAILS[selectedSpread];
        const cardsString = (drawnCards as DrawnDivinationCard[]).map((c, i) => {
            let state = c.isReversed ? 'Merkstave' : 'Upright';
            if (selectedDeckType === 'angel-cards') state = 'Drawn';
            if (selectedDeckType === 'tarot') state = c.isReversed ? 'Reversed' : 'Upright';
            
            let runeDetails = '';
            if (selectedDeckType === 'runes' && spreadDetails.name.includes('Cast')) {
                const clusterInfo = c.clusterId ? `, Cluster: ${c.clusterId}`: ' (Isolated)';
                runeDetails = ` (Position: {x: ${Math.round(c.x!)}, y: ${Math.round(c.y!)}}, Proximity: ${c.proximity}${clusterInfo})`
            }
            return `${i + 1}. ${spreadDetails.positions[i]}: ${c.card.name} (${state})${runeDetails}`
        }).join('\n');
        
        const blueprintSummary = `
          - Life Path Number: ${cosmicBlueprint.lifePath.number} (${cosmicBlueprint.lifePath.theme})
          - Destiny Number: ${cosmicBlueprint.destiny.number} (${cosmicBlueprint.destiny.theme})
          - Soul Urge: ${cosmicBlueprint.soulUrge.number} (${cosmicBlueprint.soulUrge.theme})
          - Preferred Reading Style: ${userProfile.readingStyle}
          - Stated Life Focus: ${userProfile.readingFocus}
        `;

        let divinationSystem = 'Tarot';
        if (selectedDeckType === 'runes') divinationSystem = 'Elder Futhark Rune';
        if (selectedDeckType === 'angel-cards') divinationSystem = 'Angel Card';
        

        let prompt: string;
        if (selectedDeckType === 'runes') {
             prompt = `You are a master rune reader (vitki), providing a deep, comprehensive interpretation of a rune cast. Your analysis must be insightful, personalized, and account for the chosen spread.
            
            **Seeker's Cosmic Blueprint & Preferences:**
            ${blueprintSummary}
    
            **Reading Details:**
            - System: Elder Futhark Runes
            - Spread: "${spreadDetails.name}" (Purpose: ${spreadDetails.description})
            - Runes Cast ${spreadDetails.name.includes('Cast') ? '(with spatial data)' : ''}:
            ${cardsString}
    
            **Instructions:**
            Craft a multi-layered, synthesized narrative. Your entire response must be in a **${userProfile.readingStyle}** tone, framed by their focus on **'${userProfile.readingFocus}'**.
            1.  **Core Theme:** Identify the central story the runes tell as a whole.
            2.  **Synthesis with Context (CRUCIAL):**
                - **For fixed spreads (Cross, Grid, etc.):** Interpret each rune based on its specific positional meaning. Weave them into a coherent narrative.
                - **For a Full Cast (Scatter):** Incorporate the spatial data. How do 'inner' runes affect the core issue? How do clustered runes modify each other? How do 'isolated' or 'outer' runes represent external influences?
            3.  **Profound Personalization:**
                - **Life Path Connection:** How does this reading's narrative serve as a critical chapter in their **Life Path (${cosmicBlueprint.lifePath.number})** journey?
                - **Destiny Number Activation:** What mission related to their **Destiny Number (${cosmicBlueprint.destiny.number})** is being activated, particularly concerning their focus on **'${userProfile.readingFocus}'**?
            4.  **Actionable Guidance & Affirmation:** Conclude with 2-3 clear, actionable steps and a powerful, personalized affirmation.
    
            **Tone:** ${userProfile.readingStyle}, profound, deeply personal, and empowering.`;
        } else if (isPremium) {
            prompt = `You are a master ${divinationSystem} reader, providing a deep, comprehensive interpretation for a premium client. Your analysis must be exceptionally insightful, personalized to their blueprint and preferences.
            
            **Seeker's Cosmic Blueprint & Preferences:**
            ${blueprintSummary}
    
            **Reading Details:**
            - System: ${divinationSystem}
            - Spread: "${spreadDetails.name}" (Purpose: ${spreadDetails.description})
            - Items Drawn:
            ${cardsString}
    
            **Instructions:**
            Craft a multi-layered, synthesized narrative. Your entire response must be written in a **${userProfile.readingStyle}** tone and be framed through the lens of their life focus on **'${userProfile.readingFocus}'**.
            1.  **Core Theme & Central Tension:** Begin by identifying the central theme, specifically as it relates to **'${userProfile.readingFocus}'**. What is the deep story here for them?
            2.  **Positional Synthesis:** Weave the item meanings together based on their positions to tell a coherent story that is relevant to their focus.
            3.  **Profound Personalization (Crucial):**
                - **Life Path Connection:** How does this reading's narrative serve as a critical chapter in their **Life Path (${cosmicBlueprint.lifePath.number})** journey? Be specific.
                - **Destiny Number Activation:** What mission related to their **Destiny Number (${cosmicBlueprint.destiny.number})** is being activated by this spread, particularly concerning their focus on **'${userProfile.readingFocus}'**?
                - **Soul Urge Reflection:** How does the emotional core of this reading mirror their deepest motivations, as defined by their **Soul Urge (${cosmicBlueprint.soulUrge.number})**?
            4.  **Actionable Guidance & Affirmation:** Conclude with 2-3 clear, actionable steps that align with the **${userProfile.readingStyle}** style. Provide a powerful, personalized affirmation they can use.
    
            **Tone:** ${userProfile.readingStyle}, profound, deeply personal, and empowering.`;
        } else {
            prompt = `You are a ${divinationSystem} reader interpreting a spread.
            
            **Reading Details:**
            - System: ${divinationSystem}
            - Spread: "${spreadDetails.name}"
            - Items Drawn:
            ${cardsString}
    
            **Instructions:**
            Provide a concise summary of the reading.
            1.  **Overall Meaning:** Briefly state the main theme of the reading.
            2.  **Item-by-Item:** Give a one-sentence interpretation for each item in its position.
            3.  **Advice:** Conclude with one piece of general advice.
    
            **Tone:** Clear, direct, and encouraging. Keep it brief.`;
        }

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setAiSummary(response.text);
        } catch (err) {
            console.error("Error generating summary:", err);
            setError("The spiritual energies are currently unclear. Please try again later.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveReading = () => {
        if (!selectedSpread || !selectedDeckType || drawnCards.includes(null)) return;
        addSavedReading({
            spreadType: selectedSpread,
            deckType: selectedDeckType,
            positions: SPREAD_DETAILS[selectedSpread].positions,
            cards: drawnCards as DrawnDivinationCard[],
            title: readingTitle,
            aiSummary: aiSummary,
            userNotes: '',
        });
        setPage('Journal');
    };
    
    const renderDeckSelector = () => (
         <div className="w-full h-full p-4 md:p-8 overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-dm-sans text-text-primary">Choose Your Tool</h1>
                <p className="text-text-muted">Select a divination system for your reading.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div onClick={() => handleSelectDeck('tarot')} className="bg-[#111218] p-6 rounded-xl border border-[#232533] hover:border-[#6E7BFF] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center">
                    <CardsIcon className="w-16 h-16 text-[#6E7BFF]" />
                    <h2 className="text-2xl font-semibold font-dm-sans text-text-primary mt-4">Tarot</h2>
                    <p className="text-text-muted mt-2 text-sm flex-grow">Classic 78-card deck for detailed insight into life's journey.</p>
                </div>
                 <div onClick={() => handleSelectDeck('runes')} className="bg-[#111218] p-6 rounded-xl border border-[#232533] hover:border-[#FF7A1A] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center">
                    <span className="text-6xl text-[#FF7A1A]">ᛝ</span>
                    <h2 className="text-2xl font-semibold font-dm-sans text-text-primary mt-4">Runes</h2>
                     <p className="text-text-muted mt-2 text-sm flex-grow">Ancient Elder Futhark symbols for potent, focused guidance.</p>
                     <span className="text-xs font-bold text-[#FF7A1A] bg-[#FF7A1A]/20 px-2 py-1 rounded-full mt-4">PREMIUM</span>
                </div>
                 <div onClick={() => handleSelectDeck('angel-cards')} className="bg-[#111218] p-6 rounded-xl border border-[#232533] hover:border-[#a8c0ff] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[#a8c0ff]"><path d="M2 12c0-2.8 1.4-5.2 3.5-6.6"/><path d="M20 13.3V9c0-1.7-1.3-3-3-3h-2.5c-1.4 0-2.5-1.1-2.5-2.5V2"/><path d="M22 12c0 2.8-1.4 5.2-3.5 6.6"/><path d="M4 10.7V15c0 1.7 1.3 3 3 3h2.5c1.4 0 2.5 1.1 2.5 2.5V22"/><path d="M12 2v2.5c0 1.4 1.1 2.5 2.5 2.5H17c1.7 0 3 1.3 3 3v4.3"/><path d="M12 22v-2.5c0-1.4-1.1-2.5-2.5-2.5H7c-1.7 0-3-1.3-3-3v-4.3"/></svg>
                    <h2 className="text-2xl font-semibold font-dm-sans text-text-primary mt-4">Angel Cards</h2>
                     <p className="text-text-muted mt-2 text-sm flex-grow">Gentle and uplifting messages from the angelic realm.</p>
                     <span className="text-xs font-bold text-[#a8c0ff] bg-[#a8c0ff]/20 px-2 py-1 rounded-full mt-4">PREMIUM</span>
                </div>
            </div>
         </div>
    );
    
    const renderSpreadSelector = () => {
        if (!selectedDeckType) return null;

        const availableSpreads = Object.entries(SPREAD_DETAILS).filter(([_, details]) => details.deck.includes(selectedDeckType));
        const deckName = selectedDeckType.charAt(0).toUpperCase() + selectedDeckType.slice(1).replace('-', ' ');

        return (
            <div className="w-full h-full p-4 md:p-8 overflow-y-auto">
                <header className="mb-8">
                    <button onClick={() => resetReading('select-deck')} className="text-sm text-text-muted hover:text-text-primary mb-2">
                        &larr; Back to Deck Selection
                    </button>
                    <h1 className="text-4xl font-bold font-dm-sans text-text-primary">{deckName} Readings</h1>
                    <p className="text-text-muted">Choose a spread to gain insight into your situation.</p>
                    {error && <p className="mt-2 text-amber-400 bg-amber-500/10 p-2 rounded-md">{error}</p>}
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {availableSpreads.map(([key, details]) => (
                        <div 
                            key={key} 
                            onClick={() => handleSelectSpread(key as SpreadType)}
                            className="bg-[#111218] p-6 rounded-xl border border-[#232533] hover:border-[#6E7BFF] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                        >
                            <div className="flex justify-between items-start">
                               <h2 className="text-2xl font-semibold font-dm-sans text-text-primary">{details.name}</h2>
                               {details.isPremium && (
                                <span className="text-xs font-bold text-[#FF7A1A] bg-[#FF7A1A]/20 px-2 py-1 rounded-full">PREMIUM</span>
                               )}
                            </div>
                            <p className="text-text-muted mt-2 text-sm flex-grow">{details.description}</p>
                            <p className="text-text-primary font-bold mt-4">{details.cardCount} {selectedDeckType === 'runes' ? 'Runes' : 'Cards'}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }


    const renderReadingInterface = () => {
        if (!selectedSpread || !selectedDeckType) return null;
        const spreadDetails = SPREAD_DETAILS[selectedSpread];
        const cardsDrawnCount = drawnCards.filter(c => c !== null).length;
        const totalCards = spreadDetails.cardCount;
        
        if (readingStep === 'draw-cards') {
            const cardsToDrawCount = totalCards - cardsDrawnCount;
            return (
                <div className="w-full h-full p-4 md:p-8 flex flex-col overflow-hidden">
                    <header className="mb-4 flex-shrink-0 text-center">
                        <h1 className="text-2xl font-bold font-dm-sans text-text-primary">{spreadDetails.name}</h1>
                        <p className="text-text-muted">
                            Select {cardsToDrawCount} more {selectedDeckType === 'runes' ? 'rune' : 'card'}{cardsToDrawCount !== 1 ? 's' : ''} from the cosmic field below.
                        </p>
                    </header>

                    <div className="flex-shrink-0 flex flex-wrap justify-center items-start gap-x-4 gap-y-2 p-4 bg-[#0B0C10]/50 rounded-xl mb-4 min-h-[12rem] content-center">
                        {drawnCards.map((card, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <p className="text-xs font-semibold text-text-muted h-5 mb-1 truncate">{spreadDetails.positions[index]}</p>
                                {card ?
                                    <DivinationCardDisplay drawnCard={card} isRevealed={false} className="!w-[100px] !h-[170px]" />
                                    : <PlaceholderCard className="!w-[100px] !h-[170px]" />
                                }
                            </div>
                        ))}
                    </div>

                    <div className="relative flex-grow rounded-lg overflow-hidden bg-black/20 border border-[#232533]">
                        {shuffledDeck.map((dCard, index) => {
                            const pos = cardPositions[index];
                            const isPicked = pickedCardIds.has(dCard.card.id);
                            if (!pos) return null;

                            return (
                                <div
                                    key={dCard.card.id}
                                    className={`absolute transition-all duration-300 ${isPicked ? 'opacity-0 scale-50' : 'opacity-100 scale-100'} hover:!z-50 hover:scale-110`}
                                    style={{
                                        top: `calc(50% + ${pos.y}%)`,
                                        left: `calc(50% + ${pos.x}%)`,
                                        transform: `translate(-50%, -50%) rotate(${pos.rot}deg)`,
                                        pointerEvents: isPicked ? 'none' : 'auto',
                                    }}
                                >
                                    <DivinationCardDisplay
                                        drawnCard={dCard}
                                        isRevealed={false}
                                        onClick={() => handleSelectCardFromScatter(dCard)}
                                        className="!w-[120px] !h-[204px] cursor-pointer"
                                    />
                                </div>
                            );
                        })}
                    </div>
                     <div className="flex-shrink-0 pt-4">
                        <button onClick={() => resetReading('select-spread')} className="text-sm text-text-muted hover:text-text-primary mx-auto block">
                            &larr; Back to Spreads
                        </button>
                     </div>
                </div>
            );
        }
        
        return (
             <div className="w-full h-full p-4 md:p-8 flex flex-col overflow-y-auto">
                <header className="mb-6 flex-shrink-0">
                    <button onClick={() => resetReading('select-spread')} className="text-sm text-text-muted hover:text-text-primary mb-2">
                        &larr; Back to Spreads
                    </button>
                    <h1 className="text-3xl font-bold font-dm-sans text-text-primary">{readingTitle}</h1>
                </header>
                
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                   {/* Main Spread/Cast Area */}
                    <div className="lg:col-span-2 p-4 bg-[#0B0C10]/50 rounded-xl min-h-[300px]">
                       {selectedDeckType === 'runes' ? (
                            <div className="relative w-full h-[500px] bg-cover bg-center rounded-lg" style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/wood-pattern.png)', backgroundColor: '#3a3a3a'}}>
                                <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
                                {(drawnCards as DrawnDivinationCard[]).map((rune, index) => (
                                    <div 
                                        key={rune.card.id} 
                                        className="absolute group transition-all duration-1000 ease-out"
                                        style={{ 
                                            top: areRunesSettled ? `${rune.y}%` : '50%',
                                            left: areRunesSettled ? `${rune.x}%` : '50%',
                                            transform: `translate(-50%, -50%) rotate(${areRunesSettled ? rune.rotation : 0}deg) scale(${areRunesSettled ? 1 : 0.5})`,
                                            opacity: areRunesSettled ? 1 : 0,
                                            transitionDelay: `${index * 50}ms`,
                                        }}
                                    >
                                        <DivinationCardDisplay drawnCard={rune} isRevealed={true} className="!w-[60px] !h-[80px]" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-[#111218] text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg border border-[#34384a]">
                                            <p className="font-bold text-sm text-purple-400">{spreadDetails.positions[index]}</p>
                                            <p className="font-semibold text-base mb-1 text-left">{(rune.card as Rune).name} ({rune.isReversed ? 'Merkstave' : 'Upright'})</p>
                                            <p className="font-mono text-amber-300/80 text-center mb-2 text-xs">{(rune.card as Rune).keywords.join(' • ')}</p>
                                            <p className="text-text-muted mb-2 text-xs text-left">{(rune.card as Rune).meaning}</p>
                                            
                                            {selectedSpread === 'full-cast' && (
                                                <div className="border-t border-[#34384a] pt-2 mt-2 space-y-1 text-xs">
                                                    <div className="flex justify-between items-center gap-4">
                                                        <strong className="text-text-muted font-medium">Proximity</strong>
                                                        <span className="font-semibold capitalize bg-[#232533] px-2 py-0.5 rounded">{rune.proximity}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center gap-4">
                                                        <strong className="text-text-muted font-medium">Cluster ID</strong>
                                                        <span className="font-semibold bg-[#232533] px-2 py-0.5 rounded">{rune.clusterId || 'Isolated'}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                       ) : (
                            <div className="flex flex-wrap justify-center items-start content-start gap-4 md:gap-6">
                                {drawnCards.map((card, index) => (
                                    <div key={index} className="flex flex-col items-center animate-fade-in-up" style={{animationDelay: `${index * 50}ms`}}>
                                        <div className="relative group text-center h-10 flex items-center">
                                            <p className="text-sm font-semibold text-text-muted">
                                                {areCardsRevealed && spreadDetails.positions[index]}
                                            </p>
                                            {areCardsRevealed && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[#232533] text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg border border-black/20">
                                                    {spreadDetails.positionMeanings[index]}
                                                </div>
                                            )}
                                        </div>
                                        {card ? 
                                            <DivinationCardDisplay drawnCard={card} isRevealed={areCardsRevealed} className="!w-[150px] !h-[255px]" />
                                            : <PlaceholderCard className="!w-[150px] !h-[255px]" />
                                        }
                                    </div>
                                ))}
                            </div>
                       )}
                    </div>
                    
                    {/* Interaction Panel */}
                    <div className="lg:col-span-1 bg-[#111218] p-6 rounded-xl border border-[#232533] sticky top-8">
                       {!areCardsRevealed && selectedDeckType !== 'runes' && (
                           <div className="text-center">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Your items are drawn.</h3>
                                <button onClick={() => setAreCardsRevealed(true)} className="w-full px-6 py-3 rounded-lg font-bold bg-[#5A67D8] text-white hover:bg-opacity-80 transition-colors">
                                    Reveal
                                </button>
                           </div>
                       )}

                       {areCardsRevealed && (
                           <div className="space-y-6">
                                <div id="ai-summary-section">
                                    <h2 className="text-xl font-semibold font-dm-sans text-text-primary mb-3 flex items-center gap-2">
                                        <SparklesIcon className="w-6 h-6 text-[#6E7BFF]" />
                                        AI-Powered Summary
                                    </h2>
                                    {isGenerating && <p className="text-text-muted animate-pulse">Consulting the digital ether...</p>}
                                    {error && <p className="text-red-400">{error}</p>}
                                    {aiSummary && <p className="text-text-primary whitespace-pre-wrap text-sm">{aiSummary}</p>}
                                    {!aiSummary && !isGenerating && !error && (
                                        <button onClick={generateSummary} className="w-full px-6 py-2 rounded-lg font-bold bg-[#6E7BFF]/20 text-[#6E7BFF] hover:bg-[#6E7BFF]/30 transition-colors">
                                            Generate Summary
                                        </button>
                                    )}
                                </div>
                                
                                <div id="save-reading-section">
                                    <h2 className="text-xl font-semibold font-dm-sans text-text-primary mb-3">Save This Reading</h2>
                                    <div>
                                        <label htmlFor="readingTitle" className="block text-sm font-medium text-text-muted mb-1">Reading Title</label>
                                        <input 
                                            type="text" 
                                            id="readingTitle" 
                                            value={readingTitle} 
                                            onChange={(e) => setReadingTitle(e.target.value)} 
                                            className="w-full p-2 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]" 
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        {selectedDeckType === 'runes' && (
                                            <button onClick={() => handleSelectSpread(selectedSpread!)} className="flex-1 px-4 py-2 text-sm rounded-lg font-bold bg-[#232533] text-text-primary hover:bg-opacity-80 transition-colors">
                                                Cast Again
                                            </button>
                                        )}
                                        <button onClick={handleSaveReading} className="flex-1 px-4 py-2 text-sm rounded-lg font-bold bg-[#229954] text-white hover:bg-opacity-80 transition-colors">
                                            Save to Journal
                                        </button>
                                    </div>
                                </div>
                           </div>
                       )}
                    </div>
                </div>
            </div>
        );
    };

    switch (readingStep) {
        case 'select-deck':
            return renderDeckSelector();
        case 'select-spread':
            return renderSpreadSelector();
        case 'shuffling':
            return <ShufflingAnimation deckType={selectedDeckType!} />;
        case 'draw-cards':
        case 'view-reading':
            return renderReadingInterface();
        default:
            return renderDeckSelector();
    }
};

export default ReadingsPage;