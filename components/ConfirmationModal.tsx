import React from 'react';
import { Button } from './ui'; // Assuming a Button component exists

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      <div
        className="relative max-w-md w-full bg-[#111218] rounded-2xl border border-border-primary p-6 md:p-8 space-y-4 shadow-2xl shadow-black/40"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="confirmation-title" className="text-2xl font-bold font-dm-sans text-text-primary">{title}</h2>
        <p className="text-text-muted">{message}</p>
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;