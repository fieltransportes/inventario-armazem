
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SupplierOrderConfig } from '../types/nfe';
import { getSupplierConfigs, addSupplierConfig, removeSupplierConfig } from '../utils/supplierConfig';

const SupplierConfig: React.FC = () => {
  const [configs, setConfigs] = useState<SupplierOrderConfig[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SupplierOrderConfig | null>(null);
  const [formData, setFormData] = useState({
    cnpj: '',
    supplierName: '',
    extractionPattern: '',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = () => {
    const loadedConfigs = getSupplierConfigs();
    setConfigs(loadedConfigs);
  };

  const handleSave = () => {
    if (!formData.supplierName || !formData.extractionPattern) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome do fornecedor e padrão de extração são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Testa se o regex é válido
      new RegExp(formData.extractionPattern);
      
      const config: SupplierOrderConfig = {
        cnpj: formData.cnpj.trim(),
        supplierName: formData.supplierName.trim(),
        extractionPattern: formData.extractionPattern.trim(),
        description: formData.description.trim()
      };

      addSupplierConfig(config);
      loadConfigs();
      setIsDialogOpen(false);
      resetForm();

      toast({
        title: "Configuração salva",
        description: `Configuração para ${config.supplierName} foi salva com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Padrão inválido",
        description: "O padrão de extração deve ser uma expressão regular válida.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (config: SupplierOrderConfig) => {
    setEditingConfig(config);
    setFormData({
      cnpj: config.cnpj,
      supplierName: config.supplierName,
      extractionPattern: config.extractionPattern,
      description: config.description
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (cnpj: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta configuração?')) {
      removeSupplierConfig(cnpj);
      loadConfigs();
      toast({
        title: "Configuração removida",
        description: "A configuração foi removida com sucesso.",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      cnpj: '',
      supplierName: '',
      extractionPattern: '',
      description: ''
    });
    setEditingConfig(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Configuração de Extração de Pedido/DT</span>
        </CardTitle>
        <CardDescription>
          Configure como extrair o número do pedido/DT da tag infCpl para cada fornecedor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {configs.length} configuração(ões) cadastrada(s)
          </p>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Nova Configuração</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingConfig ? 'Editar Configuração' : 'Nova Configuração'}
                </DialogTitle>
                <DialogDescription>
                  Configure como extrair o número do pedido/DT para um fornecedor específico
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="supplierName">Nome do Fornecedor *</Label>
                  <Input
                    id="supplierName"
                    value={formData.supplierName}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
                    placeholder="Ex: Fornecedor ABC Ltda"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cnpj">CNPJ (opcional)</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                    placeholder="Ex: 12.345.678/0001-90"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe em branco para usar como configuração padrão
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="extractionPattern">Padrão de Extração *</Label>
                  <Input
                    id="extractionPattern"
                    value={formData.extractionPattern}
                    onChange={(e) => setFormData(prev => ({ ...prev, extractionPattern: e.target.value }))}
                    placeholder="Ex: Ordem de Frete:\s*(\d+)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use expressão regular. O número deve estar no primeiro grupo de captura ()
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva como funciona este padrão"
                    rows={2}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingConfig ? 'Atualizar' : 'Salvar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {configs.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Padrão</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{config.supplierName}</TableCell>
                  <TableCell>
                    {config.cnpj ? (
                      config.cnpj
                    ) : (
                      <Badge variant="secondary">Padrão</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm max-w-40 truncate">
                    {config.extractionPattern}
                  </TableCell>
                  <TableCell className="max-w-60 truncate">
                    {config.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(config)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(config.cnpj)}
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

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Exemplos de Padrões:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><code>Ordem de Frete:\s*(\d+)</code> - Extrai número após "Ordem de Frete:"</li>
            <li><code>Pedido:\s*(\d+)</code> - Extrai número após "Pedido:"</li>
            <li><code>DT\s*(\d+)</code> - Extrai número após "DT"</li>
            <li><code>(\d+)</code> - Extrai qualquer sequência de números</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierConfig;
