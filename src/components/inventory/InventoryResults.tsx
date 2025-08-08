import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save as SaveIcon } from 'lucide-react';
import { NFEData } from '../../types/nfe';
import InventorySummary from './InventorySummary';
import ProductList from './ProductList';
import DeliveryGrouping from './DeliveryGrouping';
import NFEList from './NFEList';
import PrintInventory from './PrintInventory';
import SaveInventoryDialog from './SaveInventoryDialog';

interface InventoryResultsProps {
  filteredNFEs: NFEData[];
  allProducts: any[];
  inventorySummary: any[];
  searchFilters: any[];
  showUnitized?: boolean;
}

const InventoryResults: React.FC<InventoryResultsProps> = ({
  filteredNFEs,
  allProducts,
  inventorySummary,
  searchFilters,
  showUnitized = false
}) => {
  console.log('InventoryResults received showUnitized:', showUnitized);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  return (
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
          <InventorySummary inventorySummary={inventorySummary} showUnitized={showUnitized} />
        </TabsContent>

        <TabsContent value="detailed">
          <ProductList products={allProducts} showUnitized={showUnitized} />
        </TabsContent>

        <TabsContent value="delivery">
          <DeliveryGrouping filteredNFEs={filteredNFEs} showUnitized={showUnitized} />
        </TabsContent>

        <TabsContent value="nfes">
          <NFEList nfes={filteredNFEs} />
        </TabsContent>
      </Tabs>

      <SaveInventoryDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        searchFilters={searchFilters}
        inventorySummary={inventorySummary}
      />
    </>
  );
};

export default InventoryResults;