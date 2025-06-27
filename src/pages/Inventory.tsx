
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getNFEData } from '../utils/storage';
import SearchFilters from '../components/inventory/SearchFilters';
import InventorySummary from '../components/inventory/InventorySummary';
import ProductList from '../components/inventory/ProductList';
import NFEList from '../components/inventory/NFEList';
import EmptyStates from '../components/inventory/EmptyStates';
import PrintInventory from '../components/inventory/PrintInventory';

interface SearchFilter {
  id: string;
  type: 'number' | 'chave';
  value: string;
}

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'number' | 'chave'>('number');
  
  // Get all NFE data
  const allNFEData = getNFEData();
  
  // Add search filter
  const handleAddFilter = () => {
    if (!currentSearchTerm.trim()) return;
    
    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      type: searchType,
      value: currentSearchTerm.trim()
    };
    
    setSearchFilters(prev => [...prev, newFilter]);
    setCurrentSearchTerm('');
  };
  
  // Remove search filter
  const handleRemoveFilter = (filterId: string) => {
    setSearchFilters(prev => prev.filter(filter => filter.id !== filterId));
  };
  
  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchFilters([]);
  };
  
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
          {searchFilters.length > 0 && filteredNFEs.length > 0 && (
            <PrintInventory 
              inventorySummary={inventorySummary} 
              searchFilters={searchFilters}
            />
          )}
        </div>

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
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList>
              <TabsTrigger value="summary">Resumo do Inventário</TabsTrigger>
              <TabsTrigger value="detailed">Lista Detalhada</TabsTrigger>
              <TabsTrigger value="nfes">NFEs Encontradas</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <InventorySummary inventorySummary={inventorySummary} />
            </TabsContent>

            <TabsContent value="detailed">
              <ProductList products={allProducts} />
            </TabsContent>

            <TabsContent value="nfes">
              <NFEList nfes={filteredNFEs} />
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State */}
        {searchFilters.length === 0 && (
          <EmptyStates type="initial" />
        )}

        {/* No Results State */}
        {searchFilters.length > 0 && filteredNFEs.length === 0 && (
          <EmptyStates type="no-results" />
        )}
      </div>
    </div>
  );
};

export default Inventory;
