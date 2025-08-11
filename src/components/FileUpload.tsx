import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { parseNFEXML } from '../utils/nfeParser';
import { saveNFEData, checkNFEExists } from '../utils/storage';
import { NFEData } from '../types/nfe';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onUploadSuccess: (nfeData: NFEData[]) => void;
}

interface FileStatus {
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error' | 'duplicate';
  nfeData?: NFEData;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processFile = async (fileStatus: FileStatus): Promise<FileStatus> => {
    try {
      const content = await fileStatus.file.text();
      console.log('Processing file:', fileStatus.file.name);
      
      const nfeData = await parseNFEXML(content, fileStatus.file.name);
      console.log('Parsed NFE data, chNFe:', nfeData.chNFe);
      
      // Check if NFE already exists in Supabase
      const isDuplicate = await checkNFEExists(nfeData.chNFe);
      console.log('Duplicate check result:', isDuplicate);
      
      if (isDuplicate) {
        return {
          ...fileStatus,
          status: 'duplicate',
          error: `NFE ${nfeData.number} (chNFe: ${nfeData.chNFe.substring(0, 8)}...) já foi importada anteriormente`
        };
      }
      
      await saveNFEData(nfeData);
      console.log('NFE saved successfully');
      
      return {
        ...fileStatus,
        status: 'success',
        nfeData
      };
    } catch (error) {
      console.error('Error processing file:', error);
      return {
        ...fileStatus,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to process the XML file.'
      };
    }
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const xmlFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.xml'));
    
    if (xmlFiles.length === 0) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos XML.",
        variant: "destructive",
      });
      return;
    }

    const initialStatuses: FileStatus[] = xmlFiles.map(file => ({
      file,
      status: 'pending'
    }));

    setFileStatuses(initialStatuses);
    setIsProcessing(true);

    try {
      // Process all files concurrently
      const processedStatuses = await Promise.all(
        initialStatuses.map(async (fileStatus, index) => {
          // Update status to processing
          setFileStatuses(prev => prev.map((fs, i) => 
            i === index ? { ...fs, status: 'processing' } : fs
          ));
          
          const result = await processFile(fileStatus);
          
          // Update with final result
          setFileStatuses(prev => prev.map((fs, i) => 
            i === index ? result : fs
          ));
          
          return result;
        })
      );

      const successfulUploads = processedStatuses
        .filter(fs => fs.status === 'success' && fs.nfeData)
        .map(fs => fs.nfeData!);

      const duplicateUploads = processedStatuses.filter(fs => fs.status === 'duplicate');
      const failedUploads = processedStatuses.filter(fs => fs.status === 'error');

      console.log('Upload results:', {
        successful: successfulUploads.length,
        duplicates: duplicateUploads.length,
        failed: failedUploads.length
      });

      if (successfulUploads.length > 0) {
        onUploadSuccess(successfulUploads);
      }

      // Show appropriate toast messages
      if (successfulUploads.length > 0 && duplicateUploads.length === 0 && failedUploads.length === 0) {
        toast({
          title: "Upload concluído",
          description: `${successfulUploads.length} NFE(s) importada(s) com sucesso.`,
        });
      } else if (successfulUploads.length > 0) {
        toast({
          title: "Upload parcialmente concluído",
          description: `${successfulUploads.length} NFE(s) importada(s)${duplicateUploads.length > 0 ? `, ${duplicateUploads.length} duplicada(s)` : ''}${failedUploads.length > 0 ? `, ${failedUploads.length} com falha` : ''}.`,
        });
      } else if (duplicateUploads.length > 0 && failedUploads.length === 0) {
        toast({
          title: "NFEs duplicadas detectadas",
          description: `${duplicateUploads.length} NFE(s) já foram importadas anteriormente.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Falha no upload",
          description: `Falha ao processar ${failedUploads.length} arquivo(s).`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Falha no upload",
        description: "Ocorreu um erro inesperado ao processar os arquivos.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onUploadSuccess, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const clearFiles = () => {
    setFileStatuses([]);
  };

  const getStatusIcon = (status: FileStatus['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'duplicate':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (fileStatus: FileStatus) => {
    switch (fileStatus.status) {
      case 'processing':
        return 'Processando...';
      case 'success':
        return `NFE ${fileStatus.nfeData?.number} importada`;
      case 'duplicate':
        return fileStatus.error || 'NFE duplicada detectada';
      case 'error':
        return fileStatus.error || 'Falha ao processar';
      default:
        return 'Aguardando...';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          {isProcessing ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              {isProcessing ? 'Processando XMLs NFE...' : 'Upload Múltiplos Arquivos XML NFE'}
            </h3>
            <p className="text-sm text-gray-500">
              Arraste e solte múltiplos arquivos XML aqui, ou clique para selecionar arquivos
            </p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FileText className="h-4 w-4" />
            <span>Suporta múltiplos arquivos XML</span>
          </div>

          <input
            type="file"
            accept=".xml"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />
          
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors duration-200"
          >
            Selecionar Múltiplos Arquivos
          </label>
        </div>
      </div>

      {/* File Status List */}
      {fileStatuses.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Progresso do Upload ({fileStatuses.length} arquivos)
            </h4>
            {!isProcessing && (
              <button
                onClick={clearFiles}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-200">
            {fileStatuses.map((fileStatus, index) => (
              <div key={index} className="px-4 py-3 flex items-center space-x-3">
                {getStatusIcon(fileStatus.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileStatus.file.name}
                  </p>
                  <p className={`text-xs ${
                    fileStatus.status === 'error' ? 'text-red-600' :
                    fileStatus.status === 'duplicate' ? 'text-yellow-600' :
                    fileStatus.status === 'success' ? 'text-green-600' :
                    'text-gray-500'
                  }`}>
                    {getStatusText(fileStatus)}
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  {(fileStatus.file.size / 1024).toFixed(1)} KB
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Armazenamento permanente</p>
            <p className="mt-1">
              As NFEs são armazenadas permanentemente no banco de dados e ficam disponíveis 
              mesmo após fechar o navegador. Apenas usuários autorizados podem deletar os dados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
