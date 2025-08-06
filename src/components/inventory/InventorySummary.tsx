
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';

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
  const { products } = useProducts();
  
  const findProductByCode = (productCode: string) => {
    return products.find(p => p.code === productCode);
  };

  const formatQuantity = (quantity: number, unit: string, item: InventoryItem, showUnitized: boolean = false) => {
    if (showUnitized && unit === 'UN') {
      const product = findProductByCode(item.code || '');
      const unitsPerBox = product?.unit_per_box || 12; // fallback para 12 se não encontrado
      
      const boxes = Math.floor(quantity / unitsPerBox);
      const remainingUnits = quantity % unitsPerBox;
      
      if (boxes > 0 && remainingUnits > 0) {
        return `${boxes.toLocaleString('pt-BR')} CX + ${remainingUnits} UN`;
      } else if (boxes > 0) {
        return `${boxes.toLocaleString('pt-BR')} CX`;
      } else {
        return `${remainingUnits} UN`;
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
