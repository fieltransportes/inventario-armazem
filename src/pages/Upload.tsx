
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload as UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NFEData } from '@/types/nfe';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import FileUpload from '@/components/FileUpload';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadedNFEs, setUploadedNFEs] = useState<NFEData[]>([]);

  const handleUploadSuccess = (nfeData: NFEData[]) => {
    setUploadedNFEs(prev => [...prev, ...nfeData]);
    toast({
      title: "Upload concluído",
      description: `${nfeData.length} NFE(s) importada(s) com sucesso.`,
    });
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
            </p>
            
            <FileUpload onUploadSuccess={handleUploadSuccess} />
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
    </div>
  );
};

export default Upload;
