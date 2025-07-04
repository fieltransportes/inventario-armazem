import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Save as SaveIcon, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getNFEData } from '../utils/storage';
import { NFEData } from '../types/nfe';
import SearchFilters from '../components/inventory/SearchFilters';
import InventorySummary from '../components/inventory/InventorySummary';
import ProductList from '../components/inventory/ProductList';
import NFEList from '../components/inventory/NFEList';
import DeliveryGrouping from '../components/inventory/DeliveryGrouping';
import EmptyStates from '../components/inventory/EmptyStates';
import PrintInventory from '../components/inventory/PrintInventory';
import SaveInventoryDialog from '../components/inventory/SaveInventoryDialog';
import SavedInventoriesList from '../components/inventory/SavedInventoriesList';
import { useToast } from '@/hooks/use-toast';

interface SearchFilter {
  id: string;
  type: 'number' | 'chave';
  value: string;
}

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'number' | 'chave'>('number');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [allNFEData, setAllNFEData] = useState<NFEData[]>([]);
  const [loading, setLoading] = useState(true);
  
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
  
  // Get all products from filtered NFEs
  const allProducts = useMemo(() => {
    const products: any[] = [];
    
    filteredNFEs.forEach(nfe => {
      nfe.products.forEach(product => {
        products.push({
          ...product,
          nfeNumber: nfe.number,
          nfeDate: new Date(nfe.issueDate).toLocaleDateString('pt-BR'),
          seller: nfe.seller.name
        });
      });
    });
    
    return products;
  }, [filteredNFEs]);
  
  // Group products by name for inventory summary
  const inventorySummary = useMemo(() => {
    const summary = new Map<string, {
      name: string;
      totalQuantity: number;
      totalValue: number;
      unit: string;
      occurrences: number;
    }>();
    
    allProducts.forEach(product => {
      const key = product.name.toLowerCase();
      
      if (summary.has(key)) {
        const existing = summary.get(key)!;
        existing.totalQuantity += product.quantity;
        existing.totalValue += product.totalPrice;
        existing.occurrences += 1;
      } else {
        summary.set(key, {
          name: product.name,
          totalQuantity: product.quantity,
          totalValue: product.totalPrice,
          unit: product.unit,
          occurrences: 1
        });
      }
    });
    
    return Array.from(summary.values()).sort((a, b) => b.totalValue - a.totalValue);
  }, [allProducts]);

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Inventário de Produtos</h1>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="search">Buscar e Criar</TabsTrigger>
            <TabsTrigger value="saved">Inventários Salvos</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Search Section */}
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
            />

            {/* Results */}
            {searchFilters.length > 0 && filteredNFEs.length > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Resultados da Busca</h2>
                  <div className="flex space-x-2">
                    <PrintInventory 
                      inventorySummary={inventorySummary} 
                      searchFilters={searchFilters}
                    />
                    <Button 
                      onClick={() => setSaveDialogOpen(true)}
                      className="flex items-center space-x-2"
                    >
                      <SaveIcon className="h-4 w-4" />
                      <span>Salvar Inventário</span>
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="summary" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="summary">Resumo do Inventário</TabsTrigger>
                    <TabsTrigger value="detailed">Lista Detalhada</TabsTrigger>
                    <TabsTrigger value="delivery">Por Entrega</TabsTrigger>
                    <TabsTrigger value="nfes">NFEs Encontradas</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary">
                    <InventorySummary inventorySummary={inventorySummary} />
                  </TabsContent>

                  <TabsContent value="detailed">
                    <ProductList products={allProducts} />
                  </TabsContent>

                  <TabsContent value="delivery">
                    <DeliveryGrouping filteredNFEs={filteredNFEs} />
                  </TabsContent>

                  <TabsContent value="nfes">
                    <NFEList nfes={filteredNFEs} />
                  </TabsContent>
                </Tabs>
              </>
            )}

            {/* Empty State */}
            {searchFilters.length === 0 && (
              <EmptyStates type="initial" />
            )}

            {/* No Results State */}
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

        {/* Save Inventory Dialog */}
        <SaveInventoryDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          searchFilters={searchFilters}
          inventorySummary={inventorySummary}
        />
      </div>
    </div>
  );
};

export default Inventory;