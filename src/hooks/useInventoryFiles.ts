import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryFile {
  id: string;
  inventory_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

export const useInventoryFiles = (inventoryId: string | null) => {
  const [files, setFiles] = useState<InventoryFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchFiles = async () => {
    if (!inventoryId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_files')
        .select('*')
        .eq('inventory_id', inventoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar arquivos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (!inventoryId) return;

    try {
      setUploading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não permitido. Use PDF, JPG ou PNG.');
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo 10MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.user.id}/${inventoryId}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('inventory-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save file info to database
      const { error: dbError } = await supabase
        .from('inventory_files')
        .insert({
          inventory_id: inventoryId,
          file_name: file.name,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user.user.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Arquivo enviado com sucesso",
        description: `${file.name} foi adicionado ao inventário.`,
      });

      await fetchFiles();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar arquivo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('inventory-files')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('inventory_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      toast({
        title: "Arquivo excluído",
        description: "O arquivo foi removido com sucesso.",
      });

      await fetchFiles();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir arquivo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('inventory-files')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  useEffect(() => {
    if (inventoryId) {
      fetchFiles();
    }
  }, [inventoryId]);

  return {
    files,
    loading,
    uploading,
    uploadFile,
    deleteFile,
    getFileUrl,
    fetchFiles
  };
};