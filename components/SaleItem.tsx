import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sale } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatTime } from '@/utils/date';
import { useTheme } from '@/contexts/ThemeContext';

interface SaleItemProps {
  sale: Sale;
}

export const SaleItem: React.FC<SaleItemProps> = ({ sale }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    time: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    details: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    quantity: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    values: {
      alignItems: 'flex-end',
    },
    totalAmount: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    profit: {
      fontSize: 14,
      color: colors.success,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.productName}>{sale.productName}</Text>
        <Text style={styles.time}>{formatTime(new Date(sale.timestamp))}</Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.quantity}>
          {sale.quantity}x {formatCurrency(sale.unitPrice)}
        </Text>
        <View style={styles.values}>
          <Text style={styles.totalAmount}>{formatCurrency(sale.totalAmount)}</Text>
          <Text style={styles.profit}>+{formatCurrency(sale.profit)}</Text>
        </View>
      </View>
    </View>
  );
};