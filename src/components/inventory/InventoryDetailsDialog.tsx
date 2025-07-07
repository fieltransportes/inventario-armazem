
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Save } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useInventoryItems } from '../../hooks/useInventoryItems';
import InventoryItemsTable from './InventoryItemsTable';
import InventoryFilesManager from './InventoryFilesManager';

interface InventoryDetailsDialogProps {
  inventoryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshTrigger?: number;
}

const InventoryDetailsDialog: React.FC<InventoryDetailsDialogProps> = ({
  inventoryId,
  open,
  onOpenChange,
  refreshTrigger
}) => {
  const { savedInventories } = useInventory();
  const {
    items,
    countedQuantities,
    loading,
    allQuantitiesFilled,
    handleQuantityChange,
    handleSaveQuantity,
    handleSaveAllQuantities,
    handleCompleteInventory
  } = useInventoryItems(inventoryId, open, refreshTrigger);

  const inventory = savedInventories.find(inv => inv.id === inventoryId);

  const onCompleteInventory = async () => {
    const success = await handleCompleteInventory();
    if (success) {
      onOpenChange(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl">
          <div className="text-center py-8">Carregando itens do inventário...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span>Inventário #{inventory?.inventory_number}</span>
              {inventory?.status === 'completed' ? (
                <Badge className="bg-green-100 text-green-800 ml-2">
                  <CheckCircle className="h-3 w-3 mr-1" />Concluído
                </Badge>
              ) : (
                <Badge className="bg-orange-100 text-orange-800 ml-2">Em Andamento</Badge>
              )}
            </div>
            {inventory?.status === 'open' && (
              <Button onClick={onCompleteInventory} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar Inventário
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {inventory?.notes && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Observações:</strong> {inventory.notes}
              </p>
            </div>
          )}

          {inventory?.status === 'open' && items.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={handleSaveAllQuantities}
                disabled={!allQuantitiesFilled}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Todas as Quantidades
              </Button>
            </div>
          )}

          <InventoryItemsTable
            items={items}
            countedQuantities={countedQuantities}
            inventoryStatus={inventory?.status || 'open'}
            onQuantityChange={handleQuantityChange}
            onSaveQuantity={handleSaveQuantity}
          />

          <InventoryFilesManager
            inventoryId={inventoryId}
            inventoryNumber={inventory?.inventory_number || ''}
            inventoryStatus={inventory?.status || 'open'}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryDetailsDialog;
