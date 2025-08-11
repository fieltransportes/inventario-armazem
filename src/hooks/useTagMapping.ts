import { useState, useEffect } from 'react';
import { TagMapping, TextFileMapping, TagEquivalence } from '../types/tagMapping';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export const useTagMapping = () => {
  const { user } = useAuthContext();
  const [tagMappings, setTagMappings] = useState<TagMapping[]>([]);
  const [textFileMappings, setTextFileMappings] = useState<TextFileMapping[]>([]);
  const [tagEquivalences, setTagEquivalences] = useState<TagEquivalence[]>([]);

  // Load data on mount - prioritize Supabase if user is logged in
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          // Load from Supabase
          const [tagMappingsRes, textMappingsRes, equivalencesRes] = await Promise.all([
            supabase.from('tag_mappings').select('*').eq('user_id', user.id),
            supabase.from('text_file_mappings').select('*').eq('user_id', user.id),
            supabase.from('tag_equivalences').select('*').eq('user_id', user.id)
          ]);

          if (tagMappingsRes.data) {
            setTagMappings(tagMappingsRes.data.map(item => ({
              id: item.id,
              sourceTag: item.source_tag,
              targetTag: item.target_tag,
              description: item.description || '',
              active: true,
              createdAt: item.created_at
            })));
          }

          if (textMappingsRes.data) {
            setTextFileMappings(textMappingsRes.data.map(item => ({
              id: item.id,
              fileName: item.file_pattern,
              content: '',
              mappedToTag: '',
              description: item.description || '',
              active: true,
              createdAt: item.created_at
            })));
          }

          if (equivalencesRes.data) {
            setTagEquivalences(equivalencesRes.data.map(item => ({
              id: item.id,
              primaryTag: item.tag_name,
              equivalentTags: item.equivalent_tags,
              description: '',
              active: true
            })));
          }

          // Migrate any localStorage data to Supabase
          await migrateLocalStorageData();
        } catch (error) {
          console.error('Error loading data from Supabase:', error);
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
    };

    loadData();
  }, [user]);

  const loadFromLocalStorage = () => {
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
  };

  const migrateLocalStorageData = async () => {
    if (!user) return;

    try {
      const savedTagMappings = localStorage.getItem('tagMappings');
      const savedTextMappings = localStorage.getItem('textFileMappings');
      const savedEquivalences = localStorage.getItem('tagEquivalences');

      if (savedTagMappings) {
        const mappings = JSON.parse(savedTagMappings);
        for (const mapping of mappings) {
          await supabase.from('tag_mappings').upsert({
            user_id: user.id,
            source_tag: mapping.sourceTag,
            target_tag: mapping.targetTag,
            description: mapping.description
          });
        }
        localStorage.removeItem('tagMappings');
      }

      if (savedTextMappings) {
        const mappings = JSON.parse(savedTextMappings);
        for (const mapping of mappings) {
          await supabase.from('text_file_mappings').upsert({
            user_id: user.id,
            file_pattern: mapping.filePattern,
            tag_mappings: mapping.tagMappings,
            description: mapping.description
          });
        }
        localStorage.removeItem('textFileMappings');
      }

      if (savedEquivalences) {
        const equivalences = JSON.parse(savedEquivalences);
        for (const equiv of equivalences) {
          await supabase.from('tag_equivalences').upsert({
            user_id: user.id,
            tag_name: equiv.tagName,
            equivalent_tags: equiv.equivalentTags
          });
        }
        localStorage.removeItem('tagEquivalences');
      }
    } catch (error) {
      console.error('Error migrating localStorage data:', error);
    }
  };

  const addTagMapping = async (mapping: Omit<TagMapping, 'id' | 'createdAt'>) => {
    const newMapping: TagMapping = {
      ...mapping,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    if (user) {
      try {
        await supabase.from('tag_mappings').insert({
          user_id: user.id,
          source_tag: mapping.sourceTag,
          target_tag: mapping.targetTag,
          description: mapping.description
        });
      } catch (error) {
        console.error('Error saving tag mapping:', error);
      }
    }

    setTagMappings(prev => [...prev, newMapping]);
  };

  const updateTagMapping = async (id: string, updates: Partial<TagMapping>) => {
    if (user) {
      try {
        await supabase.from('tag_mappings')
          .update({
            source_tag: updates.sourceTag,
            target_tag: updates.targetTag,
            description: updates.description
          })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating tag mapping:', error);
      }
    }

    setTagMappings(prev => 
      prev.map(mapping => 
        mapping.id === id ? { ...mapping, ...updates } : mapping
      )
    );
  };

  const deleteTagMapping = async (id: string) => {
    if (user) {
      try {
        await supabase.from('tag_mappings')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error deleting tag mapping:', error);
      }
    }

    setTagMappings(prev => prev.filter(mapping => mapping.id !== id));
  };

  const addTextFileMapping = async (mapping: Omit<TextFileMapping, 'id' | 'createdAt'>) => {
    const newMapping: TextFileMapping = {
      ...mapping,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    if (user) {
      try {
        await supabase.from('text_file_mappings').insert({
          user_id: user.id,
          file_pattern: mapping.fileName,
          tag_mappings: {},
          description: mapping.description
        });
      } catch (error) {
        console.error('Error saving text file mapping:', error);
      }
    }

    setTextFileMappings(prev => [...prev, newMapping]);
  };

  const updateTextFileMapping = async (id: string, updates: Partial<TextFileMapping>) => {
    if (user) {
      try {
        await supabase.from('text_file_mappings')
          .update({
            file_pattern: updates.fileName,
            tag_mappings: {},
            description: updates.description
          })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating text file mapping:', error);
      }
    }

    setTextFileMappings(prev => 
      prev.map(mapping => 
        mapping.id === id ? { ...mapping, ...updates } : mapping
      )
    );
  };

  const deleteTextFileMapping = async (id: string) => {
    if (user) {
      try {
        await supabase.from('text_file_mappings')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error deleting text file mapping:', error);
      }
    }

    setTextFileMappings(prev => prev.filter(mapping => mapping.id !== id));
  };

  const addTagEquivalence = async (equivalence: Omit<TagEquivalence, 'id'>) => {
    const newEquivalence: TagEquivalence = {
      ...equivalence,
      id: Date.now().toString()
    };

    if (user) {
      try {
        await supabase.from('tag_equivalences').insert({
          user_id: user.id,
          tag_name: equivalence.primaryTag,
          equivalent_tags: equivalence.equivalentTags
        });
      } catch (error) {
        console.error('Error saving tag equivalence:', error);
      }
    }

    setTagEquivalences(prev => [...prev, newEquivalence]);
  };

  const updateTagEquivalence = async (id: string, updates: Partial<TagEquivalence>) => {
    if (user) {
      try {
        await supabase.from('tag_equivalences')
          .update({
            tag_name: updates.primaryTag,
            equivalent_tags: updates.equivalentTags
          })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating tag equivalence:', error);
      }
    }

    setTagEquivalences(prev => 
      prev.map(equiv => 
        equiv.id === id ? { ...equiv, ...updates } : equiv
      )
    );
  };

  const deleteTagEquivalence = async (id: string) => {
    if (user) {
      try {
        await supabase.from('tag_equivalences')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error deleting tag equivalence:', error);
      }
    }

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