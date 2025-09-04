import { useState, useEffect } from 'react';
import { UnitType, UnitConversion, ProductUnitConfig, DEFAULT_UNITS } from '../types/unitConversion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUnitConversion = () => {
  const { user } = useAuth();
  const [units, setUnits] = useState<UnitType[]>(DEFAULT_UNITS);
  const [productConfigs, setProductConfigs] = useState<ProductUnitConfig[]>([]);

  // Load data on mount - prioritize Supabase if user is logged in
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          // Load custom units from Supabase
          const { data: customUnitsData } = await supabase
            .from('custom_units')
            .select('*')
            .eq('user_id', user.id);

          if (customUnitsData) {
            const customUnits = customUnitsData.map(unit => ({
              id: unit.id,
              code: unit.code,
              name: unit.name,
              category: unit.category as 'primary' | 'secondary' | 'pallet'
            }));
            setUnits([...DEFAULT_UNITS, ...customUnits]);
          }

          // Load product configs from Supabase
          const { data: productConfigsData } = await supabase
            .from('product_unit_configs')
            .select('*')
            .eq('user_id', user.id);

          if (productConfigsData) {
            const configs = productConfigsData.map(config => ({
              product_code: config.product_code,
              base_unit: 'UN',
              conversions: config.conversions as any
            }));
            setProductConfigs(configs);
          }

          // Migrate localStorage data
          await migrateLocalStorageData();
        } catch (error) {
          console.error('Error loading data from Supabase:', error);
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
    };

    loadData();
  }, [user]);

  const loadFromLocalStorage = () => {
    // Load custom units from localStorage
    const savedUnits = localStorage.getItem('customUnits');
    if (savedUnits) {
      try {
        const customUnits = JSON.parse(savedUnits);
        setUnits(prev => [...DEFAULT_UNITS, ...customUnits]);
      } catch (error) {
        console.error('Error loading custom units from localStorage:', error);
      }
    }

    // Load product configs from localStorage
    const savedConfigs = localStorage.getItem('productUnitConfigs');
    if (savedConfigs) {
      try {
        setProductConfigs(JSON.parse(savedConfigs));
      } catch (error) {
        console.error('Error loading product configs from localStorage:', error);
      }
    }
  };

  const migrateLocalStorageData = async () => {
    if (!user) return;

    try {
      // Migrate custom units
      const savedUnits = localStorage.getItem('customUnits');
      if (savedUnits) {
        const customUnits = JSON.parse(savedUnits);
        for (const unit of customUnits) {
          await supabase.from('custom_units').upsert({
            user_id: user.id,
            code: unit.code,
            name: unit.name,
            category: unit.category
          });
        }
        localStorage.removeItem('customUnits');
      }

      // Migrate product configs
      const savedConfigs = localStorage.getItem('productUnitConfigs');
      if (savedConfigs) {
        const configs = JSON.parse(savedConfigs);
        for (const config of configs) {
          await supabase.from('product_unit_configs').upsert({
            user_id: user.id,
            product_code: config.productCode,
            conversions: config.conversions
          });
        }
        localStorage.removeItem('productUnitConfigs');
      }
    } catch (error) {
      console.error('Error migrating localStorage data:', error);
    }
  };

  const addCustomUnit = async (unit: Omit<UnitType, 'id'>) => {
    const newUnit: UnitType = {
      ...unit,
      id: Date.now().toString()
    };
    
    // Salvar no Supabase se o usuário estiver logado
    if (user) {
      try {
        await supabase
          .from('custom_units')
          .insert({
            user_id: user.id,
            code: unit.code,
            name: unit.name,
            category: unit.category
          });
      } catch (error) {
        console.error('Erro ao salvar unidade no Supabase:', error);
      }
    }
    
    setUnits(prev => [...prev, newUnit]);
  };

  const getProductConfig = (productCode: string): ProductUnitConfig | undefined => {
    return productConfigs.find(config => config.product_code === productCode);
  };

  const updateProductConfig = async (config: ProductUnitConfig) => {
    if (user) {
      try {
        await supabase.from('product_unit_configs').upsert({
          user_id: user.id,
          product_code: config.product_code,
          conversions: config.conversions as any
        });
      } catch (error) {
        console.error('Error saving product config:', error);
      }
    }

    setProductConfigs(prev => {
      const existingIndex = prev.findIndex(c => c.product_code === config.product_code);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = config;
        return updated;
      } else {
        return [...prev, config];
      }
    });
  };

  const addConversionToProduct = async (productCode: string, conversion: Omit<UnitConversion, 'id' | 'product_code'>) => {
    const newConversion: UnitConversion = {
      ...conversion,
      id: Date.now().toString(),
      product_code: productCode
    };

    let updatedConfig: ProductUnitConfig;

    setProductConfigs(prev => {
      const existingConfig = prev.find(c => c.product_code === productCode);
      if (existingConfig) {
        const updated = [...prev];
        const index = updated.findIndex(c => c.product_code === productCode);
        updatedConfig = {
          ...existingConfig,
          conversions: [...existingConfig.conversions, newConversion]
        };
        updated[index] = updatedConfig;
        return updated;
      } else {
        // Criar nova configuração para o produto
        updatedConfig = {
          product_code: productCode,
          base_unit: conversion.from_unit,
          conversions: [newConversion]
        };
        return [...prev, updatedConfig];
      }
    });

    // Salvar no Supabase
    await updateProductConfig(updatedConfig!);
  };

  const removeConversion = async (productCode: string, conversionId: string) => {
    let updatedConfig: ProductUnitConfig | undefined;

    setProductConfigs(prev => {
      return prev.map(config => {
        if (config.product_code === productCode) {
          updatedConfig = {
            ...config,
            conversions: config.conversions.filter(c => c.id !== conversionId)
          };
          return updatedConfig;
        }
        return config;
      });
    });

    // Salvar no Supabase se existe configuração
    if (updatedConfig) {
      await updateProductConfig(updatedConfig);
    }
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