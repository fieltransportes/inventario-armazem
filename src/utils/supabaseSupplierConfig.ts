import { supabase } from '@/integrations/supabase/client';
import { SupplierOrderConfig } from '../types/nfe';

export const getSupplierConfigsFromSupabase = async (): Promise<SupplierOrderConfig[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('supplier_configs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching supplier configs:', error);
    throw new Error(`Error fetching supplier configs: ${error.message}`);
  }

  return data.map(item => ({
    cnpj: item.cnpj,
    supplierName: item.supplier_name,
    sourceTag: item.source_tag,
    extractionPattern: item.extraction_pattern,
    description: item.description || ''
  }));
};

export const saveSupplierConfigToSupabase = async (config: SupplierOrderConfig): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('supplier_configs')
    .upsert({
      user_id: user.id,
      cnpj: config.cnpj,
      supplier_name: config.supplierName,
      source_tag: config.sourceTag,
      extraction_pattern: config.extractionPattern,
      description: config.description
    });

  if (error) {
    console.error('Error saving supplier config:', error);
    throw new Error(`Error saving supplier config: ${error.message}`);
  }
};

export const deleteSupplierConfigFromSupabase = async (cnpj: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('supplier_configs')
    .delete()
    .eq('cnpj', cnpj)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting supplier config:', error);
    throw new Error(`Error deleting supplier config: ${error.message}`);
  }
};

export const migrateSupplierConfigsToSupabase = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const localData = localStorage.getItem('supplier-order-config');
    if (localData) {
      const configs: SupplierOrderConfig[] = JSON.parse(localData);
      
      for (const config of configs) {
        await saveSupplierConfigToSupabase(config);
      }
      
      // Clear localStorage after migration
      localStorage.removeItem('supplier-order-config');
      console.log('Supplier configs migration to Supabase completed');
    }
  } catch (error) {
    console.error('Error migrating supplier configs:', error);
  }
};