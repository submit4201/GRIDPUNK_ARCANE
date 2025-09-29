import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { DrawnDivinationCard, SpreadType, UserProfile, CosmicBlueprint, Message, DeckType, Rune } from '../types';
import { SPREAD_DETAILS } from '../constants';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("VITE_GEMINI_API_KEY is not set. Please add it to your .env.local file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

function formatCards(cards: DrawnDivinationCard[], spreadType: SpreadType, deckType: DeckType): string {
    const spreadDetails = SPREAD_DETAILS[spreadType];
    return (cards).map((c, i) => {
        let state = '';
        if (deckType === 'tarot') state = c.isReversed ? 'Reversed' : 'Upright';
        if (deckType === 'runes') state = c.isReversed ? 'Merkstave' : 'Upright';

        let details = '';
        if (deckType === 'runes' && spreadDetails.name.includes('Cast')) {
            const clusterInfo = c.clusterId ? `, Cluster: ${c.clusterId}`: ' (Isolated)';
            details = ` (Position: {x: ${Math.round(c.x!)}, y: ${Math.round(c.y!)}}, Proximity: ${c.proximity}${clusterInfo})`
        }
        return `${i + 1}. ${spreadDetails.positions[i]}: ${c.card.name} (${state})${details}`
    }).join('\n');
}

function constructSystemPrompt(
    userProfile: UserProfile,
    cosmicBlueprint: CosmicBlueprint,
    spreadType: SpreadType,
    deckType: DeckType,
    isPremium: boolean
): string {
    const spreadDetails = SPREAD_DETAILS[spreadType];
    const blueprintSummary = `
      - Life Path Number: ${cosmicBlueprint.lifePath.number} (${cosmicBlueprint.lifePath.theme})
      - Destiny Number: ${cosmicBlueprint.destiny.number} (${cosmicBlueprint.destiny.theme})
      - Soul Urge: ${cosmicBlueprint.soulUrge.number} (${cosmicBlueprint.soulUrge.theme})
      - Preferred Reading Style: ${userProfile.readingStyle}
      - Stated Life Focus: ${userProfile.readingFocus}
    `;
    const divinationSystem = deckType === 'runes' ? 'Elder Futhark Rune' : deckType === 'angel-cards' ? 'Angel Card' : 'Tarot';

    if (deckType === 'runes') {
        return `You are a master rune reader (vitki), providing a deep, comprehensive interpretation of a rune cast. Your analysis must be insightful, personalized, and account for the chosen spread.
        Your entire response must be in a **${userProfile.readingStyle}** tone, framed by their focus on **'${userProfile.readingFocus}'**.
        **Seeker's Cosmic Blueprint & Preferences:**
        ${blueprintSummary}
        **Instructions:**
        Craft a multi-layered, synthesized narrative.
        1. **Core Theme:** Identify the central story the runes tell as a whole.
        2. **Synthesis with Context (CRUCIAL):**
            - **For fixed spreads (Cross, Grid, etc.):** Interpret each rune based on its specific positional meaning. Weave them into a coherent narrative.
            - **For a Full Cast (Scatter):** Incorporate the spatial data. How do 'inner' runes affect the core issue? How do clustered runes modify each other? How do 'isolated' or 'outer' runes represent external influences?
        3. **Profound Personalization:**
            - **Life Path Connection:** How does this reading's narrative serve as a critical chapter in their **Life Path (${cosmicBlueprint.lifePath.number})** journey?
            - **Destiny Number Activation:** What mission related to their **Destiny Number (${cosmicBlueprint.destiny.number})** is being activated, particularly concerning their focus on **'${userProfile.readingFocus}'**?
        4. **Actionable Guidance & Affirmation:** Conclude with 2-3 clear, actionable steps and a powerful, personalized affirmation.
        **Tone:** ${userProfile.readingStyle}, profound, deeply personal, and empowering. For follow-up questions, maintain this persona and refer back to the original reading context.`;
    }

    if (isPremium) {
        return `You are a master ${divinationSystem} reader, providing a deep, comprehensive interpretation for a premium client. Your analysis must be exceptionally insightful, personalized to their blueprint and preferences.
        Your entire response must be written in a **${userProfile.readingStyle}** tone and be framed through the lens of their life focus on **'${userProfile.readingFocus}'**.
        **Seeker's Cosmic Blueprint & Preferences:**
        ${blueprintSummary}
        **Instructions:**
        1. **Core Theme & Central Tension:** Begin by identifying the central theme, specifically as it relates to **'${userProfile.readingFocus}'**. What is the deep story here for them?
        2. **Positional Synthesis:** Weave the item meanings together based on their positions to tell a coherent story that is relevant to their focus.
        3. **Profound Personalization (Crucial):**
            - **Life Path Connection:** How does this reading's narrative serve as a critical chapter in their **Life Path (${cosmicBlueprint.lifePath.number})** journey? Be specific.
            - **Destiny Number Activation:** What mission related to their **Destiny Number (${cosmicBlueprint.destiny.number})** is being activated by this spread, particularly concerning their focus on **'${userProfile.readingFocus}'**?
            - **Soul Urge Reflection:** How does the emotional core of this reading mirror their deepest motivations, as defined by their **Soul Urge (${cosmicBlueprint.soulUrge.number})**?
        4. **Actionable Guidance & Affirmation:** Conclude with 2-3 clear, actionable steps that align with the **${userProfile.readingStyle}** style. Provide a powerful, personalized affirmation they can use.
        **Tone:** ${userProfile.readingStyle}, profound, deeply personal, and empowering. For follow-up questions, maintain this persona and refer back to the original reading context.`;
    }

    return `You are a ${divinationSystem} reader interpreting a spread.
        **Instructions:**
        Provide a concise summary of the reading.
        1. **Overall Meaning:** Briefly state the main theme of the reading.
        2. **Item-by-Item:** Give a one-sentence interpretation for each item in its position.
        3. **Advice:** Conclude with one piece of general advice.
        **Tone:** Clear, direct, and encouraging. Keep it brief. For follow-up questions, maintain this persona.`;
}


export async function getAIResponse(
    spreadType: SpreadType,
    cards: DrawnDivinationCard[],
    deckType: DeckType,
    userProfile: UserProfile,
    cosmicBlueprint: CosmicBlueprint,
    isPremium: boolean,
    chatHistory: Message[],
    newUserMessage: string
): Promise<string> {
    if (!API_KEY) {
        return "The connection to the digital ether is severed. Please configure the API Key.";
    }

    const systemPrompt = constructSystemPrompt(userProfile, cosmicBlueprint, spreadType, deckType, isPremium);
    const readingContext = `The user performed a "${SPREAD_DETAILS[spreadType].name}" ${deckType} reading and drew the following items:\n${formatCards(cards, spreadType, deckType)}`;

    const history = [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I am ready to provide a reading." }] },
        { role: "user", parts: [{ text: readingContext }] },
        // The model shouldn't respond to the context, so we don't add a model response here.
        ...chatHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }))
    ];

    try {
        const chat = model.startChat({ history, safetySettings });
        const result = await chat.sendMessage(newUserMessage);
        const response = result.response;

        if (response.promptFeedback?.blockReason) {
            console.warn("Prompt blocked:", response.promptFeedback.blockReason);
            return "My vision is clouded by the digital ether. The query was blocked for safety reasons. Please rephrase your question.";
        }

        const text = response.text();
        return text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "I apologize, but I'm unable to connect with the cosmic servers at the moment. Please try again later.";
    }
}