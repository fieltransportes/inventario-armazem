
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';
import InventoryDetailsDialog from './InventoryDetailsDialog';
import EditInventoryDialog from './EditInventoryDialog';

const SavedInventoriesList: React.FC = () => {
  const { savedInventories, loading, fetchSavedInventories, deleteInventory } = useInventory();
  const { isAdmin } = useAuth();
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const [editingInventory, setEditingInventory] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
    }
    return <Badge className="bg-orange-100 text-orange-800"><Clock className="h-3 w-3 mr-1" />Em Andamento</Badge>;
  };

  const handleDeleteInventory = async (inventoryId: string, inventoryNumber: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o inventário #${inventoryNumber}? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteInventory(inventoryId);
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando inventários salvos...</div>;
  }

  if (savedInventories.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum inventário salvo</h3>
          <p className="text-gray-500">
            Salve um inventário para que o time do armazém possa inserir as quantidades contadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {savedInventories.map((inventory) => (
          <Card key={inventory.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold">#{inventory.inventory_number}</span>
                  {getStatusBadge(inventory.status)}
                </div>
                <div className="flex space-x-2">
                  {isAdmin && inventory.status === 'open' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingInventory(inventory)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteInventory(inventory.id, inventory.inventory_number)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedInventoryId(inventory.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Criado em:</strong> {formatDate(inventory.created_at)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Filtros aplicados:</strong> {inventory.search_filters?.length || 0}
                  </p>
                </div>
                <div>
                  {inventory.notes && (
                    <p className="text-sm text-gray-600">
                      <strong>Observações:</strong> {inventory.notes}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedInventoryId && (
        <InventoryDetailsDialog
          inventoryId={selectedInventoryId}
          open={!!selectedInventoryId}
          onOpenChange={(open) => !open && setSelectedInventoryId(null)}
          refreshTrigger={refreshTrigger}
        />
      )}

      {editingInventory && (
        <EditInventoryDialog
          inventory={editingInventory}
          open={!!editingInventory}
          onOpenChange={(open) => !open && setEditingInventory(null)}
          onInventoryUpdated={() => {
            fetchSavedInventories();
            setEditingInventory(null);
            setRefreshTrigger(prev => prev + 1); // Trigger refresh of details dialog
          }}
        />
      )}
    </>
  );
};

export default SavedInventoriesList;
