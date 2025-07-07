import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Eye, Trash2, File, FileText, Image } from 'lucide-react';
import { useInventoryFiles } from '@/hooks/useInventoryFiles';

interface InventoryFilesManagerProps {
  inventoryId: string;
  inventoryNumber: string;
  inventoryStatus: string;
}

const InventoryFilesManager: React.FC<InventoryFilesManagerProps> = ({
  inventoryId,
  inventoryNumber,
  inventoryStatus
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    files,
    loading,
    uploading,
    uploadFile,
    deleteFile,
    getFileUrl
  } = useInventoryFiles(inventoryId);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      uploadFile(selectedFile);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleViewFile = (filePath: string) => {
    const url = getFileUrl(filePath);
    window.open(url, '_blank');
  };

  const handleDeleteFile = async (fileId: string, filePath: string, fileName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o arquivo "${fileName}"?`)) {
      await deleteFile(fileId, filePath);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-600" />;
    }
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-600" />;
    }
    return <File className="h-4 w-4 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return <div className="text-center py-4">Carregando arquivos...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Arquivos do Inventário #{inventoryNumber}</span>
          {inventoryStatus === 'completed' && (
            <div className="flex space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Enviando...' : 'Upload Arquivo'}
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {inventoryStatus === 'completed' 
              ? 'Nenhum arquivo anexado. Use o botão "Upload Arquivo" para adicionar documentos.'
              : 'Nenhum arquivo anexado. Finalize o inventário para poder anexar arquivos.'
            }
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.file_type)}
                  <div>
                    <p className="font-medium text-sm">{file.file_name}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span>{formatDate(file.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {file.file_type === 'application/pdf' ? 'PDF' : 
                     file.file_type.startsWith('image/') ? 'IMG' : 'FILE'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewFile(file.file_path)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFile(file.id, file.file_path, file.file_name)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {inventoryStatus === 'completed' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tipos de arquivo aceitos:</strong> PDF, JPG, PNG (máximo 10MB cada)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryFilesManager;