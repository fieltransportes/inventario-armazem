
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { NFEProduct } from '../../types/nfe';

interface ProductWithNFE extends NFEProduct {
  nfeNumber: string;
  nfeDate: string;
  seller: string;
}

interface ProductListProps {
  products: ProductWithNFE[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const formatQuantity = (quantity: number, unit: string) => {
    return `${quantity.toLocaleString('pt-BR')} ${unit}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista Detalhada de Produtos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>NFE</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{product.nfeNumber}</Badge>
                </TableCell>
                <TableCell>{product.nfeDate}</TableCell>
                <TableCell className="max-w-xs truncate">{product.seller}</TableCell>
                <TableCell className="text-right">
                  {formatQuantity(product.quantity, product.unit)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProductList;
