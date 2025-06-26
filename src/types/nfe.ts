
export interface NFEProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  ncm?: string;
  cfop?: string;
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
}
