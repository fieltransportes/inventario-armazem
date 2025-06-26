import React, { useState, useEffect } from 'react';
import { Package, Upload, FileText, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUpload from '../components/FileUpload';
import NFEList from '../components/NFEList';
import { getNFEData, clearAllNFEData } from '../utils/storage';
import { NFEData } from '../types/nfe';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const [nfeData, setNfeData] = useState<NFEData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedData = getNFEData();
    setNfeData(storedData);
  }, []);

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      clearAllNFEData();
      setNfeData([]);
      toast({
        title: "Dados limpos",
        description: "Todos os dados NFE foram removidos com sucesso.",
      });
    }
  };

  const handleUploadSuccess = (newNfeData: NFEData[]) => {
    setNfeData(prev => [...prev, ...newNfeData]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema NFE</h1>
              <p className="text-gray-600">Importação e gestão de Notas Fiscais Eletrônicas</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => navigate('/inventory')}
              className="flex items-center space-x-2"
            >
              <Package className="h-4 w-4" />
              <span>Inventário</span>
            </Button>
            
            {nfeData.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Limpar Tudo</span>
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de NFEs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nfeData.length}</div>
              <p className="text-xs text-muted-foreground">
                Notas fiscais importadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nfeData.reduce((total, nfe) => total + nfe.products.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Itens no inventário
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <span className="text-lg">R$</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(nfeData.reduce((total, nfe) => total + nfe.totalValue, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor das notas importadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload XML</span>
            </TabsTrigger>
            <TabsTrigger value="nfes" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>NFEs Importadas ({nfeData.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Import NFE XML Files</CardTitle>
                <CardDescription>
                  Faça upload de múltiplos arquivos XML de Notas Fiscais Eletrônicas para importação automática
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onUploadSuccess={handleUploadSuccess} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nfes">
            {nfeData.length > 0 ? (
              <NFEList 
                nfeData={nfeData} 
                onDelete={(id) => setNfeData(prev => prev.filter(nfe => nfe.id !== id))} 
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma NFE importada</h3>
                  <p className="text-gray-600 mb-4">
                    Faça upload de arquivos XML para começar a gerenciar suas notas fiscais
                  </p>
                  <Button onClick={() => document.querySelector('[data-state="active"]')?.click()}>
                    Fazer Upload
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
