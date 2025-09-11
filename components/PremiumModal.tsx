import React from 'react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[#111218] rounded-xl border border-[#232533] p-8 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold font-dm-sans text-[#FF7A1A]">Unlock Premium</h2>
        <p className="text-text-muted mt-2">
          This feature is exclusive to Gridpunk Arcana Premium members.
        </p>
        <p className="text-text-primary mt-4">
          Upgrade now to access the Celtic Cross spread, advanced AI insights, and more.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onUpgrade}
            className="w-full px-6 py-3 rounded-lg font-bold bg-[#FF7A1A] text-white hover:bg-opacity-80 transition-colors"
          >
            Go to Profile & Upgrade
          </button>
          <button
            onClick={onClose}
            className="w-full px-6 py-2 rounded-lg font-semibold text-text-muted hover:bg-[#232533] transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;