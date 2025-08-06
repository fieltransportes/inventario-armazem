
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { NFEProduct } from '../../types/nfe';
import { useProducts } from '@/hooks/useProducts';

interface ProductWithNFE extends NFEProduct {
  nfeNumber: string;
  nfeDate: string;
  seller: string;
}

interface ProductListProps {
  products: ProductWithNFE[];
  showUnitized?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ products, showUnitized = false }) => {
  const { products: registeredProducts } = useProducts();
  
  const findProductByCode = (productCode: string) => {
    return registeredProducts.find(p => p.code === productCode);
  };

  const formatQuantity = (quantity: number, unit: string, product: ProductWithNFE, showUnitized: boolean = false) => {
    console.log('ProductList formatQuantity:', { quantity, unit, showUnitized, productCode: product.code });
    
    if (showUnitized) {
      const registeredProduct = findProductByCode(product.code || '');
      console.log('Found registered product:', registeredProduct);
      
      // Se o produto tem regras de unitização definidas
      if (registeredProduct?.unit_per_box && unit === 'UN') {
        const unitsPerBox = registeredProduct.unit_per_box;
        console.log('Units per box:', unitsPerBox);
        
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
      
      // Se já está em caixas mas tem regra de palete
      if (registeredProduct?.box_per_pallet && unit === 'CX') {
        const boxesPerPallet = registeredProduct.box_per_pallet;
        const pallets = Math.floor(quantity / boxesPerPallet);
        const remainingBoxes = quantity % boxesPerPallet;
        
        if (pallets > 0 && remainingBoxes > 0) {
          return `${pallets.toLocaleString('pt-BR')} PAL + ${remainingBoxes} CX`;
        } else if (pallets > 0) {
          return `${pallets.toLocaleString('pt-BR')} PAL`;
        } else {
          return `${remainingBoxes} CX`;
        }
      }
    }
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
                  {formatQuantity(product.quantity, product.unit, product, showUnitized)}
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
