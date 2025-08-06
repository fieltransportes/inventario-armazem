
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';

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
  const { products } = useProducts();
  
  const findProductByName = (productName: string) => {
    return products.find(p => p.name.toLowerCase() === productName.toLowerCase());
  };

  const formatQuantity = (quantity: number, unit: string, productName: string, showUnitized: boolean = false) => {
    if (showUnitized && unit === 'UN') {
      const product = findProductByName(productName);
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
                  {formatQuantity(item.totalQuantity, item.unit, item.name, showUnitized)}
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
