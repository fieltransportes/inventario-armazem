
import { NFEData } from '../types/nfe';

const STORAGE_KEY = 'nfe-storage-data';

export const saveNFEData = (nfeData: NFEData): void => {
  const existingData = getNFEData();
  const updatedData = [...existingData, nfeData];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
};

export const getNFEData = (): NFEData[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteNFEData = (id: string): void => {
  const existingData = getNFEData();
  const filteredData = existingData.filter(nfe => nfe.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData));
};

export const clearAllNFEData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
