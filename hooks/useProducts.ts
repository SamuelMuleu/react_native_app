import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Storage } from '@/utils/storage';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const savedProducts = await Storage.getProducts();
      setProducts(savedProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      await Storage.saveProducts(updatedProducts);
      return newProduct;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updatedProducts = products.map(product =>
        product.id === id ? { ...product, ...updates } : product
      );
      setProducts(updatedProducts);
      await Storage.saveProducts(updatedProducts);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);
      await Storage.saveProducts(updatedProducts);
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      throw error;
    }
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: loadProducts,
  };
};