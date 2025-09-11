import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getDailySeed, calculateDailyNumber, getShuffledPreparedDeck } from '../services/tarotService';
import { DrawnCard } from '../types';
import TarotCardFlip from '../components/TarotCard';
import { SunIcon, BookOpenIcon, SparklesIcon, ZapIcon } from '../components/icons';
import { GoogleGenAI, Type } from '@google/genai';

interface CardReadingOutput {
  coreMessage: string;
  mysticalInsight: string;
  todaysAction: string;
  reflectionQuestion: string;
}

interface DailyInsights {
  horoscope: string;
  cardReading: CardReadingOutput;
  combinedGuidance: string;
  patternRecognition: string;
}

const InsightCard: React.FC<{ icon: React.ReactNode; title: string; content: string; delay: number }> = ({ icon, title, content, delay }) => {
    return (
        <div className="bg-[#111218] p-4 md:p-6 rounded-xl border border-[#232533] animate-fade-in-up" style={{ animationDelay: `${delay}ms`}}>
            <h3 className="text-lg font-semibold font-dm-sans text-text-primary mb-2 flex items-center gap-3">
                {icon}
                {title}
            </h3>
            <p className="text-text-muted text-sm whitespace-pre-wrap">{content}</p>
        </div>
    );
};


const DailyPage: React.FC = () => {
  const { addDailyDrawToHistory, dailyDrawHistory, astrologicalSign } = useApp();
  
  const [chosenCard, setChosenCard] = useState<DrawnCard | null>(null);
  const [cardOptions, setCardOptions] = useState<DrawnCard[]>([]);
  const [hasChosen, setHasChosen] = useState(false);
  const [dailyInsights, setDailyInsights] = useState<DailyInsights | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const userId = 'gridpunk-arcana-user-01'; // Stable user ID

  const dailyNumber = useMemo(() => calculateDailyNumber(today), [todayStr]);

  useEffect(() => {
    const todayRecord = dailyDrawHistory.find(record => record.date === todayStr);

    if (todayRecord) {
      setChosenCard(todayRecord.drawnCard);
      setHasChosen(true);
      generateInsights(todayRecord.drawnCard);
    } else {
      const seed = getDailySeed(userId, today);
      const deck = getShuffledPreparedDeck(seed);
      setCardOptions(deck.slice(0, 3));
      setHasChosen(false);
      setDailyInsights(null);
    }
  }, [todayStr]);

  const handleCardSelect = (card: DrawnCard) => {
    if (hasChosen) return;

    setChosenCard(card);
    setHasChosen(true);
    addDailyDrawToHistory(card);
    generateInsights(card);
  };

  const generateInsights = async (card: DrawnCard) => {
    if (isGenerating || dailyInsights) return;

    setIsGenerating(true);
    setError(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const sign = astrologicalSign !== 'None' ? astrologicalSign : 'the user';
        const previousDraws = dailyDrawHistory.slice(1, 5).map(d => `${d.drawnCard.card.name} (${d.drawnCard.isReversed ? 'Reversed' : 'Upright'})`).join(', ') || 'None';
        const seed = getDailySeed(userId, today);
        const cardState = card.isReversed ? 'Reversed' : 'Upright';

        const horoscopePrompt = `"You are an expert astrologer and mystical guide. Generate a daily horoscope that blends cosmic symbolism with grounded advice. Inputs: Sign: ${sign}, Element: ${card.card.element}, Date: ${todayStr}, Seed: ${seed}. Requirements: 1. Begin with an archetypal image or metaphor describing the cosmic mood for ${sign} today. 2. Name the major themes of the day (clarity, challenge, growth, relationships, etc.). 3. Weave in the sign’s element (${card.card.element}) and how that energy can be used constructively. 4. Include a "lucky hour" or window of power, computed from the seed. 5. Close with 1–2 actionable suggestions or micro-rituals aligned with today’s energy. Style & Tone: Mystical yet empowering; use poetic but clear language. Avoid generic one-liners — offer depth but keep under 180 words. Write as if speaking directly to the seeker: second person ("You...")."`;
        const cardReadingPrompt = `"You are a Tarot oracle speaking to the seeker. Input: Card: ${card.card.name}, Upright/Reversed: ${cardState}, Keywords: ${card.card.keywords.join(', ')}, Position: Daily Guidance. Instructions: 1. Describe the symbolic core of the card. 2. Draw out a mystical insight. 3. Give practical guidance: one micro-quest or action. 4. A line of reflection: a question the user can journal about. Tone: poetic, clear, empowering. Output format MUST be a JSON object with keys: 'coreMessage', 'mysticalInsight', 'todaysAction', 'reflectionQuestion'."`;
        const combinedGuidancePrompt = `"You are a holistic Mystic Guide combining Tarot, Numerology, and Astrology. Inputs: Tarot: ${card.card.name}, Upright/Reversed: ${cardState}, Keywords: ${card.card.keywords.join(', ')}. Numerology: Day number = ${dailyNumber.number}, Guidance note = ${dailyNumber.description}. Horoscope: Sign = ${sign}. Instructions: 1. Begin with a brief overview of the aligned universal energies. 2. Use the Tarot card as the anchor for today’s main lesson. 3. Use Numerology to add texture (intensity/flow/caution). 4. Give at least two concrete actions: one inner (reflection, mindset), one outer (action). 5. Close with a guiding affirmation or mantra. Tone: mystical, balanced, nurturing, actionable. Keep under 250 words."`;
        
        const masterPrompt = `
          You are a mystical AI guide. Generate a JSON object with the following keys: "horoscope", "cardReading", "combinedGuidance", "patternRecognition".
          Follow the specific instructions provided for each key.
          
          - For the "horoscope" key, use this prompt: ${horoscopePrompt}
          - For the "cardReading" key, use this prompt to generate a JSON object: ${cardReadingPrompt}
          - For the "combinedGuidance" key, use this prompt: ${combinedGuidancePrompt}
          - For the "patternRecognition" key, provide a brief insight based on these recent past draws: "${previousDraws}". If none, state that more draws are needed to see a pattern.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: masterPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        horoscope: { type: Type.STRING },
                        cardReading: {
                            type: Type.OBJECT,
                            properties: {
                                coreMessage: { type: Type.STRING },
                                mysticalInsight: { type: Type.STRING },
                                todaysAction: { type: Type.STRING },
                                reflectionQuestion: { type: Type.STRING },
                            },
                            required: ["coreMessage", "mysticalInsight", "todaysAction", "reflectionQuestion"],
                        },
                        combinedGuidance: { type: Type.STRING },
                        patternRecognition: { type: Type.STRING },
                    },
                    required: ["horoscope", "cardReading", "combinedGuidance", "patternRecognition"],
                },
            },
        });

        setDailyInsights(JSON.parse(response.text));
    } catch (err) {
        console.error("Error generating daily insights:", err);
        setError("The celestial energies are clouded. Could not generate insights at this time.");
    } finally {
        setIsGenerating(false);
    }
  };
  
  const renderInitialSelection = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-3xl md:text-4xl font-bold font-dm-sans text-text-primary">Choose Your Card for Today</h1>
        <p className="text-text-muted mt-2 mb-8">Let your intuition guide you to the message you need to hear.</p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {cardOptions.map((card, index) => (
                <div key={index} onClick={() => handleCardSelect(card)} className="cursor-pointer hover:-translate-y-2 transition-transform">
                    <TarotCardFlip drawnCard={card} isRevealed={false} />
                </div>
            ))}
        </div>
    </div>
  );
  
  const renderDashboard = () => {
    if (!chosenCard) return null;
    
    const isLoading = isGenerating || (!dailyInsights && !error);
    const elementalGlow = {
        Fire: 'shadow-[0_0_15px_rgba(255,122,26,0.5)]',
        Water: 'shadow-[0_0_15px_rgba(110,123,255,0.5)]',
        Air: 'shadow-[0_0_15px_rgba(33,199,242,0.5)]',
        Earth: 'shadow-[0_0_15px_rgba(41,194,106,0.5)]',
    };

    return (
        <div className="w-full h-full p-4 md:p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-5 flex flex-col items-center">
                <h2 className="text-2xl font-bold font-dm-sans text-text-primary mb-4">Your Card for Today</h2>
                <div className={`transition-shadow duration-500 rounded-2xl ${elementalGlow[chosenCard.card.element]}`}>
                    <TarotCardFlip drawnCard={chosenCard} isRevealed={true} />
                </div>
                <div className="w-full max-w-sm mt-6 p-6 bg-[#111218] rounded-xl border border-[#232533]">
                    <h3 className="text-xl font-bold text-text-primary">{chosenCard.card.name} ({chosenCard.isReversed ? 'Reversed' : 'Upright'})</h3>
                    <p className="text-sm text-text-muted mt-2 italic">{chosenCard.isReversed ? chosenCard.card.reversedMeaning : chosenCard.card.meaning}</p>
                    <div className="border-t border-[#232533] my-4"></div>
                    <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-[#6E7BFF]"/> Card's AI Reading</h4>
                    {isLoading ? (
                        <div className="space-y-3">
                           <div className="h-4 bg-[#0B0C10] rounded-md animate-pulse"></div>
                           <div className="h-10 bg-[#0B0C10] rounded-md animate-pulse"></div>
                           <div className="h-8 bg-[#0B0C10] rounded-md animate-pulse"></div>
                        </div>
                    ) : dailyInsights ? (
                        <div className="space-y-3 text-sm">
                            <p><strong className="text-text-primary/80">Core Message:</strong> {dailyInsights.cardReading.coreMessage}</p>
                            <p><strong className="text-text-primary/80">Mystical Insight:</strong> {dailyInsights.cardReading.mysticalInsight}</p>
                            <p><strong className="text-text-primary/80">Today's Action:</strong> {dailyInsights.cardReading.todaysAction}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-red-400">{error}</p>
                    )}
                </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-7">
                <h2 className="text-2xl font-bold font-dm-sans text-text-primary mb-4">Cosmic Dashboard</h2>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array(5).fill(0).map((_, i) => (
                            <div key={i} className="h-36 bg-[#111218] rounded-xl border border-[#232533] animate-pulse"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-[#111218] p-6 rounded-xl border border-red-500/50 text-center">
                        <p className="text-red-400">{error}</p>
                    </div>
                ) : dailyInsights && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InsightCard icon={<span className="text-xl font-bold text-[#21C7F2]">#</span>} title={`Numerology: ${dailyNumber.number} - ${dailyNumber.theme}`} content={dailyNumber.description} delay={100} />
                        <InsightCard icon={<SparklesIcon className="w-5 h-5 text-[#6E7BFF]"/>} title="Astrological Forecast" content={dailyInsights.horoscope} delay={200} />
                        <InsightCard icon={<ZapIcon className="w-5 h-5 text-[#FF7A1A]"/>} title="Daily Guidance" content={dailyInsights.combinedGuidance} delay={300} />
                        <InsightCard icon={<BookOpenIcon className="w-5 h-5 text-[#29C26A]"/>} title="Journal Prompt" content={dailyInsights.cardReading.reflectionQuestion} delay={400} />
                        <InsightCard icon={<span className="text-xl">✧</span>} title="Pattern Recognition" content={dailyInsights.patternRecognition} delay={500} />
                    </div>
                )}
            </div>
        </div>
    );
  }

  return hasChosen ? renderDashboard() : renderInitialSelection();
};

export default DailyPage;