import { useState, useMemo } from 'react';
import { NFEData } from '../types/nfe';
import { useToast } from '@/hooks/use-toast';

interface SearchFilter {
  id: string;
  type: 'number' | 'chave';
  value: string;
}

export const useInventorySearch = (allNFEData: NFEData[]) => {
  const { toast } = useToast();
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'number' | 'chave'>('number');

  // Filter NFEs based on search filters
  const filteredNFEs = useMemo(() => {
    if (searchFilters.length === 0) return [];
    
    return allNFEData.filter(nfe => {
      return searchFilters.some(filter => {
        const term = filter.value.toLowerCase();
        if (filter.type === 'number') {
          return nfe.number.toLowerCase().includes(term);
        } else {
          return nfe.chNFe.toLowerCase().includes(term);
        }
      });
    });
  }, [allNFEData, searchFilters]);

  // Function to check if NFE would be duplicated
  const checkForDuplicateNFE = (newFilter: SearchFilter): NFEData[] => {
    // Get NFEs that would match the new filter
    const newMatchingNFEs = allNFEData.filter(nfe => {
      const term = newFilter.value.toLowerCase();
      if (newFilter.type === 'number') {
        return nfe.number.toLowerCase().includes(term);
      } else {
        return nfe.chNFe.toLowerCase().includes(term);
      }
    });

    // Check if any of these NFEs are already in the current filtered list
    const duplicateNFEs = newMatchingNFEs.filter(newNFE => 
      filteredNFEs.some(existingNFE => existingNFE.chNFe === newNFE.chNFe)
    );

    return duplicateNFEs;
  };

  // Add search filter with duplicate check
  const handleAddFilter = () => {
    if (!currentSearchTerm.trim()) return;
    
    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      type: searchType,
      value: currentSearchTerm.trim()
    };

    // Check for duplicates
    const duplicateNFEs = checkForDuplicateNFE(newFilter);
    
    if (duplicateNFEs.length > 0) {
      const nfeNumbers = duplicateNFEs.map(nfe => nfe.number).join(', ');
      toast({
        title: "NFEs já incluídas",
        description: `As seguintes NFEs já estão no filtro: ${nfeNumbers}`,
        variant: "destructive",
      });
      return;
    }

    // Check if the filter would match any NFEs at all
    const matchingNFEs = allNFEData.filter(nfe => {
      const term = newFilter.value.toLowerCase();
      if (newFilter.type === 'number') {
        return nfe.number.toLowerCase().includes(term);
      } else {
        return nfe.chNFe.toLowerCase().includes(term);
      }
    });

    if (matchingNFEs.length === 0) {
      toast({
        title: "Nenhuma NFE encontrada",
        description: `Não foram encontradas NFEs que correspondam ao filtro "${newFilter.value}"`,
        variant: "destructive",
      });
      return;
    }
    
    setSearchFilters(prev => [...prev, newFilter]);
    setCurrentSearchTerm('');
    
    toast({
      title: "Filtro adicionado",
      description: `${matchingNFEs.length} NFE(s) encontrada(s) para o filtro "${newFilter.value}"`,
    });
  };

  // Remove search filter
  const handleRemoveFilter = (filterId: string) => {
    setSearchFilters(prev => prev.filter(filter => filter.id !== filterId));
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchFilters([]);
  };

  return {
    searchFilters,
    currentSearchTerm,
    searchType,
    filteredNFEs,
    setCurrentSearchTerm,
    setSearchType,
    handleAddFilter,
    handleRemoveFilter,
    handleClearAllFilters
  };
};