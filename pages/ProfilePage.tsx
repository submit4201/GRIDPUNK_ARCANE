import React from 'react';
import { useApp } from '../context/AppContext';
import { ASTROLOGICAL_SIGNS } from '../constants';
import { AstrologicalSign } from '../types';


const ProfilePage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const { isPremium, setIsPremium, astrologicalSign, setAstrologicalSign } = useApp();

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-dm-sans text-text-primary">Profile & Settings</h1>
        <p className="text-text-muted">Customize your experience and manage your data.</p>
      </header>

      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-[#111218] p-6 rounded-xl border border-[#232533]">
          <h2 className="text-2xl font-semibold font-dm-sans text-text-primary mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="astrological-sign" className="block text-sm font-medium text-text-muted mb-1">
                Astrological Sign
              </label>
              <select
                id="astrological-sign"
                value={astrologicalSign}
                onChange={(e) => setAstrologicalSign(e.target.value as AstrologicalSign)}
                className="w-full p-2 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]"
              >
                <option value="None">Select your sign...</option>
                {ASTROLOGICAL_SIGNS.map(sign => (
                  <option key={sign} value={sign}>{sign}</option>
                ))}
              </select>
              <p className="text-xs text-text-muted mt-2">Your sign is used to generate your personalized daily horoscope.</p>
            </div>
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-text-muted mb-1">
                Theme
              </label>
              <select
                id="theme"
                className="w-full p-2 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]"
              >
                <option>System (Dark)</option>
                <option>Light (Coming Soon)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#111218] p-6 rounded-xl border border-[#232533]">
          <h2 className="text-2xl font-semibold font-dm-sans text-text-primary mb-4">Subscription</h2>
          {isPremium ? (
             <div className="bg-[#21C7F2]/10 border border-[#21C7F2]/50 p-4 rounded-lg text-center">
                 <p className="font-semibold text-[#21C7F2]">Premium Plan Active</p>
                 <p className="text-sm text-text-muted mt-1">Thank you for your support! You have access to all features.</p>
                 <button onClick={() => setIsPremium(false)} className="mt-4 px-6 py-2 text-sm rounded-lg font-bold bg-[#EF4444] text-white hover:bg-opacity-80 transition-colors">
                     Cancel Subscription
                 </button>
            </div>
          ) : (
            <div className="bg-[#FF7A1A]/10 border border-[#FF7A1A]/50 p-4 rounded-lg text-center">
                  <p className="font-semibold text-[#FF7A1A]">Gridpunk Arcana Premium</p>
                  <p className="text-sm text-text-muted mt-1">Unlock advanced spreads, in-depth AI analysis, and more.</p>
                  <button onClick={() => setIsPremium(true)} className="mt-4 px-6 py-2 text-sm rounded-lg font-bold bg-[#FF7A1A] text-white hover:bg-opacity-80 transition-colors">
                      Upgrade Now
                  </button>
            </div>
          )}
        </div>

        <div className="bg-[#111218] p-6 rounded-xl border border-[#232533]">
          <h2 className="text-2xl font-semibold font-dm-sans text-text-primary mb-4">Data Management</h2>
          <div className="flex gap-4">
            <button className="flex-1 px-4 py-2 text-sm rounded-lg font-bold bg-[#232533] text-text-primary hover:bg-opacity-80 transition-colors">
              Export Journal (JSON)
            </button>
            <button className="flex-1 px-4 py-2 text-sm rounded-lg font-bold bg-[#232533] text-text-primary hover:bg-opacity-80 transition-colors">
              Export Journal (Markdown)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;