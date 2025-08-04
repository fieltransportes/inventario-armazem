import React, { useState } from 'react';
import { ProductData } from '@/types/product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Search } from 'lucide-react';

interface ProductListProps {
  products: ProductData[];
  onEdit: (product: ProductData) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatUnitization = (product: ProductData) => {
    const parts = [];
    if (product.unit_per_box) {
      parts.push(`${product.unit_per_box} UN = 1 CX`);
    }
    if (product.box_per_pallet) {
      parts.push(`${product.box_per_pallet} CX = 1 PAL`);
    }
    return parts.length > 0 ? parts.join(' | ') : '-';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando produtos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Produtos Cadastrados ({products.length})</span>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {searchTerm ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Unidade Base</TableHead>
                <TableHead>Unitização</TableHead>
                <TableHead>EAN Caixa</TableHead>
                <TableHead>EAN Unidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono">{product.code}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.base_unit}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatUnitization(product)}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {product.ean_box || '-'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {product.ean_unit || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductList;