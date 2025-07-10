import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ShoppingCart, Edit3, Trash2 } from 'lucide-react-native';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { useTheme } from '@/contexts/ThemeContext';

interface ProductCardProps {
  product: Product;
  onSell: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSell,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();
  
  const profit = product.sellPrice - product.costPrice;
  const profitPercentage = ((profit / product.costPrice) * 100).toFixed(1);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    name: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    category: {
      fontSize: 14,
      color: colors.textSecondary,
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    priceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    priceItem: {
      alignItems: 'center',
    },
    priceLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    priceValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    profitValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.success,
    },
    profitPercentage: {
      fontSize: 12,
      color: colors.success,
      marginTop: 2,
    },
    stockText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    sellButton: {
      backgroundColor: colors.success,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      flex: 1,
      marginRight: 8,
    },
    sellButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      marginLeft: 8,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.category}>{product.category}</Text>
      </View>

      <View style={styles.priceContainer}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Preço de Venda</Text>
          <Text style={styles.priceValue}>{formatCurrency(product.sellPrice)}</Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Custo</Text>
          <Text style={styles.priceValue}>{formatCurrency(product.costPrice)}</Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Lucro</Text>
          <Text style={styles.profitValue}>{formatCurrency(profit)}</Text>
          <Text style={styles.profitPercentage}>+{profitPercentage}%</Text>
        </View>
      </View>

      {product.stock !== undefined && (
        <Text style={styles.stockText}>
          Estoque: {product.stock} unidades
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.sellButton} onPress={() => onSell(product)}>
          <ShoppingCart size={18} color="#FFFFFF" />
          <Text style={styles.sellButtonText}>Vender</Text>
        </TouchableOpacity>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(product)}>
            <Edit3 size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(product)}>
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};