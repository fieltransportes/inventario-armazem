import { useMemo } from 'react';
import { NFEData } from '../types/nfe';

export const useInventoryProcessing = (filteredNFEs: NFEData[]) => {
  // Get all products from filtered NFEs
  const allProducts = useMemo(() => {
    const products: any[] = [];
    
    filteredNFEs.forEach(nfe => {
      nfe.products.forEach(product => {
        products.push({
          ...product,
          nfeNumber: nfe.number,
          nfeDate: new Date(nfe.issueDate).toLocaleDateString('pt-BR'),
          seller: nfe.seller.name
        });
      });
    });
    
    return products;
  }, [filteredNFEs]);

  // Group products by name for inventory summary
  const inventorySummary = useMemo(() => {
    const summary = new Map<string, {
      name: string;
      code?: string;
      totalQuantity: number;
      totalValue: number;
      unit: string;
      occurrences: number;
    }>();
    
    allProducts.forEach(product => {
      const key = product.name.toLowerCase();
      
      if (summary.has(key)) {
        const existing = summary.get(key)!;
        existing.totalQuantity += product.quantity;
        existing.totalValue += product.totalPrice;
        existing.occurrences += 1;
      } else {
        summary.set(key, {
          name: product.name,
          code: product.code,
          totalQuantity: product.quantity,
          totalValue: product.totalPrice,
          unit: product.unit,
          occurrences: 1
        });
      }
    });
    
    return Array.from(summary.values()).sort((a, b) => b.totalValue - a.totalValue);
  }, [allProducts]);

  return {
    allProducts,
    inventorySummary
  };
};