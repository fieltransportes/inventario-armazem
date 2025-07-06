import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, AlertTriangle } from 'lucide-react';
import { InventoryItem } from '../../hooks/useInventory';

interface InventoryItemsTableProps {
  items: InventoryItem[];
  countedQuantities: { [key: string]: string };
  inventoryStatus: string;
  onQuantityChange: (itemId: string, value: string) => void;
  onSaveQuantity: (itemId: string) => void;
}

const InventoryItemsTable: React.FC<InventoryItemsTableProps> = ({
  items,
  countedQuantities,
  inventoryStatus,
  onQuantityChange,
  onSaveQuantity
}) => {
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

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Nenhum item encontrado neste inventário.</p>
      </div>
    );
  }

  return (
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
                onChange={(e) => onQuantityChange(item.id, e.target.value)}
                placeholder="0"
                className="w-24 text-center"
                disabled={inventoryStatus === 'completed'}
              />
            </TableCell>
            <TableCell className="text-center">
              {getVarianceBadge(item.expected_quantity, item.counted_quantity)}
            </TableCell>
            <TableCell className="text-center">
              {inventoryStatus === 'open' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSaveQuantity(item.id)}
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
  );
};

export default InventoryItemsTable;