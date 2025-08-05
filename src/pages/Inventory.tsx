import React, { useState, useEffect } from 'react';
import { Archive } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getNFEData } from '../utils/storage';
import { NFEData } from '../types/nfe';
import InventoryHeader from '../components/inventory/InventoryHeader';
import SearchFilters from '../components/inventory/SearchFilters';
import InventoryResults from '../components/inventory/InventoryResults';
import EmptyStates from '../components/inventory/EmptyStates';
import SavedInventoriesList from '../components/inventory/SavedInventoriesList';
import { useInventorySearch } from '../hooks/useInventorySearch';
import { useInventoryProcessing } from '../hooks/useInventoryProcessing';

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [allNFEData, setAllNFEData] = useState<NFEData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnitized, setShowUnitized] = useState(false);
  
  // Load NFE data on component mount
  useEffect(() => {
    const loadNFEData = async () => {
      try {
        setLoading(true);
        const nfeData = await getNFEData();
        setAllNFEData(nfeData);
      } catch (error) {
        console.error('Erro ao carregar dados NFE:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNFEData();
  }, []);
  
  // Use custom hooks for search and processing logic
  const {
    searchFilters,
    currentSearchTerm,
    searchType,
    filteredNFEs,
    setCurrentSearchTerm,
    setSearchType,
    handleAddFilter,
    handleRemoveFilter,
    handleClearAllFilters
  } = useInventorySearch(allNFEData);

  const { allProducts, inventorySummary } = useInventoryProcessing(filteredNFEs);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando dados NFE...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <InventoryHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="search">Buscar e Criar</TabsTrigger>
            <TabsTrigger value="saved">Inventários Salvos</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <SearchFilters
              searchFilters={searchFilters}
              currentSearchTerm={currentSearchTerm}
              searchType={searchType}
              onSearchTermChange={setCurrentSearchTerm}
              onSearchTypeChange={setSearchType}
              onAddFilter={handleAddFilter}
              onRemoveFilter={handleRemoveFilter}
              onClearAllFilters={handleClearAllFilters}
              resultsCount={{ nfes: filteredNFEs.length, products: allProducts.length }}
              showUnitized={showUnitized}
              onUnitizedToggle={setShowUnitized}
            />

            {searchFilters.length > 0 && filteredNFEs.length > 0 && (
              <InventoryResults
                filteredNFEs={filteredNFEs}
                allProducts={allProducts}
                inventorySummary={inventorySummary}
                searchFilters={searchFilters}
                showUnitized={showUnitized}
              />
            )}

            {searchFilters.length === 0 && (
              <EmptyStates type="initial" />
            )}

            {searchFilters.length > 0 && filteredNFEs.length === 0 && (
              <EmptyStates type="no-results" />
            )}
          </TabsContent>

          <TabsContent value="saved">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Archive className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Inventários Salvos</h2>
              </div>
              <SavedInventoriesList />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Inventory;