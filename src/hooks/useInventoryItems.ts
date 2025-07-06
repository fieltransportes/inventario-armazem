import { useState, useEffect } from 'react';
import { useInventory, InventoryItem } from './useInventory';

export const useInventoryItems = (inventoryId: string, open: boolean, refreshTrigger?: number) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [countedQuantities, setCountedQuantities] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { fetchInventoryItems, updateCountedQuantity, completeInventory } = useInventory();

  useEffect(() => {
    if (open && inventoryId) {
      loadItems();
    }
  }, [open, inventoryId, refreshTrigger]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const inventoryItems = await fetchInventoryItems(inventoryId);
      setItems(inventoryItems);
      
      // Initialize counted quantities with existing values
      const initialQuantities: { [key: string]: string } = {};
      inventoryItems.forEach(item => {
        if (item.counted_quantity !== null && item.counted_quantity !== undefined) {
          initialQuantities[item.id] = item.counted_quantity.toString();
        }
      });
      setCountedQuantities(initialQuantities);
    } catch (error) {
      console.error('Error loading inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    setCountedQuantities(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleSaveQuantity = async (itemId: string) => {
    const quantity = parseFloat(countedQuantities[itemId] || '0');
    if (isNaN(quantity) || quantity < 0) {
      return;
    }

    try {
      await updateCountedQuantity(itemId, quantity);
      await loadItems(); // Refresh items
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleSaveAllQuantities = async () => {
    try {
      // Save all quantities in parallel
      const promises = items.map(async (item) => {
        const quantity = parseFloat(countedQuantities[item.id] || '0');
        if (!isNaN(quantity) && quantity >= 0) {
          await updateCountedQuantity(item.id, quantity);
        }
      });
      
      await Promise.all(promises);
      await loadItems(); // Refresh items
    } catch (error) {
      console.error('Error updating all quantities:', error);
    }
  };

  const handleCompleteInventory = async () => {
    if (window.confirm('Tem certeza que deseja finalizar este inventário? Esta ação não pode ser desfeita.')) {
      try {
        await completeInventory(inventoryId);
        return true;
      } catch (error) {
        console.error('Error completing inventory:', error);
        return false;
      }
    }
    return false;
  };

  const allQuantitiesFilled = items.every(item => 
    countedQuantities[item.id] && 
    !isNaN(parseFloat(countedQuantities[item.id]))
  );

  return {
    items,
    countedQuantities,
    loading,
    allQuantitiesFilled,
    handleQuantityChange,
    handleSaveQuantity,
    handleSaveAllQuantities,
    handleCompleteInventory
  };
};