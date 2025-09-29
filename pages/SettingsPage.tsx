import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/layout';
import { Button } from '../components/ui/Button';
import ConfirmationModal from '../components/ConfirmationModal';

const SettingsPage: React.FC = () => {
  const { clearAllData } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClearData = () => {
    clearAllData();
    setIsModalOpen(false);
    // Optional: Show a success notification
  };

  return (
    <>
      <div className="h-full w-full flex flex-col">
        <PageHeader title="Settings" />
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="bg-background-secondary p-4 rounded-lg border border-border-primary">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Data Management</h2>
            <p className="text-text-muted text-sm mb-4">
              This will permanently delete all your data, including daily draws, saved readings, journal entries, and achievements. This action cannot be undone.
            </p>
            <Button
              variant="danger"
              onClick={() => setIsModalOpen(true)}
            >
              Clear All Application Data
            </Button>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleClearData}
        title="Are you sure?"
        message="This will permanently delete all your application data. This action cannot be undone."
      />
    </>
  );
};

export default SettingsPage;