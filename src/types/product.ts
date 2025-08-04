export interface ProductData {
  id: string;
  user_id: string;
  code: string; // cProd from NFE
  ean_box?: string; // cEAN from NFE (código de barras CX/FD)
  ean_unit?: string; // cEANTrib from NFE (código de barras UN)
  name: string; // xProd from NFE
  unit_per_box?: number; // quantas unidades em uma caixa
  box_per_pallet?: number; // quantas caixas em um palete
  base_unit: string; // unidade base (UN, CX, PAL)
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  code: string;
  ean_box?: string;
  ean_unit?: string;
  name: string;
  unit_per_box?: number;
  box_per_pallet?: number;
  base_unit: string;
  description?: string;
}

export interface NFEProductExtended {
  code: string; // cProd
  ean_box?: string; // cEAN
  ean_unit?: string; // cEANTrib
  name: string; // xProd
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  ncm?: string;
  cfop?: string;
}