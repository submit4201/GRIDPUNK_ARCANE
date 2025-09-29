import React from 'react';

interface PageHeaderProps {
  title: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  return (
    <div className="p-4 md:p-6 border-b border-border-primary">
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
    </div>
  );
};