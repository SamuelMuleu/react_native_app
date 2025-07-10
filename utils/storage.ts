import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Sale } from '@/types';

const PRODUCTS_KEY = 'products';
const SALES_KEY = 'sales';
const SETTINGS_KEY = 'settings';

export class Storage {
  // Products
  static async saveProducts(products: Product[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Erro ao salvar produtos:', error);
      throw error;
    }
  }

  static async getProducts(): Promise<Product[]> {
    try {
      const data = await AsyncStorage.getItem(PRODUCTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      return [];
    }
  }

  // Sales
  static async saveSales(sales: Sale[]): Promise<void> {
    try {
      await AsyncStorage.setItem(SALES_KEY, JSON.stringify(sales));
    } catch (error) {
      console.error('Erro ao salvar vendas:', error);
      throw error;
    }
  }

  static async getSales(): Promise<Sale[]> {
    try {
      const data = await AsyncStorage.getItem(SALES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      return [];
    }
  }

  // Settings
  static async saveSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    }
  }

  static async getSettings(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : { darkMode: false };
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return { darkMode: false };
    }
  }

  // Clear all data
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([PRODUCTS_KEY, SALES_KEY, SETTINGS_KEY]);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  }
}