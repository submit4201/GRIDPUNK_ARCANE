import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getDailySeed, calculateDailyNumber, drawDailyCard, calculateMonthlyNumber, calculateYearlyNumber } from '../services/tarotService';
import { DrawnCard, TarotCard } from '../types';
import DivinationCardDisplay from '../components/TarotCard';
import { SunIcon, BookOpenIcon, SparklesIcon, ZapIcon, DnaIcon } from '../components/icons';
import { GoogleGenAI, Type } from '@google/genai';
import { generateCosmicBlueprint } from '../services/cosmicService';
import CosmicBlueprintDisplay from '../components/CosmicBlueprintDisplay';
import { TAROT_DECK } from '../constants';

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
  numerologyInsight: string;
}

const InsightCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; delay: number; className?: string }> = ({ icon, title, children, delay, className }) => {
    return (
        <div className={`bg-[#111218] p-4 md:p-6 rounded-xl border border-[#232533] animate-fade-in-up flex flex-col ${className || ''}`} style={{ animationDelay: `${delay}ms`}}>
            <h3 className="text-lg font-semibold font-dm-sans text-text-primary mb-2 flex items-center gap-3">
                {icon}
                {title}
            </h3>
            <div className="text-text-muted text-sm whitespace-pre-wrap flex-grow">{children}</div>
        </div>
    );
};


const DailyPage: React.FC = () => {
  const { addDailyDrawToHistory, dailyDrawHistory, userProfile, addXp } = useApp();
  
  const [chosenCard, setChosenCard] = useState<DrawnCard | null>(null);
  const [hasChosen, setHasChosen] = useState(false);
  const [dailyInsights, setDailyInsights] = useState<DailyInsights | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const dailySeed = useMemo(() => getDailySeed(userProfile, today), [userProfile, todayStr]);
  const dailyNumber = useMemo(() => calculateDailyNumber(today), [todayStr]);
  const monthlyNumber = useMemo(() => calculateMonthlyNumber(today), [today.getMonth(), today.getFullYear()]);
  const yearlyNumber = useMemo(() => calculateYearlyNumber(today), [today.getFullYear()]);
  const cosmicBlueprint = useMemo(() => generateCosmicBlueprint(userProfile), [userProfile]);

  useEffect(() => {
    // Proactive Data Sanitization: Pre-filter the entire history to remove any structurally
    // invalid records before attempting to use them. This is the most robust way to prevent
    // corrupted data from localStorage from causing errors.
    const cleanHistory = dailyDrawHistory.filter(record => 
        record &&
        record.drawnCard &&
        record.drawnCard.card &&
        typeof record.drawnCard.card.id === 'string'
    );
    
    const todayRecord = cleanHistory.find(record => record.date === todayStr);

    if (todayRecord) {
      const fullCardData = TAROT_DECK.find(c => c.id === todayRecord.drawnCard.card.id);
      
      if (fullCardData) {
        const validDrawnCard: DrawnCard = {
          card: fullCardData,
          isReversed: !!todayRecord.drawnCard.isReversed,
        };
        
        setChosenCard(validDrawnCard);
        setHasChosen(true);
        generateInsights(validDrawnCard);
      } else {
        // A record existed, but its card ID was not found in the master deck. Reset state.
        setChosenCard(null);
        setHasChosen(false);
        setDailyInsights(null);
      }
    } else {
      // No valid record for today was found. Reset state.
      setChosenCard(null);
      setHasChosen(false);
      setDailyInsights(null);
    }
  }, [todayStr, dailyDrawHistory]);

  const handleDrawCard = () => {
    if (hasChosen || isShuffling) return;

    setIsShuffling(true);
    
    setTimeout(() => {
        const card = drawDailyCard(dailySeed);
        setChosenCard(card);
        setHasChosen(true);
        addDailyDrawToHistory(card);
        addXp(10); // Award XP for daily draw
        generateInsights(card);
    }, 600); // Corresponds to animation duration
  };

  const generateInsights = async (card: DrawnCard) => {
    // A more robust guard clause that ensures the card object is not only shaped correctly,
    // but its ID exists in the master TAROT_DECK. This prevents processing corrupted data.
    if (!card || !card.card || typeof card.card.id !== 'string' || !TAROT_DECK.some(c => c.id === card.card.id)) {
        console.error("Invalid or non-existent card data provided to generateInsights:", card);
        setError("There was an error processing the card's data. Please try again.");
        setIsGenerating(false);
        return;
    }
      
    if (isGenerating || dailyInsights) return;

    setIsGenerating(true);
    setError(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const sign = userProfile.astrologicalSign !== 'None' ? userProfile.astrologicalSign : 'the user';
        // Filter historical data to ensure it's valid before sending to the API.
        const previousDraws = dailyDrawHistory
            .slice(1, 5)
            .filter(d => d && d.drawnCard && d.drawnCard.card && typeof d.drawnCard.card.id === 'string' && TAROT_DECK.some(c => c.id === d.drawnCard.card.id))
            .map(d => `${d.drawnCard.card.name} (${d.drawnCard.isReversed ? 'Reversed' : 'Upright'})`)
            .join(', ') || 'None';
        const cardState = card.isReversed ? 'Reversed' : 'Upright';
        const blueprintSummary = `
          - Astrological Sign: ${sign}
          - Birth Date: ${userProfile.birthDate}
          - Life Path Number: ${cosmicBlueprint.lifePath.number} (${cosmicBlueprint.lifePath.theme})
          - Destiny Number: ${cosmicBlueprint.destiny.number} (${cosmicBlueprint.destiny.theme})
          - Soul Urge: ${cosmicBlueprint.soulUrge.number} (${cosmicBlueprint.soulUrge.theme})
          - Reading Style Preference: ${userProfile.readingStyle}
          - Current Life Focus: ${userProfile.readingFocus}
        `;

        const horoscopePrompt = `Generate a concise, hyper-personalized daily horoscope for a ${sign}.
**User Blueprint:**
${blueprintSummary}
**Today's Energies:**
- Universal Daily Number: ${dailyNumber.number} ('${dailyNumber.theme}')

**Instructions:**
1.  **Headline:** Start with a bold headline for a ${sign}.
2.  **Sign Focus:** Directly connect today's cosmic energy to the core traits of a ${sign}.
3.  **Theme Integration:** Seamlessly weave in the daily numerology theme ('${dailyNumber.theme}') with the user's Life Path and Soul Urge numbers for a synthesized forecast.
4.  **Actionable Advice:** Provide one concrete piece of advice that aligns with their Destiny number.
5.  **Tone:** Your tone must be **${userProfile.readingStyle}**. It must be empowering and direct. Keep it under 180 words.`;
        
        const cardReadingPrompt = `You are a Tarot oracle interpreting a daily guidance card for a seeker. Your interpretation MUST be hyper-personalized by deeply integrating their cosmic blueprint and reading preferences.
        **Seeker's Blueprint Summary:**
        ${blueprintSummary}
        **Card Details:**
        - Card: ${card.card.name}
        - State: ${cardState}
        - Keywords: ${card.card.keywords.join(', ')}
        
        **Instructions:**
        Generate a JSON object. Your response must be a masterclass in synthesis, weaving together the card's energy, the user's core numerology, and their life focus into a single, resonant narrative. Adhere strictly to these personalization requirements:
        1.  **'coreMessage'**: A direct and impactful message. Frame it through the lens of their current life focus: **'${userProfile.readingFocus}'**. Connect the card's meaning to their **Destiny number (${cosmicBlueprint.destiny.number} - '${cosmicBlueprint.destiny.theme}')**.
        2.  **'mysticalInsight'**: A deeper truth revealed by fusing the card's symbolism with their **Soul Urge number (${cosmicBlueprint.soulUrge.number} - '${cosmicBlueprint.soulUrge.theme}')**.
        3.  **'todaysAction'**: A single, tangible micro-quest inspired by the card that helps them physically embody the day's lesson.
        4.  **'reflectionQuestion'**: A powerful question that forces introspection by linking the core lesson of '${card.card.name}' and the lifelong karmic journey of their **Life Path number (${cosmicBlueprint.lifePath.number} - '${cosmicBlueprint.lifePath.theme}')**.
        
        **Tone:** Your writing style must be **${userProfile.readingStyle}**. The output MUST be a valid JSON object.`;
        
        const combinedGuidancePrompt = `You are a holistic Mystic Guide combining Tarot, Numerology, and Astrology.
        **Inputs:**
        - Tarot: ${card.card.name} (${cardState})
        - Universal Numerology: Day number = ${dailyNumber.number}, Month = ${monthlyNumber.number}, Year = ${yearlyNumber.number}.
        - User Blueprint: ${blueprintSummary}
        
        **Instructions:**
        1. Synthesize the primary energies of the day by blending the Tarot card's message with the universal numerology.
        2. Explain how these energies might interact with the user's core Life Path, Destiny numbers, and their chosen life focus on **'${userProfile.readingFocus}'**.
        3. Provide one piece of inner guidance (a mindset) and one piece of outer guidance (an action).
        4. Conclude with a powerful, personalized affirmation for the day.
        
        **Tone:** Your tone must be **${userProfile.readingStyle}** and actionable. Keep under 250 words.`;
        
        const numerologyInsightPrompt = `You are a master numerologist. Provide a personalized insight based on the day's universal numbers and the user's core blueprint.
        
        **User's Core Numbers & Preferences:**
        - Life Path: ${cosmicBlueprint.lifePath.number} (${cosmicBlueprint.lifePath.theme})
        - Destiny: ${cosmicBlueprint.destiny.number} (${cosmicBlueprint.destiny.theme})
        - Current Focus: ${userProfile.readingFocus}

        **Today's Universal Energies:**
        - Daily Number: ${dailyNumber.number} ('${dailyNumber.theme}')
        - Monthly Number: ${monthlyNumber.number} ('${monthlyNumber.theme}')
        - Yearly Number: ${yearlyNumber.number} ('${yearlyNumber.theme}')

        **Instructions:**
        1.  **Synthesize:** Start by explaining the primary energy of the Day Number (${dailyNumber.number}).
        2.  **Contextualize:** Explain how this daily energy fits within the broader themes of the Month Number (${monthlyNumber.number}) and Year Number (${yearlyNumber.number}).
        3.  **Personalize:** Describe how this combination of universal energies might specifically influence someone on Life Path ${cosmicBlueprint.lifePath.number}.
        4.  **Actionable Tip:** Conclude with one piece of actionable advice related to their Destiny Number (${cosmicBlueprint.destiny.number}) that also aligns with their focus on **'${userProfile.readingFocus}'**.
        
        **Tone:** Your tone must be **${userProfile.readingStyle}**. Keep it concise (under 200 words).`;

        const patternRecognitionPrompt = `You are an AI Tarot analyst. Identify patterns in the user's recent card draws and connect them to their Cosmic Blueprint.
        **User's Blueprint:**
        ${blueprintSummary}
        **Recent Draws (most recent first):**
        - Today: ${card.card.name} (${cardState})
        - Previous: ${previousDraws}

        **Instructions:**
        1. **Analyze Arcana/Suit Trends:** Note any recurring Major Arcana cards, or a dominance of a particular suit (Wands, Cups, Swords, Pentacles).
        2. **Connect to Blueprint:** Explain how this emerging pattern might be a message for their Life Path (${cosmicBlueprint.lifePath.number}) or Destiny (${cosmicBlueprint.destiny.number}), especially in the context of their focus on **'${userProfile.readingFocus}'**.
        3. **Provide Insight:** Offer a brief, actionable insight based on this pattern. Keep it under 150 words.

        **Tone:** Analytical, insightful, and concise.`;

        const model = 'gemini-2.5-flash';

        const cardReadingSchema = {
            type: Type.OBJECT,
            properties: {
                coreMessage: { type: Type.STRING },
                mysticalInsight: { type: Type.STRING },
                todaysAction: { type: Type.STRING },
                reflectionQuestion: { type: Type.STRING },
            }
        };
        
        const [horoscopeRes, cardReadingRes, combinedGuidanceRes, patternRecognitionRes, numerologyInsightRes] = await Promise.all([
          ai.models.generateContent({ model, contents: horoscopePrompt }),
          ai.models.generateContent({ model, contents: cardReadingPrompt, config: { responseMimeType: 'application/json', responseSchema: cardReadingSchema } }),
          ai.models.generateContent({ model, contents: combinedGuidancePrompt }),
          ai.models.generateContent({ model, contents: patternRecognitionPrompt }),
          ai.models.generateContent({ model, contents: numerologyInsightPrompt }),
        ]);
        
        const cardReadingData = JSON.parse(cardReadingRes.text);

        setDailyInsights({
            horoscope: horoscopeRes.text,
            cardReading: cardReadingData,
            combinedGuidance: combinedGuidanceRes.text,
            patternRecognition: patternRecognitionRes.text,
            numerologyInsight: numerologyInsightRes.text,
        });

    } catch (e) {
      console.error("Error generating insights:", e);
      setError("The cosmic energies are a bit fuzzy right now. Please try again in a moment.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-dm-sans text-text-primary">Your Daily Draw</h1>
        <p className="text-text-muted">Tap the card to reveal your guidance for {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Card and Numerology Section */}
        <div className="lg:col-span-1 space-y-6 sticky top-8">
            <div 
                className={`relative transition-transform duration-500 ${isShuffling ? 'animate-shuffle-deal' : ''}`}
                onClick={handleDrawCard}
            >
              <DivinationCardDisplay 
                  drawnCard={chosenCard || { card: {} as TarotCard, isReversed: false }} 
                  isRevealed={hasChosen} 
                  className="mx-auto cursor-pointer"
              />
            </div>
            
            <InsightCard icon={<DnaIcon className="w-5 h-5 text-purple-400" />} title="Cosmic Blueprint" delay={100} className="hidden lg:flex">
              <CosmicBlueprintDisplay blueprint={cosmicBlueprint} />
            </InsightCard>
        </div>

        {/* Insights Section */}
        <div className="lg:col-span-2 space-y-6">
            {!hasChosen && (
                <div className="text-center py-20 bg-[#111218]/50 rounded-xl border border-[#232533]">
                    <h2 className="text-2xl font-semibold text-text-primary">Awaiting Your Touch</h2>
                    <p className="text-text-muted mt-2">The cards are shuffled. Tap the card back to begin your reading.</p>
                </div>
            )}

            {isGenerating && (
                 <div className="space-y-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-[#111218] p-6 rounded-xl border border-[#232533] animate-pulse">
                            <div className="h-4 bg-[#232533] rounded w-1/3 mb-4"></div>
                            <div className="space-y-2">
                                <div className="h-3 bg-[#232533] rounded w-full"></div>
                                <div className="h-3 bg-[#232533] rounded w-5/6"></div>
                                <div className="h-3 bg-[#232533] rounded w-3/4"></div>
                            </div>
                        </div>
                    ))}
                 </div>
            )}
            
            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg">{error}</div>}

            {dailyInsights && (
                <>
                    <InsightCard icon={<SunIcon className="w-5 h-5 text-amber-400" />} title="Personalized Horoscope" delay={0}>
                        {dailyInsights.horoscope}
                    </InsightCard>

                    <InsightCard icon={<BookOpenIcon className="w-5 h-5 text-sky-400" />} title="Card Guidance" delay={100}>
                      <div className="space-y-3">
                          <div>
                              <h4 className="font-semibold text-text-primary">Core Message</h4>
                              <p>{dailyInsights.cardReading.coreMessage}</p>
                          </div>
                           <div>
                              <h4 className="font-semibold text-text-primary">Mystical Insight</h4>
                              <p>{dailyInsights.cardReading.mysticalInsight}</p>
                          </div>
                           <div>
                              <h4 className="font-semibold text-text-primary">Today's Action</h4>
                              <p>{dailyInsights.cardReading.todaysAction}</p>
                          </div>
                           <div>
                              <h4 className="font-semibold text-text-primary">Reflection Question</h4>
                              <p className="italic">"{dailyInsights.cardReading.reflectionQuestion}"</p>
                          </div>
                      </div>
                    </InsightCard>

                    <InsightCard icon={<SparklesIcon className="w-5 h-5 text-pink-400" />} title="Holistic Guidance" delay={200}>
                        {dailyInsights.combinedGuidance}
                    </InsightCard>

                    <InsightCard icon={<ZapIcon className="w-5 h-5 text-green-400" />} title="Numerology Insight" delay={300}>
                        {dailyInsights.numerologyInsight}
                    </InsightCard>

                    <InsightCard icon={<DnaIcon className="w-5 h-5 text-purple-400" />} title="Pattern Recognition" delay={400}>
                        {dailyInsights.patternRecognition}
                    </InsightCard>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default DailyPage;