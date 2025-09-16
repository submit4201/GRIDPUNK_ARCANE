

import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
// Fix: ASTROLOGICAL_SIGNS is a constant array now correctly located in types.ts to define the AstrologicalSign type without circular dependencies.
import { AstrologicalSign, UserProfile, ASTROLOGICAL_SIGNS } from '../types';
import { generateCosmicBlueprint } from '../services/cosmicService';
import CosmicBlueprintDisplay from '../components/CosmicBlueprintDisplay';
import { SparklesIcon, LayoutIcon, BookOpenIcon, CardsIcon, BarChartIcon, ShareIcon, CompassIcon, SlidersIcon } from '../components/icons';

const ProfilePage: React.FC = () => {
  const { isPremium, setIsPremium, userProfile, setUserProfile } = useApp();

  const handleProfileChange = (field: keyof UserProfile, value: string | UserProfile['readingStyle'] | UserProfile['readingFocus']) => {
    setUserProfile({ ...userProfile, [field]: value });
  };
  

  const cosmicBlueprint = useMemo(() => generateCosmicBlueprint(userProfile), [userProfile]);

  const getSignFromDate = (dateString: string): AstrologicalSign => {
      if (!dateString) return 'None';
      const date = new Date(dateString);
      const month = date.getMonth() + 1;
      const day = date.getDate();

      if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
      if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
      if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
      if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
      if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
      if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
      if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
      if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
      if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
      if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
      if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
      return 'None';
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const newSign = getSignFromDate(newDate);
    setUserProfile({ ...userProfile, birthDate: newDate, astrologicalSign: newSign });
  };

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-dm-sans text-text-primary">Profile & Settings</h1>
        <p className="text-text-muted">Customize your experience and manage your data.</p>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#111218] p-6 rounded-xl border border-[#232533]">
            <h2 className="text-2xl font-semibold font-dm-sans text-text-primary mb-4">Your Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="givenName" className="block text-sm font-medium text-text-muted mb-1">Given Name (at birth)</label>
                <input type="text" id="givenName" value={userProfile.givenName} onChange={(e) => handleProfileChange('givenName', e.target.value)} className="w-full p-2 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]" />
              </div>
              <div>
                <label htmlFor="usedName" className="block text-sm font-medium text-text-muted mb-1">Used Name (for Current Vibe)</label>
                <input type="text" id="usedName" value={userProfile.usedName} onChange={(e) => handleProfileChange('usedName', e.target.value)} className="w-full p-2 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]" />
              </div>
              <div>
                <label htmlFor="mothersMaidenName" className="block text-sm font-medium text-text-muted mb-1">Mother's Maiden Name</label>
                <input type="text" id="mothersMaidenName" value={userProfile.mothersMaidenName} onChange={(e) => handleProfileChange('mothersMaidenName', e.target.value)} className="w-full p-2 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-text-muted mb-1">Date of Birth</label>
                    <input type="date" id="birthDate" value={userProfile.birthDate} onChange={handleDateChange} className="w-full p-2 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]" />
                  </div>
                  <div>
                    <label htmlFor="birthTime" className="block text-sm font-medium text-text-muted mb-1">Time of Birth</label>
                    <input type="time" id="birthTime" value={userProfile.birthTime} onChange={(e) => handleProfileChange('birthTime', e.target.value)} className="w-full p-2 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]" />
                  </div>
              </div>
              <div>
                <label htmlFor="birthPlace" className="block text-sm font-medium text-text-muted mb-1">Place of Birth (City, Country)</label>
                <input type="text" id="birthPlace" value={userProfile.birthPlace} onChange={(e) => handleProfileChange('birthPlace', e.target.value)} className="w-full p-2 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]" />
              </div>
              <div>
                <label htmlFor="astrological-sign" className="block text-sm font-medium text-text-muted mb-1">Astrological Sign (auto-calculated)</label>
                <input type="text" id="astrological-sign" value={userProfile.astrologicalSign} readOnly className="w-full p-2 bg-[#0B0C10]/50 border border-[#232533] rounded-lg text-text-muted" />
              </div>
            </div>
          </div>
           <div className="bg-[#111218] p-6 rounded-xl border border-[#232533]">
              <h2 className="text-2xl font-semibold font-dm-sans text-text-primary mb-4">Calculated Cosmic Blueprint</h2>
              <CosmicBlueprintDisplay blueprint={cosmicBlueprint} />
           </div>
        </div>
        
         <div className="bg-[#111218] p-6 rounded-xl border border-[#232533]">
          <h2 className="text-2xl font-semibold font-dm-sans text-text-primary mb-4 flex items-center gap-3"><SlidersIcon className="w-6 h-6"/>Reading Preferences</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="readingStyle" className="block text-sm font-medium text-text-muted mb-2">Guidance Style</label>
                    <select id="readingStyle" value={userProfile.readingStyle} onChange={(e) => handleProfileChange('readingStyle', e.target.value as UserProfile['readingStyle'])} className="w-full p-2 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]">
                        <option value="mystical">Mystical & Poetic</option>
                        <option value="practical">Practical & Action-Oriented</option>
                        <option value="psychological">Psychological & Reflective</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="readingFocus" className="block text-sm font-medium text-text-muted mb-2">Current Life Focus</label>
                    <select id="readingFocus" value={userProfile.readingFocus} onChange={(e) => handleProfileChange('readingFocus', e.target.value as UserProfile['readingFocus'])} className="w-full p-2 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]">
                        <option value="general">General Guidance</option>
                        <option value="love">Love & Relationships</option>
                        <option value="career">Career & Ambition</option>
                        <option value="growth">Personal Growth</option>
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
            <div className="bg-[#FF7A1A]/10 border border-[#FF7A1A]/50 p-6 rounded-lg text-center">
                  <p className="font-semibold text-2xl text-[#FF7A1A]">Gridpunk Arcana Premium</p>
                  <p className="text-text-muted mt-1 mb-6">Unlock advanced spreads, in-depth AI analysis, and more.</p>
                  <button onClick={() => setIsPremium(true)} className="px-8 py-3 text-base rounded-lg font-bold bg-[#D95B00] text-white hover:bg-opacity-80 transition-colors shadow-lg shadow-orange-900/40">
                      Upgrade Now
                  </button>
                  <div className="mt-8 text-left max-w-md mx-auto">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">What you'll unlock:</h3>
                    <ul className="space-y-3 text-text-muted">
                        <li className="flex items-start gap-3">
                            <SparklesIcon className="w-5 h-5 text-sky-400 mt-1 flex-shrink-0" />
                            <span><strong className="text-text-primary">In-depth Spread Interpretations:</strong> Offer detailed, AI-generated interpretations for different tarot spreads.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <LayoutIcon className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                            <span><strong className="text-text-primary">Customizable Spread Templates:</strong> Create and save your own unique spread layouts for specific questions.</span>
                        </li>
                         <li className="flex items-start gap-3">
                            <CompassIcon className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                            <span><strong className="text-text-primary">Personalized Tarot Guides:</strong> AI-powered guides that offer tailored card meanings based on your unique Cosmic Blueprint.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CardsIcon className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                            <span><strong className="text-text-primary">Interactive Oracle Decks:</strong> Explore different divination systems like runes, angel cards, and more.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <BarChartIcon className="w-5 h-5 text-rose-400 mt-1 flex-shrink-0" />
                            <span><strong className="text-text-primary">Reading History & Analysis:</strong> Track your history, analyze patterns, and identify recurring themes in your life.</span>
                        </li>
                         <li className="flex items-start gap-3">
                            <ShareIcon className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
                            <span><strong className="text-text-primary">Community Share:</strong> Share your readings with friends via a unique, beautifully designed link to go viral!</span>
                        </li>
                    </ul>
                </div>
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