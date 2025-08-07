import { useState, useEffect } from 'react';
import { UnitType, UnitConversion, ProductUnitConfig, DEFAULT_UNITS } from '../types/unitConversion';

export const useUnitConversion = () => {
  const [units, setUnits] = useState<UnitType[]>(DEFAULT_UNITS);
  const [productConfigs, setProductConfigs] = useState<ProductUnitConfig[]>([]);

  // Carregar do localStorage
  useEffect(() => {
    const savedUnits = localStorage.getItem('customUnits');
    const savedConfigs = localStorage.getItem('productUnitConfigs');

    if (savedUnits) {
      const customUnits = JSON.parse(savedUnits);
      setUnits([...DEFAULT_UNITS, ...customUnits]);
    }

    if (savedConfigs) {
      setProductConfigs(JSON.parse(savedConfigs));
    }
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    const customUnits = units.filter(unit => !DEFAULT_UNITS.find(def => def.id === unit.id));
    localStorage.setItem('customUnits', JSON.stringify(customUnits));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('productUnitConfigs', JSON.stringify(productConfigs));
  }, [productConfigs]);

  const addCustomUnit = (unit: Omit<UnitType, 'id'>) => {
    const newUnit: UnitType = {
      ...unit,
      id: Date.now().toString()
    };
    setUnits(prev => [...prev, newUnit]);
  };

  const getProductConfig = (productCode: string): ProductUnitConfig | undefined => {
    return productConfigs.find(config => config.product_code === productCode);
  };

  const updateProductConfig = (config: ProductUnitConfig) => {
    setProductConfigs(prev => {
      const existingIndex = prev.findIndex(c => c.product_code === config.product_code);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = config;
        return updated;
      }
      return [...prev, config];
    });
  };

  const addConversionToProduct = (productCode: string, conversion: Omit<UnitConversion, 'id' | 'product_code'>) => {
    const newConversion: UnitConversion = {
      ...conversion,
      id: Date.now().toString(),
      product_code: productCode
    };

    setProductConfigs(prev => {
      const existingConfig = prev.find(c => c.product_code === productCode);
      if (existingConfig) {
        const updated = [...prev];
        const index = updated.findIndex(c => c.product_code === productCode);
        updated[index] = {
          ...existingConfig,
          conversions: [...existingConfig.conversions, newConversion]
        };
        return updated;
      } else {
        // Criar nova configuração para o produto
        return [...prev, {
          product_code: productCode,
          base_unit: conversion.from_unit,
          conversions: [newConversion]
        }];
      }
    });
  };

  const removeConversion = (productCode: string, conversionId: string) => {
    setProductConfigs(prev => {
      return prev.map(config => {
        if (config.product_code === productCode) {
          return {
            ...config,
            conversions: config.conversions.filter(c => c.id !== conversionId)
          };
        }
        return config;
      });
    });
  };

  // Função para converter quantidades
  const convertQuantity = (quantity: number, fromUnit: string, productCode: string): string => {
    const config = getProductConfig(productCode);
    if (!config) {
      return `${quantity.toLocaleString('pt-BR')} ${fromUnit}`;
    }

    let result = `${quantity.toLocaleString('pt-BR')} ${fromUnit}`;
    let currentQuantity = quantity;
    let currentUnit = fromUnit;

    // Aplicar conversões em sequência (primary -> secondary -> pallet)
    const secondaryConversion = config.conversions.find(c => 
      c.from_unit === currentUnit && c.category === 'secondary'
    );

    if (secondaryConversion && currentQuantity >= secondaryConversion.conversion_factor) {
      const convertedAmount = Math.floor(currentQuantity / secondaryConversion.conversion_factor);
      const remainder = currentQuantity % secondaryConversion.conversion_factor;
      
      if (convertedAmount > 0) {
        if (remainder > 0) {
          result = `${convertedAmount.toLocaleString('pt-BR')} ${secondaryConversion.to_unit} + ${remainder} ${currentUnit}`;
        } else {
          result = `${convertedAmount.toLocaleString('pt-BR')} ${secondaryConversion.to_unit}`;
        }
        
        currentQuantity = convertedAmount;
        currentUnit = secondaryConversion.to_unit;
      }
    }

    // Tentar conversão para palete se houver
    const palletConversion = config.conversions.find(c => 
      c.from_unit === currentUnit && c.category === 'pallet'
    );

    if (palletConversion && currentQuantity >= palletConversion.conversion_factor) {
      const convertedAmount = Math.floor(currentQuantity / palletConversion.conversion_factor);
      const remainder = currentQuantity % palletConversion.conversion_factor;
      
      if (convertedAmount > 0) {
        if (remainder > 0) {
          result = `${convertedAmount.toLocaleString('pt-BR')} ${palletConversion.to_unit} + ${remainder} ${currentUnit}`;
        } else {
          result = `${convertedAmount.toLocaleString('pt-BR')} ${palletConversion.to_unit}`;
        }
      }
    }

    return result;
  };

  return {
    units,
    productConfigs,
    addCustomUnit,
    getProductConfig,
    updateProductConfig,
    addConversionToProduct,
    removeConversion,
    convertQuantity
  };
};