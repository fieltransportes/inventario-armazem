
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface InventoryItem {
  name: string;
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
  const formatQuantity = (quantity: number, unit: string, showUnitized: boolean = false) => {
    if (showUnitized && unit === 'UN') {
      // Simular conversão para caixas (assumindo 12 unidades por caixa)
      const boxes = Math.floor(quantity / 12);
      const remainingUnits = quantity % 12;
      if (boxes > 0 && remainingUnits > 0) {
        return `${boxes.toLocaleString('pt-BR')} CX + ${remainingUnits} UN`;
      } else if (boxes > 0) {
        return `${boxes.toLocaleString('pt-BR')} CX`;
      }
    }
    return `${quantity.toLocaleString('pt-BR')} ${unit}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Inventário por Produto</CardTitle>
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
                  {formatQuantity(item.totalQuantity, item.unit, showUnitized)}
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
