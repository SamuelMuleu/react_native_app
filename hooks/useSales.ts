import { useState, useEffect } from 'react';
import { Sale } from '@/types';
import { Storage } from '@/utils/storage';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const savedSales = await Storage.getSales();
      setSales(savedSales);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSale = async (sale: Omit<Sale, 'id' | 'timestamp'>) => {
    try {
      const newSale: Sale = {
        ...sale,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      
      const updatedSales = [...sales, newSale];
      setSales(updatedSales);
      await Storage.saveSales(updatedSales);
      return newSale;
    } catch (error) {
      console.error('Erro ao adicionar venda:', error);
      throw error;
    }
  };

  const deleteSale = async (id: string) => {
    try {
      const updatedSales = sales.filter(sale => sale.id !== id);
      setSales(updatedSales);
      await Storage.saveSales(updatedSales);
    } catch (error) {
      console.error('Erro ao remover venda:', error);
      throw error;
    }
  };

  return {
    sales,
    loading,
    addSale,
    deleteSale,
    refreshSales: loadSales,
  };
};