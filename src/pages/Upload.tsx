
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload as UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NFEData } from '@/types/nfe';
import { useToast } from '@/hooks/use-toast';
import { getNFEData, migrateLocalStorageToSupabase, deleteNFEData } from '@/utils/storage';
import Navbar from '@/components/Navbar';
import FileUpload from '@/components/FileUpload';
import NFEList from '@/components/NFEList';
import NFEDetails from '@/components/NFEDetails';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadedNFEs, setUploadedNFEs] = useState<NFEData[]>([]);
  const [allNFEs, setAllNFEs] = useState<NFEData[]>([]);
  const [selectedNFE, setSelectedNFE] = useState<NFEData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadNFEData = async () => {
    try {
      setLoading(true);
      
      // Fazer migração do localStorage para Supabase se necessário
      await migrateLocalStorageToSupabase();
      
      // Buscar NFEs do Supabase
      const nfeData = await getNFEData();
      setAllNFEs(nfeData);
    } catch (error) {
      console.error('Erro ao carregar NFEs:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao carregar as NFEs. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNFEData();
  }, []);

  const handleUploadSuccess = (nfeData: NFEData[]) => {
    setUploadedNFEs(prev => [...prev, ...nfeData]);
    loadNFEData(); // Reload all NFE data to show the newly uploaded ones
    toast({
      title: "Upload concluído",
      description: `${nfeData.length} NFE(s) importada(s) com sucesso.`,
    });
  };

  const handleViewDetails = (nfe: NFEData) => {
    setSelectedNFE(nfe);
  };

  const handleCloseDetails = () => {
    setSelectedNFE(null);
  };

  const handleDeleteNFE = async (nfe: NFEData) => {
    try {
      await deleteNFEData(nfe.chNFe);
      await loadNFEData(); // Reload data after deletion
      toast({
        title: "NFE deletada",
        description: `NFE ${nfe.number} foi removida com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao deletar NFE:', error);
      toast({
        title: "Erro ao deletar",
        description: "Ocorreu um erro ao deletar a NFE. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
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
              <UploadIcon className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Upload de NFEs</h1>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Importar Arquivos XML</h2>
            <p className="text-gray-600 mb-6">
              Faça upload dos arquivos XML das suas notas fiscais eletrônicas para importá-las ao sistema.
              Os dados são armazenados permanentemente no banco de dados.
            </p>
            
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Lista de NFEs Importadas */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">NFEs Importadas</h2>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Carregando NFEs...</span>
              </div>
            ) : (
              <NFEList 
                nfeData={allNFEs} 
                onRefresh={loadNFEData}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteNFE}
              />
            )}
          </div>

          {uploadedNFEs.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">NFEs Importadas Nesta Sessão</h3>
              <div className="space-y-2">
                {uploadedNFEs.map((nfe, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">NFE {nfe.number}</p>
                      <p className="text-sm text-green-600">{nfe.seller.name}</p>
                    </div>
                    <div className="text-sm text-green-600">
                      {nfe.products.length} produto(s)
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button 
                  onClick={() => navigate('/inventory')}
                  className="w-full"
                >
                  Ir Para Inventário
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalhes da NFE */}
      {selectedNFE && (
        <NFEDetails 
          nfe={selectedNFE}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default Upload;
