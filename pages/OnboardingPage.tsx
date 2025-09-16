import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, AstrologicalSign } from '../types';

const OnboardingPage: React.FC = () => {
  const { userProfile, setUserProfile, setIsOnboarded } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  
  const getSignFromDate = (dateString: string): AstrologicalSign => {
      if (!dateString) return 'None';
      // Safari requires T00:00:00 for dates
      const date = new Date(`${dateString}T00:00:00`);
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


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => {
        const updatedData = { ...prev, [id]: value };
        if (id === 'birthDate') {
            updatedData.astrologicalSign = getSignFromDate(value);
        }
        return updatedData;
    });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = () => {
    setUserProfile(formData);
    setIsOnboarded(true);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-bold font-dm-sans text-text-primary">Welcome to Gridpunk Arcana</h2>
            <p className="text-text-muted">Let's create your Cosmic Blueprint. This information helps us generate hyper-personalized numerological and astrological insights for you.</p>
            <div>
              <label htmlFor="givenName" className="block text-sm font-medium text-text-muted mb-1">Given Name (at birth)</label>
              <input type="text" id="givenName" value={formData.givenName} onChange={handleInputChange} className="w-full p-3 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]" />
            </div>
            <div>
              <label htmlFor="usedName" className="block text-sm font-medium text-text-muted mb-1">Used Name (current)</label>
              <input type="text" id="usedName" value={formData.usedName} onChange={handleInputChange} className="w-full p-3 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]" />
            </div>
             <div>
              <label htmlFor="mothersMaidenName" className="block text-sm font-medium text-text-muted mb-1">Mother's Maiden Name</label>
              <input type="text" id="mothersMaidenName" value={formData.mothersMaidenName} onChange={handleInputChange} className="w-full p-3 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]" />
              <p className="text-xs text-text-muted mt-1">Used to calculate your Heritage Number.</p>
            </div>
            <button onClick={nextStep} className="w-full px-6 py-3 rounded-lg font-bold bg-[#5A67D8] text-white hover:bg-opacity-80 transition-colors">Next</button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in-up">
             <h2 className="text-3xl font-bold font-dm-sans text-text-primary">Your Natal Details</h2>
             <p className="text-text-muted">Your birth details allow for the most accurate calculations.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-text-muted mb-1">Date of Birth</label>
                  <input type="date" id="birthDate" value={formData.birthDate} onChange={handleInputChange} className="w-full p-3 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]" />
                </div>
                 <div>
                  <label htmlFor="birthTime" className="block text-sm font-medium text-text-muted mb-1">Time of Birth</label>
                  <input type="time" id="birthTime" value={formData.birthTime} onChange={handleInputChange} className="w-full p-3 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]" />
                </div>
            </div>
            <div>
              <label htmlFor="birthPlace" className="block text-sm font-medium text-text-muted mb-1">Place of Birth (City, Country)</label>
              <input type="text" id="birthPlace" value={formData.birthPlace} onChange={handleInputChange} className="w-full p-3 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]" />
            </div>
             <div className="flex gap-4">
                <button onClick={prevStep} className="w-full px-6 py-3 rounded-lg font-bold bg-[#232533] text-text-primary hover:bg-opacity-80 transition-colors">Back</button>
                <button onClick={nextStep} className="w-full px-6 py-3 rounded-lg font-bold bg-[#5A67D8] text-white hover:bg-opacity-80 transition-colors">Next</button>
            </div>
          </div>
        );
        case 3:
        return (
          <div className="space-y-6 animate-fade-in-up">
             <h2 className="text-3xl font-bold font-dm-sans text-text-primary">Personalize Your Guide</h2>
             <p className="text-text-muted">Your answers here will shape the tone and focus of your AI-powered interpretations.</p>
             
            <div>
                <label htmlFor="readingStyle" className="block text-sm font-medium text-text-muted mb-2">How do you prefer your guidance?</label>
                <select id="readingStyle" value={formData.readingStyle} onChange={handleInputChange} className="w-full p-3 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]">
                    <option value="mystical">Mystical & Poetic</option>
                    <option value="practical">Practical & Action-Oriented</option>
                    <option value="psychological">Psychological & Reflective</option>
                </select>
            </div>

            <div>
                <label htmlFor="readingFocus" className="block text-sm font-medium text-text-muted mb-2">What area of life needs the most clarity now?</label>
                <select id="readingFocus" value={formData.readingFocus} onChange={handleInputChange} className="w-full p-3 bg-[#0B0C10] border border-[#232533] rounded-lg focus:ring-2 focus:ring-[#6E7BFF]">
                    <option value="general">General Guidance</option>
                    <option value="love">Love & Relationships</option>
                    <option value="career">Career & Ambition</option>
                    <option value="growth">Personal Growth</option>
                </select>
            </div>

             <div className="flex gap-4">
                <button onClick={prevStep} className="w-full px-6 py-3 rounded-lg font-bold bg-[#232533] text-text-primary hover:bg-opacity-80 transition-colors">Back</button>
                <button onClick={handleSubmit} className="w-full px-6 py-3 rounded-lg font-bold bg-[#29C26A] text-white hover:bg-opacity-80 transition-colors">Calculate & Begin</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen bg-[#0B0C10] text-text-primary flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111218] p-8 rounded-2xl border border-[#232533] shadow-2xl shadow-black/30">
            {renderStep()}
        </div>
        <p className="text-xs text-text-muted mt-6">All data is stored locally on your device and is never sent to our servers.</p>
    </div>
  );
};

export default OnboardingPage;