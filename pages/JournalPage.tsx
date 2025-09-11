import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JournalIcon, CardsIcon } from '../components/icons';
import { SPREAD_DETAILS } from '../constants';

const JournalPage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const { journalEntries, addJournalEntry, savedReadings } = useApp();
  const [newEntryText, setNewEntryText] = useState('');

  const handleSave = () => {
    if (newEntryText.trim()) {
      addJournalEntry(newEntryText);
      setNewEntryText('');
    }
  };

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col">
      <header className="mb-8 flex-shrink-0">
        <h1 className="text-4xl font-bold font-dm-sans text-text-primary">Journal</h1>
        <p className="text-text-muted">Reflect on your journey and track your insights.</p>
      </header>

      <div className="flex-shrink-0 bg-[#111218] p-6 rounded-xl border border-[#232533] mb-8">
        <h2 className="text-2xl font-semibold font-dm-sans text-text-primary mb-3">New Entry</h2>
        <textarea
          value={newEntryText}
          onChange={(e) => setNewEntryText(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full h-28 p-3 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF] focus:border-[#6E7BFF] transition-colors"
        ></textarea>
        <button
          onClick={handleSave}
          className="mt-4 px-6 py-2 rounded-lg font-bold bg-[#6E7BFF] text-white hover:bg-opacity-80 transition-colors"
        >
          Save Entry
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto space-y-8">
        <div>
            <h3 className="text-xl font-semibold text-text-primary mb-4">Saved Readings</h3>
             {savedReadings.length > 0 ? (
                <div className="space-y-4">
                {savedReadings.map(reading => (
                    <div key={reading.id} className="bg-[#111218]/50 p-4 rounded-lg border border-[#232533]">
                    <p className="text-sm text-text-muted mb-2">
                        {new Date(reading.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <h4 className="font-semibold text-text-primary mb-1">{reading.title}</h4>
                    <span className="text-xs font-bold text-[#6E7BFF] bg-[#6E7BFF]/20 px-2 py-1 rounded-full">
                        {SPREAD_DETAILS[reading.spreadType].name}
                    </span>
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <CardsIcon className="w-16 h-16 mx-auto text-text-muted/50" />
                    <p className="text-text-muted mt-4">You have no saved readings. Complete a reading to see it here.</p>
                </div>
            )}
        </div>

        <div>
            <h3 className="text-xl font-semibold text-text-primary mb-4">Recent Entries</h3>
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
                <div className="text-center py-12">
                    <JournalIcon className="w-16 h-16 mx-auto text-text-muted/50" />
                    <p className="text-text-muted mt-4">Your journal is empty. Start by writing your first reflection!</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default JournalPage;