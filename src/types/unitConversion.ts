export interface UnitType {
  id: string;
  code: string; // Ex: CX, FD, BD, PLT, CP, UN
  name: string; // Ex: Caixa, Fardo, Balde, Palete, Copo, Unidade
  category: 'primary' | 'secondary' | 'pallet'; // Categoria da embalagem
}

export interface UnitConversion {
  id: string;
  product_code: string; // Código do produto
  from_unit: string; // Unidade de origem (ex: CP)
  to_unit: string; // Unidade de destino (ex: CX)
  conversion_factor: number; // Quantas unidades "from" fazem 1 "to" (ex: 12 CP = 1 CX)
  category: 'secondary' | 'pallet'; // Tipo de conversão
}

export interface ProductUnitConfig {
  product_code: string;
  base_unit: string; // Unidade base do produto na NFE
  conversions: UnitConversion[];
}

// Unidades padrão do sistema
export const DEFAULT_UNITS: UnitType[] = [
  { id: '1', code: 'UN', name: 'Unidade', category: 'primary' },
  { id: '2', code: 'CP', name: 'Copo', category: 'primary' },
  { id: '3', code: 'CX', name: 'Caixa', category: 'secondary' },
  { id: '4', code: 'FD', name: 'Fardo', category: 'secondary' },
  { id: '5', code: 'BD', name: 'Balde', category: 'secondary' },
  { id: '6', code: 'PLT', name: 'Palete', category: 'pallet' },
  { id: '7', code: 'PAL', name: 'Palete', category: 'pallet' },
];