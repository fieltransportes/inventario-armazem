
import React, { useState } from 'react';
import { NFEData } from '../types/nfe';
import { Eye, Trash2, Search, Calendar, Building, DollarSign, FileText, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface NFEListProps {
  nfeData: NFEData[];
  onRefresh: () => void;
  onViewDetails: (nfe: NFEData) => void;
  onDelete?: (nfe: NFEData) => Promise<void>;
  onBulkDelete?: (nfes: NFEData[]) => Promise<void>;
  onUpdatePedidoDT?: (nfe: NFEData, newPedidoDT: string) => Promise<void>;
}

const NFEList: React.FC<NFEListProps> = ({
  nfeData,
  onRefresh,
  onViewDetails,
  onDelete,
  onBulkDelete,
  onUpdatePedidoDT
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNFEs, setSelectedNFEs] = useState<string[]>([]);
  const [editingPedidoDT, setEditingPedidoDT] = useState<string | null>(null);
  const [newPedidoDT, setNewPedidoDT] = useState('');
  const { toast } = useToast();

  const filteredData = nfeData.filter(nfe =>
    nfe.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nfe.seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nfe.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (nfe.pedidoDT && nfe.pedidoDT.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNFEs(filteredData.map(nfe => nfe.id));
    } else {
      setSelectedNFEs([]);
    }
  };

  const handleSelectNFE = (nfeId: string, checked: boolean) => {
    if (checked) {
      setSelectedNFEs(prev => [...prev, nfeId]);
    } else {
      setSelectedNFEs(prev => prev.filter(id => id !== nfeId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNFEs.length === 0) return;
    
    if (window.confirm(`Tem certeza que deseja deletar ${selectedNFEs.length} NFE(s) selecionada(s)?`)) {
      try {
        const selectedNFEObjects = nfeData.filter(nfe => selectedNFEs.includes(nfe.id));
        if (onBulkDelete) {
          await onBulkDelete(selectedNFEObjects);
        } else if (onDelete) {
          // Fallback para deletar uma por uma
          for (const nfe of selectedNFEObjects) {
            await onDelete(nfe);
          }
        }
        setSelectedNFEs([]);
        onRefresh();
        toast({
          title: "Sucesso",
          description: `${selectedNFEs.length} NFE(s) deletada(s) com sucesso.`,
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao deletar NFEs selecionadas.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async (nfe: NFEData) => {
    if (window.confirm(`Tem certeza que deseja deletar a NFE ${nfe.number}?`)) {
      try {
        if (onDelete) {
          await onDelete(nfe);
          onRefresh();
          toast({
            title: "Sucesso",
            description: `NFE ${nfe.number} deletada com sucesso.`,
          });
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao deletar NFE.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdatePedidoDT = async (nfe: NFEData) => {
    try {
      if (onUpdatePedidoDT) {
        await onUpdatePedidoDT(nfe, newPedidoDT);
        setEditingPedidoDT(null);
        setNewPedidoDT('');
        onRefresh();
        toast({
          title: "Sucesso",
          description: `Pedido/DT da NFE ${nfe.number} atualizado.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar Pedido/DT.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (nfeData.length === 0) {
    return (
      <div className="text-center py-12">
        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma NFE importada</h3>
        <p className="text-gray-500">Faça upload do seu primeiro arquivo XML NFE para começar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número NFE, fornecedor, cliente ou Pedido/DT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredData.length} de {nfeData.length} NFEs
          </div>
        </div>

        {/* Ações em lote */}
        {selectedNFEs.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-900">
              {selectedNFEs.length} NFE(s) selecionada(s)
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar Selecionadas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedNFEs([])}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Layout em cards para evitar rolagem lateral */}
      <div className="grid gap-4">
        {filteredData.map((nfe) => (
          <div key={nfe.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="flex items-center pt-1">
                <Checkbox
                  checked={selectedNFEs.includes(nfe.id)}
                  onCheckedChange={(checked) => handleSelectNFE(nfe.id, checked as boolean)}
                />
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Coluna 1: Informações da NFE */}
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium text-gray-900">NFE {nfe.number}</div>
                    <div className="text-xs text-gray-500">Série: {nfe.series}</div>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(nfe.issueDate)}
                  </div>
                  <div className="flex items-center text-sm font-medium text-gray-900">
                    <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                    {formatCurrency(nfe.totalValue)}
                  </div>
                </div>

                {/* Coluna 2: Fornecedor e Cliente */}
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-500">Fornecedor</div>
                    <div className="text-sm text-gray-900 truncate">{nfe.seller.name}</div>
                    <div className="text-xs text-gray-500">{nfe.seller.cnpj}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Cliente</div>
                    <div className="text-sm text-gray-900 truncate">{nfe.buyer.name}</div>
                  </div>
                </div>

                {/* Coluna 3: Pedido/DT e Produtos */}
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-500">Pedido/DT</div>
                    {editingPedidoDT === nfe.id ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={newPedidoDT}
                          onChange={(e) => setNewPedidoDT(e.target.value)}
                          placeholder="Número do pedido"
                          className="h-8 text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdatePedidoDT(nfe);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleUpdatePedidoDT(nfe)}
                          className="h-8 px-2"
                        >
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingPedidoDT(null);
                            setNewPedidoDT('');
                          }}
                          className="h-8 px-2"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {nfe.pedidoDT ? (
                          <div className="flex items-center">
                            <FileText className="h-3 w-3 mr-1 text-blue-500" />
                            <span className="text-sm font-medium text-blue-900">
                              {nfe.pedidoDT}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                        {onUpdatePedidoDT && (
                          <button
                            onClick={() => {
                              setEditingPedidoDT(nfe.id);
                              setNewPedidoDT(nfe.pedidoDT || '');
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Editar Pedido/DT"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {nfe.products.length} itens
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onViewDetails(nfe)}
                  className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors"
                  title="Ver detalhes"
                >
                  <Eye className="h-4 w-4" />
                </button>
                {onDelete && (
                  <button
                    onClick={() => handleDelete(nfe)}
                    className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors"
                    title="Deletar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Seleção geral */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedNFEs.length === filteredData.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-gray-600">
              Selecionar todas as NFEs visíveis
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {selectedNFEs.length} de {filteredData.length} selecionadas
          </div>
        </div>
      )}
    </div>
  );
};

export default NFEList;
