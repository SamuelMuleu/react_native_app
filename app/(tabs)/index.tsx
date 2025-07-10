import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { ChartBar as BarChart3, DollarSign, TrendingUp, ShoppingBag, Calendar } from 'lucide-react-native';
import { MetricCard } from '@/components/MetricCard';
import { SaleItem } from '@/components/SaleItem';
import { useTheme } from '@/contexts/ThemeContext';
import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/utils/currency';
import { isToday, isThisWeek, isThisMonth } from '@/utils/date';
import { DashboardData, DateFilter } from '@/types';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { sales, refreshSales } = useSales();
  const { products, refreshProducts } = useProducts();
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshSales(), refreshProducts()]);
    setRefreshing(false);
  };

  const getDashboardData = (): DashboardData => {
    const filterDate = (date: Date) => {
      switch (dateFilter) {
        case 'today':
          return isToday(date);
        case 'week':
          return isThisWeek(date);
        case 'month':
          return isThisMonth(date);
        default:
          return true;
      }
    };

    const filteredSales = sales.filter(sale => filterDate(new Date(sale.timestamp)));
    
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.profit, 0);
    const totalCosts = totalSales - totalProfit;
    const salesCount = filteredSales.length;

    // Produtos mais vendidos
    const productSales = filteredSales.reduce((acc, sale) => {
      if (!acc[sale.productName]) {
        acc[sale.productName] = { quantity: 0, revenue: 0 };
      }
      acc[sale.productName].quantity += sale.quantity;
      acc[sale.productName].revenue += sale.totalAmount;
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number }>);

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalSales,
      totalProfit,
      totalCosts,
      salesCount,
      topProducts,
    };
  };

  const dashboardData = getDashboardData();
  const todaySales = sales.filter(sale => isToday(new Date(sale.timestamp)));

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today':
        return 'Hoje';
      case 'week':
        return 'Esta Semana';
      case 'month':
        return 'Este Mês';
      default:
        return 'Hoje';
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: colors.primary,
    },
    greeting: {
      fontSize: 28,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#FFFFFF',
      opacity: 0.9,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    filterContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
    },
    filterButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    filterButtonTextActive: {
      color: '#FFFFFF',
    },
    metricsContainer: {
      flexDirection: 'row',
      marginBottom: 24,
      gap: 8,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    topProductsContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    topProductItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    topProductName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    topProductStats: {
      alignItems: 'flex-end',
    },
    topProductQuantity: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    topProductRevenue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.success,
    },
    recentSalesContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 12,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, Empreendedor!</Text>
        <Text style={styles.subtitle}>Vamos ver como está o seu negócio</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Filtros de Data */}
        <View style={styles.filterContainer}>
          {(['today', 'week', 'month'] as DateFilter[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                dateFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setDateFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  dateFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter === 'today' ? 'Hoje' : filter === 'week' ? 'Semana' : 'Mês'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Métricas */}
        <View style={styles.metricsContainer}>
          <MetricCard
            title="Vendas"
            value={formatCurrency(dashboardData.totalSales)}
            subtitle={`${dashboardData.salesCount} vendas`}
            icon={<DollarSign size={20} color={colors.success} />}
            color={colors.success}
          />
          <MetricCard
            title="Lucro"
            value={formatCurrency(dashboardData.totalProfit)}
            subtitle={getDateFilterLabel()}
            icon={<TrendingUp size={20} color={colors.warning} />}
            color={colors.warning}
          />
        </View>

        {/* Produtos Mais Vendidos */}
        {dashboardData.topProducts.length > 0 && (
          <View style={styles.topProductsContainer}>
            <Text style={styles.sectionTitle}>Produtos Mais Vendidos</Text>
            {dashboardData.topProducts.map((product, index) => (
              <View key={index} style={styles.topProductItem}>
                <Text style={styles.topProductName}>{product.name}</Text>
                <View style={styles.topProductStats}>
                  <Text style={styles.topProductQuantity}>
                    {product.quantity} vendidos
                  </Text>
                  <Text style={styles.topProductRevenue}>
                    {formatCurrency(product.revenue)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Vendas Recentes */}
        <View style={styles.recentSalesContainer}>
          <Text style={styles.sectionTitle}>Vendas de Hoje</Text>
          {todaySales.length > 0 ? (
            todaySales.slice(0, 5).map((sale) => (
              <SaleItem key={sale.id} sale={sale} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <ShoppingBag size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                Nenhuma venda registrada hoje.{'\n'}
                Que tal começar cadastrando seus produtos?
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}