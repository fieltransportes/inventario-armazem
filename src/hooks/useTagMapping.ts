import { useState, useEffect } from 'react';
import { TagMapping, TextFileMapping, TagEquivalence } from '../types/tagMapping';

export const useTagMapping = () => {
  const [tagMappings, setTagMappings] = useState<TagMapping[]>([]);
  const [textFileMappings, setTextFileMappings] = useState<TextFileMapping[]>([]);
  const [tagEquivalences, setTagEquivalences] = useState<TagEquivalence[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTagMappings = localStorage.getItem('tagMappings');
    const savedTextMappings = localStorage.getItem('textFileMappings');
    const savedEquivalences = localStorage.getItem('tagEquivalences');

    if (savedTagMappings) {
      setTagMappings(JSON.parse(savedTagMappings));
    }
    if (savedTextMappings) {
      setTextFileMappings(JSON.parse(savedTextMappings));
    }
    if (savedEquivalences) {
      setTagEquivalences(JSON.parse(savedEquivalences));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('tagMappings', JSON.stringify(tagMappings));
  }, [tagMappings]);

  useEffect(() => {
    localStorage.setItem('textFileMappings', JSON.stringify(textFileMappings));
  }, [textFileMappings]);

  useEffect(() => {
    localStorage.setItem('tagEquivalences', JSON.stringify(tagEquivalences));
  }, [tagEquivalences]);

  const addTagMapping = (mapping: Omit<TagMapping, 'id' | 'createdAt'>) => {
    const newMapping: TagMapping = {
      ...mapping,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setTagMappings(prev => [...prev, newMapping]);
  };

  const updateTagMapping = (id: string, updates: Partial<TagMapping>) => {
    setTagMappings(prev => 
      prev.map(mapping => 
        mapping.id === id ? { ...mapping, ...updates } : mapping
      )
    );
  };

  const deleteTagMapping = (id: string) => {
    setTagMappings(prev => prev.filter(mapping => mapping.id !== id));
  };

  const addTextFileMapping = (mapping: Omit<TextFileMapping, 'id' | 'createdAt'>) => {
    const newMapping: TextFileMapping = {
      ...mapping,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setTextFileMappings(prev => [...prev, newMapping]);
  };

  const updateTextFileMapping = (id: string, updates: Partial<TextFileMapping>) => {
    setTextFileMappings(prev => 
      prev.map(mapping => 
        mapping.id === id ? { ...mapping, ...updates } : mapping
      )
    );
  };

  const deleteTextFileMapping = (id: string) => {
    setTextFileMappings(prev => prev.filter(mapping => mapping.id !== id));
  };

  const addTagEquivalence = (equivalence: Omit<TagEquivalence, 'id'>) => {
    const newEquivalence: TagEquivalence = {
      ...equivalence,
      id: Date.now().toString()
    };
    setTagEquivalences(prev => [...prev, newEquivalence]);
  };

  const updateTagEquivalence = (id: string, updates: Partial<TagEquivalence>) => {
    setTagEquivalences(prev => 
      prev.map(equiv => 
        equiv.id === id ? { ...equiv, ...updates } : equiv
      )
    );
  };

  const deleteTagEquivalence = (id: string) => {
    setTagEquivalences(prev => prev.filter(equiv => equiv.id !== id));
  };

  return {
    tagMappings,
    textFileMappings,
    tagEquivalences,
    addTagMapping,
    updateTagMapping,
    deleteTagMapping,
    addTextFileMapping,
    updateTextFileMapping,
    deleteTextFileMapping,
    addTagEquivalence,
    updateTagEquivalence,
    deleteTagEquivalence
  };
};