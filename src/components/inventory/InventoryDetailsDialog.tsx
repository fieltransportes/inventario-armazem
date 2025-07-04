
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Save, AlertTriangle } from 'lucide-react';
import { useInventory, InventoryItem } from '../../hooks/useInventory';

interface InventoryDetailsDialogProps {
  inventoryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshTrigger?: number; // Add trigger to force refresh
}

const InventoryDetailsDialog: React.FC<InventoryDetailsDialogProps> = ({
  inventoryId,
  open,
  onOpenChange,
  refreshTrigger
}) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [countedQuantities, setCountedQuantities] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { fetchInventoryItems, updateCountedQuantity, completeInventory, savedInventories } = useInventory();

  const inventory = savedInventories.find(inv => inv.id === inventoryId);

  useEffect(() => {
    if (open && inventoryId) {
      loadItems();
    }
  }, [open, inventoryId, refreshTrigger]); // Add refreshTrigger to dependencies

  const loadItems = async () => {
    setLoading(true);
    try {
      const inventoryItems = await fetchInventoryItems(inventoryId);
      setItems(inventoryItems);
      
      // Initialize counted quantities with existing values
      const initialQuantities: { [key: string]: string } = {};
      inventoryItems.forEach(item => {
        if (item.counted_quantity !== null && item.counted_quantity !== undefined) {
          initialQuantities[item.id] = item.counted_quantity.toString();
        }
      });
      setCountedQuantities(initialQuantities);
    } catch (error) {
      console.error('Error loading inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    setCountedQuantities(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleSaveQuantity = async (itemId: string) => {
    const quantity = parseFloat(countedQuantities[itemId] || '0');
    if (isNaN(quantity) || quantity < 0) {
      return;
    }

    try {
      await updateCountedQuantity(itemId, quantity);
      await loadItems(); // Refresh items
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleSaveAllQuantities = async () => {
    try {
      // Save all quantities in parallel
      const promises = items.map(async (item) => {
        const quantity = parseFloat(countedQuantities[item.id] || '0');
        if (!isNaN(quantity) && quantity >= 0) {
          await updateCountedQuantity(item.id, quantity);
        }
      });
      
      await Promise.all(promises);
      await loadItems(); // Refresh items
    } catch (error) {
      console.error('Error updating all quantities:', error);
    }
  };

  const allQuantitiesFilled = items.every(item => 
    countedQuantities[item.id] && 
    !isNaN(parseFloat(countedQuantities[item.id]))
  );

  const handleCompleteInventory = async () => {
    if (window.confirm('Tem certeza que deseja finalizar este inventário? Esta ação não pode ser desfeita.')) {
      try {
        await completeInventory(inventoryId);
        onOpenChange(false);
      } catch (error) {
        console.error('Error completing inventory:', error);
      }
    }
  };

  const getVarianceStatus = (expected: number, counted?: number) => {
    if (counted === null || counted === undefined) return null;
    
    const variance = counted - expected;
    if (variance === 0) return 'exact';
    if (variance > 0) return 'surplus';
    return 'shortage';
  };

  const getVarianceBadge = (expected: number, counted?: number) => {
    const status = getVarianceStatus(expected, counted);
    if (!status) return null;

    if (status === 'exact') {
      return <Badge className="bg-green-100 text-green-800">Exato</Badge>;
    }
    if (status === 'surplus') {
      return <Badge className="bg-blue-100 text-blue-800">Sobra</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">Falta</Badge>;
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
              <Button onClick={handleCompleteInventory} className="bg-green-600 hover:bg-green-700">
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Qtd Esperada</TableHead>
                <TableHead className="text-center">Qtd Contada</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product_name}</TableCell>
                  <TableCell className="text-right">
                    {item.expected_quantity.toLocaleString('pt-BR')} {item.unit}
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={countedQuantities[item.id] || ''}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      placeholder="0"
                      className="w-24 text-center"
                      disabled={inventory?.status === 'completed'}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {getVarianceBadge(item.expected_quantity, item.counted_quantity)}
                  </TableCell>
                  <TableCell className="text-center">
                    {inventory?.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveQuantity(item.id)}
                        disabled={!countedQuantities[item.id]}
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Salvar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {items.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum item encontrado neste inventário.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryDetailsDialog;
