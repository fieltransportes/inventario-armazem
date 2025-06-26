
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Package, FileText, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getNFEData } from '../utils/storage';
import { NFEData, NFEProduct } from '../types/nfe';

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'number' | 'chave'>('number');
  
  // Get all NFE data
  const allNFEData = getNFEData();
  
  // Filter NFEs based on search
  const filteredNFEs = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase().trim();
    
    return allNFEData.filter(nfe => {
      if (searchType === 'number') {
        return nfe.number.toLowerCase().includes(term);
      } else {
        return nfe.chNFe.toLowerCase().includes(term);
      }
    });
  }, [allNFEData, searchTerm, searchType]);
  
  // Get all products from filtered NFEs
  const allProducts = useMemo(() => {
    const products: (NFEProduct & { nfeNumber: string; nfeDate: string; seller: string })[] = [];
    
    filteredNFEs.forEach(nfe => {
      nfe.products.forEach(product => {
        products.push({
          ...product,
          nfeNumber: nfe.number,
          nfeDate: new Date(nfe.issueDate).toLocaleDateString('pt-BR'),
          seller: nfe.seller.name
        });
      });
    });
    
    return products;
  }, [filteredNFEs]);
  
  // Group products by name for inventory summary
  const inventorySummary = useMemo(() => {
    const summary = new Map<string, {
      name: string;
      totalQuantity: number;
      totalValue: number;
      unit: string;
      occurrences: number;
    }>();
    
    allProducts.forEach(product => {
      const key = product.name.toLowerCase();
      
      if (summary.has(key)) {
        const existing = summary.get(key)!;
        existing.totalQuantity += product.quantity;
        existing.totalValue += product.totalPrice;
        existing.occurrences += 1;
      } else {
        summary.set(key, {
          name: product.name,
          totalQuantity: product.quantity,
          totalValue: product.totalPrice,
          unit: product.unit,
          occurrences: 1
        });
      }
    });
    
    return Array.from(summary.values()).sort((a, b) => b.totalValue - a.totalValue);
  }, [allProducts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatQuantity = (quantity: number, unit: string) => {
    return `${quantity.toLocaleString('pt-BR')} ${unit}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Inventário de Produtos</h1>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Pesquisar NFEs</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex space-x-2">
                <Button
                  variant={searchType === 'number' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchType('number')}
                  className="flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Número NFE</span>
                </Button>
                <Button
                  variant={searchType === 'chave' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchType('chave')}
                  className="flex items-center space-x-2"
                >
                  <Hash className="h-4 w-4" />
                  <span>Chave de Acesso</span>
                </Button>
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={searchType === 'number' ? 'Digite o número da NFE...' : 'Digite a chave de acesso...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            {searchTerm && (
              <div className="text-sm text-gray-600">
                {filteredNFEs.length > 0 ? (
                  <>Encontradas {filteredNFEs.length} NFE(s) • {allProducts.length} produto(s)</>
                ) : (
                  <>Nenhuma NFE encontrada para "{searchTerm}"</>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {searchTerm && filteredNFEs.length > 0 && (
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList>
              <TabsTrigger value="summary">Resumo do Inventário</TabsTrigger>
              <TabsTrigger value="detailed">Lista Detalhada</TabsTrigger>
              <TabsTrigger value="nfes">NFEs Encontradas</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
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
                        <TableHead className="text-right">Valor Total</TableHead>
                        <TableHead className="text-center">Ocorrências</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventorySummary.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">
                            {formatQuantity(item.totalQuantity, item.unit)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.totalValue)}
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
            </TabsContent>

            <TabsContent value="detailed">
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
                        <TableHead className="text-right">Valor Unit.</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allProducts.map((product, index) => (
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
                          <TableCell className="text-right">
                            {formatCurrency(product.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(product.totalPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nfes">
              <div className="space-y-4">
                {filteredNFEs.map((nfe) => (
                  <Card key={nfe.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>NFE {nfe.number} - Série {nfe.series}</span>
                        <Badge variant="secondary">{nfe.products.length} produtos</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p><strong>Fornecedor:</strong> {nfe.seller.name}</p>
                          <p><strong>Data:</strong> {new Date(nfe.issueDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div>
                          <p><strong>Valor Total:</strong> {formatCurrency(nfe.totalValue)}</p>
                          <p><strong>Chave:</strong> {nfe.chNFe.substring(0, 8)}...{nfe.chNFe.substring(-8)}</p>
                        </div>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead className="text-right">Qtd</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {nfe.products.map((product, index) => (
                            <TableRow key={index}>
                              <TableCell>{product.name}</TableCell>
                              <TableCell className="text-right">
                                {formatQuantity(product.quantity, product.unit)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(product.totalPrice)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State */}
        {!searchTerm && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Iniciar Inventário</h3>
              <p className="text-gray-600 mb-4">
                Digite o número da NFE ou chave de acesso para filtrar os produtos do armazém
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Inventory;
