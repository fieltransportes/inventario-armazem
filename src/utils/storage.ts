
import { NFEData } from '../types/nfe';
import { 
  saveNFEToSupabase, 
  getNFEsFromSupabase, 
  checkNFEExistsInSupabase,
  deleteNFEFromSupabase 
} from './supabaseStorage';

const NFE_STORAGE_KEY = 'nfe-data';

// Função para migrar dados do localStorage para Supabase (se existirem)
export const migrateLocalStorageToSupabase = async (): Promise<void> => {
  try {
    const localData = localStorage.getItem(NFE_STORAGE_KEY);
    if (localData) {
      const nfes: NFEData[] = JSON.parse(localData);
      
      for (const nfe of nfes) {
        const exists = await checkNFEExistsInSupabase(nfe.chNFe);
        if (!exists) {
          await saveNFEToSupabase(nfe);
        }
      }
      
      // Limpar localStorage após migração
      localStorage.removeItem(NFE_STORAGE_KEY);
      console.log('Migração do localStorage para Supabase concluída');
    }
  } catch (error) {
    console.error('Erro na migração:', error);
  }
};

export const saveNFEData = async (nfeData: NFEData): Promise<void> => {
  try {
    await saveNFEToSupabase(nfeData);
    console.log('NFE salva no Supabase:', nfeData.number);
  } catch (error) {
    console.error('Erro ao salvar NFE:', error);
    throw error;
  }
};

export const getNFEData = async (): Promise<NFEData[]> => {
  try {
    return await getNFEsFromSupabase();
  } catch (error) {
    console.error('Erro ao buscar NFEs:', error);
    return [];
  }
};

export const checkNFEExists = async (chNFe: string): Promise<boolean> => {
  try {
    return await checkNFEExistsInSupabase(chNFe);
  } catch (error) {
    console.error('Erro ao verificar NFE existente:', error);
    return false;
  }
};

export const deleteNFEData = async (chNFe: string): Promise<void> => {
  try {
    await deleteNFEFromSupabase(chNFe);
    console.log('NFE deletada do Supabase:', chNFe);
  } catch (error) {
    console.error('Erro ao deletar NFE:', error);
    throw error;
  }
};

// Manter funções de inventário no localStorage por enquanto
export const saveInventory = (inventoryData: any): void => {
  const inventories = getInventories();
  inventories.push(inventoryData);
  localStorage.setItem('inventories', JSON.stringify(inventories));
};

export const getInventories = (): any[] => {
  const data = localStorage.getItem('inventories');
  return data ? JSON.parse(data) : [];
};
