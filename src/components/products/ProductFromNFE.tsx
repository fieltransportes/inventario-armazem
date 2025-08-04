import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Search } from 'lucide-react';
import { NFEData } from '@/types/nfe';
import { getNFEData } from '@/utils/storage';

interface ProductFromNFEProps {
  onCreateProduct: (nfeProduct: any) => Promise<void>;
}

const ProductFromNFE: React.FC<ProductFromNFEProps> = ({ onCreateProduct }) => {
  const [nfes, setNfes] = useState<NFEData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingNFEs, setLoadingNFEs] = useState(true);

  // Load NFEs from Supabase
  useEffect(() => {
    const loadNFEs = async () => {
      try {
        setLoadingNFEs(true);
        const nfeData = await getNFEData();
        setNfes(nfeData);
      } catch (error) {
        console.error('Erro ao carregar NFEs:', error);
      } finally {
        setLoadingNFEs(false);
      }
    };

    loadNFEs();
  }, []);
  
  // Get all unique products from NFEs
  const getAllProducts = () => {
    const products: any[] = [];
    nfes.forEach(nfe => {
      nfe.products.forEach(product => {
        // Only add if not already exists (by code)
        const exists = products.some(p => p.code === (product.code || product.id));
        if (!exists) {
          products.push({
            ...product,
            code: product.code || product.id,
            ean_box: product.ean_box,
            ean_unit: product.ean_unit,
            nfeNumber: nfe.number,
            sellerName: nfe.seller.name,
          });
        }
      });
    });
    return products;
  };

  const allProducts = getAllProducts();
  
  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProduct = async (product: any) => {
    setLoading(true);
    try {
      await onCreateProduct(product);
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Cadastrar Produtos a partir de NFEs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="search">Buscar produtos:</Label>
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por código, nome ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loadingNFEs ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando NFEs...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {nfes.length === 0 
                    ? 'Nenhuma NFE encontrada. Importe NFEs primeiro.' 
                    : searchTerm 
                      ? 'Nenhum produto encontrado com os critérios de busca.'
                      : 'Nenhum produto disponível para cadastro.'
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>NFE</TableHead>
                    <TableHead>EAN Caixa</TableHead>
                    <TableHead>EAN Unidade</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => (
                    <TableRow key={`${product.code}-${index}`}>
                      <TableCell className="font-mono">{product.code}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{product.sellerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.nfeNumber}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {product.ean_box || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {product.ean_unit || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleCreateProduct(product)}
                          disabled={loading}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Cadastrar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductFromNFE;