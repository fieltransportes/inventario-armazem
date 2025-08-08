
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
                  {formatQuantity(item.totalQuantity, item.unit, item, showUnitized)}
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
