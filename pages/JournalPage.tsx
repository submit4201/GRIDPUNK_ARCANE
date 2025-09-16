import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { JournalIcon, CardsIcon } from '../components/icons';
import { SPREAD_DETAILS } from '../constants';
import { SavedReading, DrawnDivinationCard, Rune } from '../types';
import DivinationCardDisplay from '../components/TarotCard';
import CardDetailModal from '../components/CardDetailModal';

const SavedReadingEntry: React.FC<{ reading: SavedReading; onCardClick: (card: DrawnDivinationCard) => void; }> = ({ reading, onCardClick }) => {
    const { updateSavedReadingNotes } = useApp();
    const [notes, setNotes] = useState(reading.userNotes);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setNotes(reading.userNotes);
    }, [reading.userNotes]);

    const handleSaveNotes = () => {
        updateSavedReadingNotes(reading.id, notes);
        setIsEditing(false);
    };

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
                         {reading.cards.map((rune, index) => (
                             <div 
                                 key={index}
                                 className="absolute group" 
                                 style={{ 
                                     left: `${rune.x}%`, 
                                     top: `${rune.y}%`, 
                                     transform: `translate(-50%, -50%) rotate(${rune.rotation}deg)`
                                 }}
                             >
                                 <DivinationCardDisplay drawnCard={rune} isRevealed={true} className="!w-[45px] !h-[60px] cursor-pointer" onClick={() => onCardClick(rune)} />
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-[#111218] text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg border border-[#34384a]">
                                    <p className="font-bold text-sm text-purple-400">{reading.positions[index]}</p>
                                    <p className="font-semibold text-base mb-1 text-left">{(rune.card as Rune).name} ({rune.isReversed ? 'Merkstave' : 'Upright'})</p>
                                    <p className="font-mono text-amber-300/80 text-center mb-2 text-xs">{(rune.card as Rune).keywords.join(' • ')}</p>
                                    <p className="text-text-muted mb-2 text-xs text-left">{(rune.card as Rune).meaning}</p>

                                    {(reading.spreadType === 'full-cast') && (
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {reading.cards.map((drawnCard, index) => (
                            <div key={index} className="text-center">
                                 <p className="text-xs font-bold text-text-muted mb-1 truncate">{reading.positions[index]}</p>
                                 <DivinationCardDisplay 
                                    drawnCard={drawnCard} 
                                    isRevealed={true}
                                    onClick={() => onCardClick(drawnCard)}
                                    className="!w-[100px] !h-[170px] mx-auto cursor-pointer"
                                 />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {reading.aiSummary && (
                 <div className="border-t border-[#232533] pt-4">
                    <h5 className="font-semibold text-text-primary mb-2">AI Summary</h5>
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{reading.aiSummary}</p>
                </div>
            )}

            <div className="border-t border-[#232533] pt-4">
                <h5 className="font-semibold text-text-primary mb-2">My Notes</h5>
                {isEditing ? (
                    <div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-24 p-2 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]"
                        />
                        <div className="flex gap-2 mt-2">
                             <button onClick={handleSaveNotes} className="px-4 py-1 text-sm rounded-lg bg-[#229954] text-white">Save</button>
                             <button onClick={() => setIsEditing(false)} className="px-4 py-1 text-sm rounded-lg bg-[#232533] text-text-muted">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div onClick={() => setIsEditing(true)} className="w-full p-2 rounded-lg cursor-pointer hover:bg-[#232533]/50">
                        <p className="text-sm text-text-muted whitespace-pre-wrap">
                            {notes || 'Click to add your reflections...'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};


const JournalPage: React.FC = () => {
  const { journalEntries, addJournalEntry, savedReadings } = useApp();
  const [newEntryText, setNewEntryText] = useState('');
  const [modalCard, setModalCard] = useState<DrawnDivinationCard | null>(null);

  const handleSave = () => {
    if (newEntryText.trim()) {
      addJournalEntry(newEntryText);
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
              <textarea
              value={newEntryText}
              onChange={(e) => setNewEntryText(e.target.value)}
              placeholder="What's on your mind? For longer reflections, add notes to a specific reading."
              className="w-full h-28 p-3 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF] focus:border-[#6E7BFF] transition-colors"
              ></textarea>
              <button
              onClick={handleSave}
              className="mt-4 px-6 py-2 rounded-lg font-bold bg-[#5A67D8] text-white hover:bg-opacity-80 transition-colors"
              >
              Save Quick Entry
              </button>
          </div>

          <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-4">Recent Quick Entries</h3>
              {journalEntries.length > 0 ? (
              journalEntries.map(entry => (
                  <div key={entry.id} className="bg-[#111218]/50 p-4 rounded-lg border border-[#232533] mb-4">
                  <p className="text-sm text-text-muted mb-2">
                      {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      {entry.linkedCard && (
                          <span className="ml-2 px-2 py-0.5 bg-[#232533] rounded-full text-xs">
                              {`Inspired by: ${entry.linkedCard.card.name}`}
                          </span>
                      )}
                  </p>
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