import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { JournalIcon, CardsIcon } from '../components/icons';
import { SPREAD_DETAILS } from '../constants';
import { SavedReading, DrawnDivinationCard, Rune, Message } from '../types';
import DivinationCardDisplay from '../components/TarotCard';
import CardDetailModal from '../components/CardDetailModal';
import ChatInterface from '../components/ChatInterface';
import { getAIResponse } from '../services/aiService';
import { generateCosmicBlueprint } from '../services/cosmicService';

const SavedReadingEntry: React.FC<{ reading: SavedReading; onCardClick: (card: DrawnDivinationCard) => void; }> = ({ reading }) => {
    const { updateSavedReadingNotes, addXp, updateReadingChatHistory, userProfile, isPremium } = useApp();
    const [notes, setNotes] = useState(reading.userNotes);
    const [isEditing, setIsEditing] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const cosmicBlueprint = useMemo(() => generateCosmicBlueprint(userProfile), [userProfile]);

    useEffect(() => {
        setNotes(reading.userNotes);
    }, [reading.userNotes]);

    const handleSaveNotes = () => {
        if (isSaving) return;
        if (notes.trim() && notes !== reading.userNotes) {
            addXp(5);
        }
        updateSavedReadingNotes(reading.id, notes);
        setIsSaving(true);
        setTimeout(() => {
            setIsEditing(false);
            setIsSaving(false);
        }, 1500);
    };

    const handleSendMessage = useCallback(async (userMessage: string) => {
        const newHistory: Message[] = [...reading.chatHistory, { sender: 'user', text: userMessage }];
        updateReadingChatHistory(reading.id, newHistory);
        setIsAiLoading(true);

        try {
            const aiResponse = await getAIResponse(
                reading.spreadType,
                reading.cards,
                reading.deckType,
                userProfile,
                cosmicBlueprint,
                isPremium,
                newHistory,
                userMessage
            );
            const finalHistory = [...newHistory, { sender: 'ai', text: aiResponse }];
            updateReadingChatHistory(reading.id, finalHistory);
        } catch (err) {
            console.error("Error getting AI response:", err);
            const errorHistory = [...newHistory, { sender: 'ai', text: "My apologies, the connection to the digital ether has been disrupted. Please try again." }];
            updateReadingChatHistory(reading.id, errorHistory);
        } finally {
            setIsAiLoading(false);
        }
    }, [reading, userProfile, cosmicBlueprint, isPremium, updateReadingChatHistory]);

    return (
        <div className="bg-[#111218]/50 p-6 rounded-xl border border-[#232533] space-y-4">
            <div>
                <p className="text-sm text-text-muted">
                    {new Date(reading.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <h4 className="text-xl font-semibold font-dm-sans text-text-primary">{reading.title}</h4>
                <span className="text-xs font-bold text-[#6E7BFF] bg-[#6E7BFF]/20 px-2 py-1 rounded-full">
                    {SPREAD_DETAILS[reading.spreadType].name}
                </span>
            </div>
            
             <div className="border-t border-[#232533] pt-4">
                <h5 className="font-semibold text-text-primary mb-2">Items Drawn</h5>
                {reading.deckType === 'runes' ? (
                     <div className="relative w-full h-80 bg-cover bg-center rounded-lg border border-[#232533]" style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/wood-pattern.png)', backgroundColor: '#3a3a3a'}}>
                        <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
                     </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {reading.cards.map((drawnCard, index) => (
                            <div key={index} className="text-center">
                                 <p className="text-xs font-bold text-text-muted mb-1 truncate">{reading.positions[index]}</p>
                                 <DivinationCardDisplay 
                                    drawnCard={drawnCard} 
                                    isRevealed={true}
                                    className="!w-[100px] !h-[170px] mx-auto"
                                 />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t border-[#232533] pt-4">
                <h5 className="font-semibold text-text-primary mb-2">AI Oracle Conversation</h5>
                <div className="h-96 w-full bg-[#0B0C10] rounded-lg border border-border-primary">
                    <ChatInterface messages={reading.chatHistory} onSendMessage={handleSendMessage} isLoading={isAiLoading} />
                </div>
            </div>

            <div className="border-t border-[#232533] pt-4">
                <h5 className="font-semibold text-text-primary mb-2">My Notes</h5>
                {isEditing ? (
                    <div>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-24 p-2 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]" disabled={isSaving} />
                        <div className="flex gap-2 mt-2">
                             <button
                                onClick={handleSaveNotes}
                                className={`px-4 py-1 text-sm rounded-lg transition-colors ${
                                    isSaving
                                        ? 'bg-green-700 text-white'
                                        : 'bg-[#229954] text-white'
                                }`}
                                disabled={isSaving}
                             >
                                {isSaving ? 'Saved!' : 'Save'}
                             </button>
                             <button onClick={() => !isSaving && setIsEditing(false)} className="px-4 py-1 text-sm rounded-lg bg-[#232533] text-text-muted" disabled={isSaving}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div onClick={() => setIsEditing(true)} className="w-full p-2 rounded-lg cursor-pointer hover:bg-[#232533]/50">
                        <p className="text-sm text-text-muted whitespace-pre-wrap">{notes || 'Click to add your reflections...'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const JournalPage: React.FC = () => {
  const { journalEntries, addJournalEntry, savedReadings, addXp } = useApp();
  const [newEntryText, setNewEntryText] = useState('');
  const [modalCard, setModalCard] = useState<DrawnDivinationCard | null>(null);

  const handleSave = () => {
    if (newEntryText.trim()) {
      addJournalEntry(newEntryText);
      addXp(5); // Award XP for new journal entry
      setNewEntryText('');
    }
  };

  return (
    <>
      <div className="w-full h-full p-4 md:p-8 flex flex-col">
        <header className="mb-8 flex-shrink-0">
          <h1 className="text-4xl font-bold font-dm-sans text-text-primary">Journal</h1>
          <p className="text-text-muted">Reflect on your journey and track your insights.</p>
        </header>
        
        <div className="flex-grow overflow-y-auto space-y-8 pr-4 -mr-4">
          <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-4">Saved Readings</h3>
               {savedReadings.length > 0 ? (
                  <div className="space-y-6">
                  {savedReadings.map(reading => (
                      <SavedReadingEntry key={reading.id} reading={reading} onCardClick={setModalCard} />
                  ))}
                  </div>
              ) : (
                  <div className="text-center py-8 bg-[#111218]/30 rounded-xl">
                      <CardsIcon className="w-16 h-16 mx-auto text-text-muted/50" />
                      <p className="text-text-muted mt-4">You have no saved readings. Complete a reading to see it here.</p>
                  </div>
              )}
          </div>

          <div className="bg-[#111218] p-6 rounded-xl border border-[#232533]">
              <h2 className="text-2xl font-semibold font-dm-sans text-text-primary mb-3">New Quick Entry</h2>
              <textarea value={newEntryText} onChange={(e) => setNewEntryText(e.target.value)} placeholder="What's on your mind? For longer reflections, add notes to a specific reading." className="w-full h-28 p-3 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF] focus:border-[#6E7BFF] transition-colors"></textarea>
              <button onClick={handleSave} className="mt-4 px-6 py-2 rounded-lg font-bold bg-[#5A67D8] text-white hover:bg-opacity-80 transition-colors">Save Quick Entry</button>
          </div>

          <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-4">Recent Quick Entries</h3>
              {journalEntries.length > 0 ? (
              journalEntries.map(entry => (
                  <div key={entry.id} className="bg-[#111218]/50 p-4 rounded-lg border border-[#232533] mb-4">
                  <p className="text-sm text-text-muted mb-2">{new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-text-primary whitespace-pre-wrap">{entry.text}</p>
                  </div>
              ))
              ) : (
                  <div className="text-center py-12 bg-[#111218]/30 rounded-xl">
                      <JournalIcon className="w-16 h-16 mx-auto text-text-muted/50" />
                      <p className="text-text-muted mt-4">Your journal is empty. Start by writing your first reflection!</p>
                  </div>
              )}
          </div>
        </div>
      </div>
      <CardDetailModal drawnCard={modalCard} onClose={() => setModalCard(null)} />
    </>
  );
};

export default JournalPage;