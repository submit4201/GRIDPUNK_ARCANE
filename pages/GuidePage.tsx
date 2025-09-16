import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TAROT_DECK } from '../constants';
import { TarotCard } from '../types';
import PremiumModal from '../components/PremiumModal';
import { BookOpenIcon, SparklesIcon, CompassIcon } from '../components/icons';
import { GoogleGenAI } from '@google/genai';
import { generateCosmicBlueprint } from '../services/cosmicService';
import DivinationCardDisplay from '../components/TarotCard';

const GuideCard: React.FC<{ card: TarotCard; onSelect: () => void; isSelected: boolean; }> = ({ card, onSelect, isSelected }) => {
    return (
        <div onClick={onSelect} className={`p-4 bg-[#111218] rounded-lg border border-[#232533] cursor-pointer hover:border-purple-400 transition-all duration-200 ${isSelected ? 'border-purple-500 ring-2 ring-purple-500' : ''}`}>
            <h3 className="font-bold text-text-primary">{card.name}</h3>
            <p className="text-xs text-text-muted">{card.arcana} Arcana</p>
        </div>
    );
};

const GuidePage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
    const { isPremium, userProfile } = useApp();
    const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [interpretation, setInterpretation] = useState('');

    const cosmicBlueprint = useMemo(() => generateCosmicBlueprint(userProfile), [userProfile]);

    const handleSelectCard = (card: TarotCard) => {
        if (!isPremium) {
            setIsPremiumModalOpen(true);
            return;
        }
        setSelectedCard(card);
        setInterpretation('');
        setError('');
    };
    
    const generateInterpretation = async () => {
        if (!selectedCard) return;

        setIsLoading(true);
        setError('');
        setInterpretation('');

        const blueprintSummary = `
          - Life Path Number: ${cosmicBlueprint.lifePath.number} (${cosmicBlueprint.lifePath.theme})
          - Destiny Number: ${cosmicBlueprint.destiny.number} (${cosmicBlueprint.destiny.theme})
          - Soul Urge: ${cosmicBlueprint.soulUrge.number} (${cosmicBlueprint.soulUrge.theme})
          - Preferred Reading Style: ${userProfile.readingStyle}
          - Stated Life Focus: ${userProfile.readingFocus}
        `;
        
        const prompt = `You are a master Tarot reader creating a personalized guide entry for a seeker. Your task is to interpret a single Tarot card through the unique lens of their Cosmic Blueprint and personal preferences.

        **Seeker's Profile:**
        ${blueprintSummary}

        **Card to Interpret:**
        - Card: ${selectedCard.name}
        - Arcana: ${selectedCard.arcana}
        - Keywords: ${selectedCard.keywords.join(', ')}
        - Core Upright Meaning: ${selectedCard.meaning}
        - Core Reversed Meaning: ${selectedCard.reversedMeaning}

        **Instructions:**
        Craft a deep and personalized interpretation of this card specifically for this person. The entire response must be written in a **${userProfile.readingStyle}** tone and framed around their life focus of **'${userProfile.readingFocus}'**.
        1.  **Introduction:** Start by introducing the universal energy of the ${selectedCard.name} card, immediately connecting it to their focus on **'${userProfile.readingFocus}'**.
        2.  **Life Path Resonance:** Explain how the card's theme directly interacts with their life's journey, as defined by their **Life Path number (${cosmicBlueprint.lifePath.number})**. How does this card's lesson manifest in their core challenges and opportunities within their stated focus area?
        3.  **Destiny Number Application:** Describe how they can actively use the energy of this card to achieve their life's purpose, as outlined by their **Destiny number (${cosmicBlueprint.destiny.number})**.
        4.  **Soul Urge Connection:** Analyze how this card's message speaks to their deepest desires and motivations, linked to their **Soul Urge number (${cosmicBlueprint.soulUrge.number})**.
        5.  **Personalized Affirmation:** Conclude with a powerful, personalized affirmation that combines the card's wisdom with one of their key blueprint numbers, relevant to their focus.

        **Tone & Focus:** The writing must be consistently **${userProfile.readingStyle}**. All examples and advice should be tailored to **'${userProfile.readingFocus}'**. Address the user directly.`;

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setInterpretation(response.text);
        } catch (err) {
            console.error("Error generating interpretation:", err);
            setError("The cosmic energies are currently unclear. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    if (!isPremium) {
         return (
              <div className="w-full h-full p-4 md:p-8 flex flex-col items-center justify-center text-center">
                <CompassIcon className="w-24 h-24 mx-auto text-purple-400/50" />
                <h1 className="text-4xl font-bold font-dm-sans text-text-primary mt-6">Personalized Tarot Guide</h1>
                <p className="text-text-muted mt-2 max-w-md mx-auto">Unlock a deeper understanding of the Tarot. The Guide provides AI-powered interpretations of each card, tailored specifically to your unique Cosmic Blueprint.</p>
                 <button onClick={() => setPage('Profile')} className="mt-8 px-8 py-3 text-base rounded-lg font-bold bg-[#D95B00] text-white hover:bg-opacity-80 transition-colors">
                    Upgrade to Premium
                </button>
              </div>
         );
    }

    return (
        <div className="w-full h-full p-4 md:p-8 flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3 flex-shrink-0 flex flex-col">
                <header className="mb-4">
                    <h1 className="text-4xl font-bold font-dm-sans text-text-primary">Tarot Guide</h1>
                    <p className="text-text-muted">Select a card to explore its personalized meaning for you.</p>
                </header>
                <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-2">
                    {TAROT_DECK.map(card => (
                        <GuideCard key={card.id} card={card} onSelect={() => handleSelectCard(card)} isSelected={selectedCard?.id === card.id} />
                    ))}
                </div>
            </div>

            <main className="flex-1 bg-[#111218] rounded-2xl border border-[#232533] flex flex-col items-center justify-center p-6 text-center">
                {!selectedCard ? (
                    <>
                        <CompassIcon className="w-24 h-24 text-purple-400/50" />
                        <p className="mt-4 text-text-muted">Select a card from the list to begin.</p>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center">
                       <DivinationCardDisplay drawnCard={{ card: selectedCard, isReversed: false }} isRevealed={true} className="!w-[200px] !h-[340px] flex-shrink-0" />
                       <div className="flex-grow w-full overflow-y-auto mt-4 text-left p-4 bg-[#0B0C10] rounded-lg">
                           {!interpretation && !isLoading && !error && (
                                <div className="text-center flex flex-col items-center justify-center h-full">
                                    <h2 className="text-xl font-bold font-dm-sans text-text-primary">Personalized Interpretation</h2>
                                    <p className="text-text-muted mb-4">Generate an AI-powered meaning for {selectedCard.name}, tailored to your Cosmic Blueprint.</p>
                                    <button onClick={generateInterpretation} className="px-6 py-2 rounded-lg font-bold bg-purple-600 text-white hover:bg-purple-500 transition-colors flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5" />
                                        Generate
                                    </button>
                                </div>
                           )}
                           {isLoading && <p className="text-text-muted animate-pulse text-center">Consulting the digital ether...</p>}
                           {error && <p className="text-red-400 text-center">{error}</p>}
                           {interpretation && <p className="text-text-primary whitespace-pre-wrap text-sm">{interpretation}</p>}
                       </div>
                    </div>
                )}
            </main>

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

export default GuidePage;