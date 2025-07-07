import React from 'react';
import Navbar from '@/components/Navbar';
import TagMappingManager from '@/components/tagMapping/TagMappingManager';

const TagMapping: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TagMappingManager />
      </div>
    </div>
  );
};

export default TagMapping;