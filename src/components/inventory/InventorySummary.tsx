
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useUnitConversion } from '@/hooks/useUnitConversion';

interface InventoryItem {
  name: string;
  code?: string;
  totalQuantity: number;
  totalValue: number;
  unit: string;
  occurrences: number;
}

interface InventorySummaryProps {
  inventorySummary: InventoryItem[];
  showUnitized?: boolean;
}

const InventorySummary: React.FC<InventorySummaryProps> = ({ inventorySummary, showUnitized = false }) => {
  const [showUnitizedLocal, setShowUnitizedLocal] = useState(false);
  const { convertQuantity } = useUnitConversion();

  const formatQuantity = (quantity: number, unit: string, item: InventoryItem, showUnitized: boolean = false) => {
    console.log('InventorySummary formatQuantity:', { quantity, unit, showUnitized, productCode: item.code });
    if (showUnitized && item.code) {
      return convertQuantity(quantity, unit, item.code);
    }
    return `${quantity.toLocaleString('pt-BR')} ${unit}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Resumo do Inventário por Produto</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUnitizedLocal(!showUnitizedLocal)}
            className="flex items-center space-x-2"
          >
            {showUnitizedLocal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showUnitizedLocal ? 'Qtd. Original' : 'Qtd. Unitizada'}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Quantidade Total</TableHead>
              <TableHead className="text-center">Ocorrências</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventorySummary.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right">
                  {formatQuantity(item.totalQuantity, item.unit, item, showUnitizedLocal)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">
                    {item.occurrences} NFE{item.occurrences > 1 ? 's' : ''}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InventorySummary;
