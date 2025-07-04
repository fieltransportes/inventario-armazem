import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Search } from 'lucide-react';
import { useInventory, SavedInventory } from '../../hooks/useInventory';
import { getNFEData } from '../../utils/storage';
import { supabase } from '@/integrations/supabase/client';
import { NFEData } from '../../types/nfe';
import { useToast } from '@/hooks/use-toast';

interface EditInventoryDialogProps {
  inventory: SavedInventory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInventoryUpdated: () => void;
}

interface SearchFilter {
  id: string;
  type: 'number' | 'chave';
  value: string;
}

const EditInventoryDialog: React.FC<EditInventoryDialogProps> = ({
  inventory,
  open,
  onOpenChange,
  onInventoryUpdated
}) => {
  const [allNFEData, setAllNFEData] = useState<NFEData[]>([]);
  const [currentNFEs, setCurrentNFEs] = useState<NFEData[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'number' | 'chave'>('number');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load NFE data and current inventory NFEs
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all NFE data
      const nfeData = await getNFEData();
      setAllNFEData(nfeData);
      
      // Filter current NFEs based on inventory search filters
      const inventoryFilters = inventory.search_filters || [];
      const filteredNFEs = nfeData.filter(nfe => {
        return inventoryFilters.some((filter: any) => {
          const term = filter.value.toLowerCase();
          if (filter.type === 'number') {
            return nfe.number.toLowerCase().includes(term);
          } else {
            return nfe.chNFe.toLowerCase().includes(term);
          }
        });
      });
      setCurrentNFEs(filteredNFEs);
    } catch (error) {
      console.error('Error loading NFE data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados das NFEs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add search filter for new NFEs
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

  // Get NFEs from search filters (to add to inventory)
  const searchResultNFEs = useMemo(() => {
    if (searchFilters.length === 0) return [];
    
    return allNFEData.filter(nfe => {
      // Don't include NFEs already in inventory
      const isAlreadyInInventory = currentNFEs.some(currentNfe => currentNfe.chNFe === nfe.chNFe);
      if (isAlreadyInInventory) return false;
      
      return searchFilters.some(filter => {
        const term = filter.value.toLowerCase();
        if (filter.type === 'number') {
          return nfe.number.toLowerCase().includes(term);
        } else {
          return nfe.chNFe.toLowerCase().includes(term);
        }
      });
    });
  }, [allNFEData, searchFilters, currentNFEs]);

  // Add NFE to inventory
  const handleAddNFE = (nfe: NFEData) => {
    setCurrentNFEs(prev => [...prev, nfe]);
    toast({
      title: "NFE adicionada",
      description: `NFE ${nfe.number} foi adicionada ao inventário.`,
    });
  };

  // Remove NFE from inventory
  const handleRemoveNFE = (nfeChave: string) => {
    const nfe = currentNFEs.find(n => n.chNFe === nfeChave);
    setCurrentNFEs(prev => prev.filter(n => n.chNFe !== nfeChave));
    toast({
      title: "NFE removida",
      description: `NFE ${nfe?.number} foi removida do inventário.`,
    });
  };

  // Save changes to inventory
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // Create new search filters based on current NFEs
      const newSearchFilters = currentNFEs.map(nfe => ({
        id: Date.now().toString() + Math.random().toString(),
        type: 'chave' as const,
        value: nfe.chNFe
      }));

      // Update inventory with new search filters
      const { error } = await supabase
        .from('inventories')
        .update({ 
          search_filters: newSearchFilters
        })
        .eq('id', inventory.id);

      if (error) throw error;

      // Regenerate inventory items
      await regenerateInventoryItems();

      toast({
        title: "Inventário atualizado",
        description: "As alterações foram salvas com sucesso.",
      });

      onInventoryUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating inventory:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateInventoryItems = async () => {
    console.log('Regenerating inventory items for inventory:', inventory.id);
    console.log('Current NFEs count:', currentNFEs.length);
    
    // Delete existing items
    const { error: deleteError } = await supabase
      .from('inventory_items')
      .delete()
      .eq('inventory_id', inventory.id);

    if (deleteError) {
      console.error('Error deleting existing items:', deleteError);
      throw deleteError;
    }

    // Generate new inventory summary
    const allProducts: any[] = [];
    
    currentNFEs.forEach(nfe => {
      nfe.products.forEach(product => {
        allProducts.push({
          ...product,
          nfeNumber: nfe.number,
          nfeDate: new Date(nfe.issueDate).toLocaleDateString('pt-BR'),
          seller: nfe.seller.name
        });
      });
    });

    console.log('Total products from NFEs:', allProducts.length);

    // Group products by name
    const summary = new Map<string, {
      name: string;
      totalQuantity: number;
      unit: string;
    }>();
    
    allProducts.forEach(product => {
      const key = product.name.toLowerCase();
      
      if (summary.has(key)) {
        const existing = summary.get(key)!;
        existing.totalQuantity += product.quantity;
      } else {
        summary.set(key, {
          name: product.name,
          totalQuantity: product.quantity,
          unit: product.unit
        });
      }
    });

    console.log('Grouped products summary:', summary.size);

    // Insert new items
    const inventoryItems = Array.from(summary.values()).map(item => ({
      inventory_id: inventory.id,
      product_name: item.name,
      expected_quantity: item.totalQuantity,
      unit: item.unit
    }));

    console.log('Items to insert:', inventoryItems.length);

    if (inventoryItems.length > 0) {
      const { error: insertError } = await supabase
        .from('inventory_items')
        .insert(inventoryItems);
      
      if (insertError) {
        console.error('Error inserting new items:', insertError);
        throw insertError;
      }
      
      console.log('Successfully inserted new inventory items');
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl">
          <div className="text-center py-8">Carregando...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Inventário #{inventory.inventory_number}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="current" className="space-y-4">
          <TabsList>
            <TabsTrigger value="current">NFEs Atuais ({currentNFEs.length})</TabsTrigger>
            <TabsTrigger value="add">Adicionar NFEs</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">NFEs no Inventário</h3>
              
              {currentNFEs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Série</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentNFEs.map((nfe) => (
                      <TableRow key={nfe.chNFe}>
                        <TableCell className="font-medium">{nfe.number}</TableCell>
                        <TableCell>{nfe.series}</TableCell>
                        <TableCell>{nfe.seller.name}</TableCell>
                        <TableCell>{new Date(nfe.issueDate).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>R$ {nfe.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveNFE(nfe.chNFe)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma NFE no inventário.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Buscar NFEs para Adicionar</h3>
              
              {/* Search interface */}
              <div className="flex space-x-2">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as 'number' | 'chave')}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="number">Número</option>
                  <option value="chave">Chave</option>
                </select>
                <Input
                  placeholder={`Buscar por ${searchType === 'number' ? 'número' : 'chave'} da NFE...`}
                  value={currentSearchTerm}
                  onChange={(e) => setCurrentSearchTerm(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFilter()}
                />
                <Button onClick={handleAddFilter} disabled={!currentSearchTerm.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>

              {/* Active filters */}
              {searchFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {searchFilters.map((filter) => (
                    <Badge key={filter.id} variant="secondary" className="flex items-center space-x-2">
                      <span>{filter.type === 'number' ? 'Nº' : 'Chave'}: {filter.value}</span>
                      <button onClick={() => handleRemoveFilter(filter.id)} className="ml-2 text-red-500">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Search results */}
              {searchResultNFEs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">NFEs Encontradas ({searchResultNFEs.length})</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Série</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResultNFEs.map((nfe) => (
                        <TableRow key={nfe.chNFe}>
                          <TableCell className="font-medium">{nfe.number}</TableCell>
                          <TableCell>{nfe.series}</TableCell>
                          <TableCell>{nfe.seller.name}</TableCell>
                          <TableCell>{new Date(nfe.issueDate).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>R$ {nfe.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddNFE(nfe)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Adicionar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {searchFilters.length > 0 && searchResultNFEs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma NFE encontrada que não esteja já no inventário.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveChanges} disabled={loading}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditInventoryDialog;