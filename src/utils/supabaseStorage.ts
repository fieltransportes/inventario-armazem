
import { supabase } from '@/integrations/supabase/client';
import { NFEData, NFESeller, NFEBuyer, NFEProduct } from '@/types/nfe';

export const saveNFEToSupabase = async (nfeData: NFEData): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('nfe_data')
    .insert({
      ch_nfe: nfeData.chNFe,
      number: nfeData.number,
      series: nfeData.series,
      issue_date: nfeData.issueDate,
      seller: nfeData.seller as unknown as Json,
      buyer: nfeData.buyer as unknown as Json,
      products: nfeData.products as unknown as Json,
      total_value: nfeData.totalValue,
      pedido_dt: nfeData.pedidoDT || null,
      user_id: user.id
    });

  if (error) {
    console.error('Erro ao salvar NFE:', error);
    throw new Error(`Erro ao salvar NFE: ${error.message}`);
  }
};

export const getNFEsFromSupabase = async (): Promise<NFEData[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('nfe_data')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar NFEs:', error);
    throw new Error(`Erro ao buscar NFEs: ${error.message}`);
  }

  return data.map(item => ({
    id: item.id,
    chNFe: item.ch_nfe,
    number: item.number,
    series: item.series,
    issueDate: item.issue_date,
    seller: item.seller as unknown as NFESeller,
    buyer: item.buyer as unknown as NFEBuyer,
    products: item.products as unknown as NFEProduct[],
    totalValue: item.total_value || 0,
    taxes: {
      icms: 0,
      ipi: 0,
      pis: 0,
      cofins: 0
    },
    status: 'imported' as const,
    importedAt: item.created_at,
    fileName: `${item.number}.xml`,
    pedidoDT: item.pedido_dt || undefined
  }));
};

export const checkNFEExistsInSupabase = async (chNFe: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from('nfe_data')
    .select('id')
    .eq('ch_nfe', chNFe)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao verificar NFE existente:', error);
    return false;
  }

  return !!data;
};

export const deleteNFEFromSupabase = async (chNFe: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('nfe_data')
    .delete()
    .eq('ch_nfe', chNFe)
    .eq('user_id', user.id);

  if (error) {
    console.error('Erro ao deletar NFE:', error);
    throw new Error(`Erro ao deletar NFE: ${error.message}`);
  }
};
