
import { SupplierOrderConfig } from '../types/nfe';

const SUPPLIER_CONFIG_KEY = 'supplier-order-config';

// Configurações padrão para alguns fornecedores comuns
const DEFAULT_CONFIGS: SupplierOrderConfig[] = [
  {
    cnpj: '',
    supplierName: 'Padrão Geral',
    extractionPattern: 'Ordem de Frete:\\s*(\\d+)',
    description: 'Extrai número após "Ordem de Frete:"'
  }
];

export const getSupplierConfigs = (): SupplierOrderConfig[] => {
  const stored = localStorage.getItem(SUPPLIER_CONFIG_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing supplier configs:', error);
    }
  }
  return DEFAULT_CONFIGS;
};

export const saveSupplierConfigs = (configs: SupplierOrderConfig[]): void => {
  localStorage.setItem(SUPPLIER_CONFIG_KEY, JSON.stringify(configs));
};

export const addSupplierConfig = (config: SupplierOrderConfig): void => {
  const configs = getSupplierConfigs();
  const existingIndex = configs.findIndex(c => c.cnpj === config.cnpj);
  
  if (existingIndex >= 0) {
    configs[existingIndex] = config;
  } else {
    configs.push(config);
  }
  
  saveSupplierConfigs(configs);
};

export const removeSupplierConfig = (cnpj: string): void => {
  const configs = getSupplierConfigs();
  const filteredConfigs = configs.filter(c => c.cnpj !== cnpj);
  saveSupplierConfigs(filteredConfigs);
};

export const extractOrderNumber = (infCpl: string, supplierCnpj: string): string | null => {
  const configs = getSupplierConfigs();
  
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
    const regex = new RegExp(config.extractionPattern, 'i');
    const match = infCpl.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error applying extraction pattern:', error);
    return null;
  }
};
