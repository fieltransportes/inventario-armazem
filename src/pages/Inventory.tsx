
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Package, FileText, Hash, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getNFEData } from '../utils/storage';
import { NFEData, NFEProduct } from '../types/nfe';

interface SearchFilter {
  id: string;
  type: 'number' | 'chave';
  value: string;
}

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'number' | 'chave'>('number');
  
  // Get all NFE data
  const allNFEData = getNFEData();
  
  // Add search filter
  const handleAddFilter = () => {
    if (!currentSearchTerm.trim()) return;
    
    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      type: searchType,
      value: currentSearchTerm.trim()
    };
    
    setSearchFilters(prev => [...prev, newFilter]);
    setCurrentSearchTerm('');
  };
  
  // Remove search filter
  const handleRemoveFilter = (filterId: string) => {
    setSearchFilters(prev => prev.filter(filter => filter.id !== filterId));
  };
  
  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchFilters([]);
  };
  
  // Filter NFEs based on search filters
  const filteredNFEs = useMemo(() => {
    if (searchFilters.length === 0) return [];
    
    return allNFEData.filter(nfe => {
      return searchFilters.some(filter => {
        const term = filter.value.toLowerCase();
        if (filter.type === 'number') {
          return nfe.number.toLowerCase().includes(term);
        } else {
          return nfe.chNFe.toLowerCase().includes(term);
        }
      });
    });
  }, [allNFEData, searchFilters]);
  
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddFilter();
    }
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
              <span>Filtrar NFEs</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
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
              <div className="flex flex-1 space-x-2">
                <Input
                  type="text"
                  placeholder={searchType === 'number' ? 'Digite o número da NFE...' : 'Digite a chave de acesso...'}
                  value={currentSearchTerm}
                  onChange={(e) => setCurrentSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddFilter}
                  disabled={!currentSearchTerm.trim()}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar</span>
                </Button>
              </div>
            </div>
            
            {/* Active Filters */}
            {searchFilters.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">Filtros ativos:</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    Limpar todos
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchFilters.map((filter) => (
                    <Badge
                      key={filter.id}
                      variant="secondary"
                      className="flex items-center space-x-2 px-3 py-1"
                    >
                      <span className="text-xs font-medium">
                        {filter.type === 'number' ? 'NFE' : 'Chave'}:
                      </span>
                      <span className="max-w-[200px] truncate">{filter.value}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFilter(filter.id)}
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Results Summary */}
            {searchFilters.length > 0 && (
              <div className="text-sm text-gray-600">
                {filteredNFEs.length > 0 ? (
                  <>Encontradas {filteredNFEs.length} NFE(s) • {allProducts.length} produto(s)</>
                ) : (
                  <>Nenhuma NFE encontrada com os filtros aplicados</>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {searchFilters.length > 0 && filteredNFEs.length > 0 && (
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
        {searchFilters.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Iniciar Inventário</h3>
              <p className="text-gray-600 mb-4">
                Adicione números de NFE ou chaves de acesso para filtrar os produtos do armazém
              </p>
            </CardContent>
          </Card>
        )}

        {/* No Results State */}
        {searchFilters.length > 0 && filteredNFEs.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma NFE encontrada</h3>
              <p className="text-gray-600 mb-4">
                Verifique os filtros aplicados e tente novamente
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Inventory;
