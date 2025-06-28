
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SavedInventory {
  id: string;
  inventory_number: string;
  created_at: string;
  search_filters: any;
  status: string; // Changed from 'open' | 'completed' to string to match database
  notes?: string;
  user_id: string;
  assigned_users: string[];
}

export interface InventoryItem {
  id: string;
  inventory_id: string;
  product_name: string;
  expected_quantity: number;
  counted_quantity?: number;
  unit: string;
  created_at: string;
  updated_at: string;
}

export const useInventory = () => {
  const [savedInventories, setSavedInventories] = useState<SavedInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateInventoryNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  };

  const saveInventory = async (searchFilters: any[], inventorySummary: any[], notes?: string) => {
    try {
      setLoading(true);
      const inventoryNumber = generateInventoryNumber();
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      // Salvar inventário
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventories')
        .insert({
          inventory_number: inventoryNumber,
          search_filters: searchFilters,
          notes,
          user_id: user.user.id
        })
        .select()
        .single();

      if (inventoryError) throw inventoryError;

      // Salvar itens do inventário
      const inventoryItems = inventorySummary.map(item => ({
        inventory_id: inventory.id,
        product_name: item.name,
        expected_quantity: item.totalQuantity,
        unit: item.unit
      }));

      const { error: itemsError } = await supabase
        .from('inventory_items')
        .insert(inventoryItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Inventário salvo com sucesso!",
        description: `Número do inventário: ${inventoryNumber}`,
      });

      await fetchSavedInventories();
      return inventory;
    } catch (error: any) {
      toast({
        title: "Erro ao salvar inventário",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedInventories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedInventories(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar inventários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryItems = async (inventoryId: string): Promise<InventoryItem[]> => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('inventory_id', inventoryId)
        .order('product_name');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: "Erro ao carregar itens do inventário",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const updateCountedQuantity = async (itemId: string, countedQuantity: number) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ 
          counted_quantity: countedQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Quantidade atualizada",
        description: "A quantidade contada foi salva com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar quantidade",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const completeInventory = async (inventoryId: string) => {
    try {
      const { error } = await supabase
        .from('inventories')
        .update({ status: 'completed' })
        .eq('id', inventoryId);

      if (error) throw error;

      toast({
        title: "Inventário finalizado",
        description: "O inventário foi marcado como concluído.",
      });

      await fetchSavedInventories();
    } catch (error: any) {
      toast({
        title: "Erro ao finalizar inventário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSavedInventories();
  }, []);

  return {
    savedInventories,
    loading,
    saveInventory,
    fetchSavedInventories,
    fetchInventoryItems,
    updateCountedQuantity,
    completeInventory
  };
};
