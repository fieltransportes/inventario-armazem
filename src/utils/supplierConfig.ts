
import { SupplierOrderConfig } from '../types/nfe';
import { 
  getSupplierConfigsFromSupabase,
  saveSupplierConfigToSupabase,
  deleteSupplierConfigFromSupabase,
  migrateSupplierConfigsToSupabase
} from './supabaseSupplierConfig';

const SUPPLIER_CONFIG_KEY = 'supplier-order-config';

// Configurações padrão para alguns fornecedores comuns
const DEFAULT_CONFIGS: SupplierOrderConfig[] = [
  {
    cnpj: '',
    supplierName: 'Padrão Geral',
    sourceTag: 'infCpl',
    extractionPattern: 'Ordem de Frete:\\s*(\\d+)',
    description: 'Extrai número após "Ordem de Frete:"'
  }
];

export const getSupplierConfigs = async (): Promise<SupplierOrderConfig[]> => {
  try {
    const configs = await getSupplierConfigsFromSupabase();
    if (configs.length > 0) {
      return [...DEFAULT_CONFIGS, ...configs];
    }
    
    // Fallback to localStorage and migrate if needed
    const stored = localStorage.getItem(SUPPLIER_CONFIG_KEY);
    if (stored) {
      await migrateSupplierConfigsToSupabase();
      return await getSupplierConfigsFromSupabase();
    }
    
    return DEFAULT_CONFIGS;
  } catch (error) {
    console.error('Error getting supplier configs:', error);
    
    // Fallback to localStorage
    const stored = localStorage.getItem(SUPPLIER_CONFIG_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (parseError) {
        console.error('Error parsing supplier configs:', parseError);
      }
    }
    return DEFAULT_CONFIGS;
  }
};

export const saveSupplierConfigs = (configs: SupplierOrderConfig[]): void => {
  localStorage.setItem(SUPPLIER_CONFIG_KEY, JSON.stringify(configs));
};

export const addSupplierConfig = async (config: SupplierOrderConfig): Promise<void> => {
  try {
    await saveSupplierConfigToSupabase(config);
  } catch (error) {
    console.error('Error saving to Supabase, falling back to localStorage:', error);
    
    // Fallback to localStorage
    const configs = await getSupplierConfigs();
    const existingIndex = configs.findIndex(c => 
      c.cnpj === config.cnpj && c.supplierName === config.supplierName
    );
    
    if (existingIndex >= 0) {
      configs[existingIndex] = config;
    } else {
      configs.push(config);
    }
    
    saveSupplierConfigs(configs);
  }
};

export const removeSupplierConfig = async (cnpj: string): Promise<void> => {
  try {
    await deleteSupplierConfigFromSupabase(cnpj);
  } catch (error) {
    console.error('Error deleting from Supabase, falling back to localStorage:', error);
    
    // Fallback to localStorage
    const configs = await getSupplierConfigs();
    const filteredConfigs = configs.filter(c => c.cnpj !== cnpj);
    saveSupplierConfigs(filteredConfigs);
  }
};

export const extractOrderNumber = async (xmlData: any, supplierCnpj: string): Promise<string | null> => {
  const configs = await getSupplierConfigs();
  
  // Procura configuração específica para o fornecedor
  let config = configs.find(c => c.cnpj === supplierCnpj);
  
  // Se não encontrou, usa a configuração padrão
  if (!config) {
    config = configs.find(c => c.cnpj === '' || c.supplierName === 'Padrão Geral');
  }
  
  if (!config) {
    return null;
  }
  
  try {
    // Busca o valor na tag especificada
    const tagValue = xmlData[config.sourceTag];
    if (!tagValue) {
      return null;
    }
    
    const regex = new RegExp(config.extractionPattern, 'i');
    const match = tagValue.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error applying extraction pattern:', error);
    return null;
  }
};
