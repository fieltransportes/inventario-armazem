
export interface NFEProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  ncm?: string;
  cfop?: string;
  code?: string; // cProd
  ean_box?: string; // cEAN
  ean_unit?: string; // cEANTrib
}

export interface NFESeller {
  cnpj: string;
  name: string;
  fantasyName?: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  email?: string;
  phone?: string;
}

export interface NFEBuyer {
  cnpj?: string;
  cpf?: string;
  name: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface NFEData {
  id: string;
  chNFe: string; // Chave de acesso da NFE
  number: string;
  series: string;
  issueDate: string;
  seller: NFESeller;
  buyer: NFEBuyer;
  products: NFEProduct[];
  totalValue: number;
  taxes: {
    icms: number;
    ipi: number;
    pis: number;
    cofins: number;
  };
  status: 'imported' | 'processed' | 'error';
  importedAt: string;
  fileName: string;
  pedidoDT?: string; // Número do pedido extraído de infCpl
}

// Configurações para extração de pedido por fornecedor
export interface SupplierOrderConfig {
  cnpj: string;
  supplierName: string;
  sourceTag: string; // TAG XML onde buscar o pedido (ex: infCpl, xPed, etc)
  extractionPattern: string; // Padrão regex ou texto para extrair o pedido
  description: string; // Descrição do padrão para o usuário
}
