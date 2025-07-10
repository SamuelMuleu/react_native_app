import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Calendar, Filter, TrendingUp, ShoppingCart, Trash2 } from 'lucide-react-native';
import { SaleItem } from '@/components/SaleItem';
import { useTheme } from '@/contexts/ThemeContext';
import { useSales } from '@/hooks/useSales';
import { formatCurrency } from '@/utils/currency';
import { formatDate, isToday, isThisWeek, isThisMonth } from '@/utils/date';
import { DateFilter, Sale } from '@/types';

export default function SalesScreen() {
  const { colors } = useTheme();
  const { sales, loading, deleteSale, refreshSales } = useSales();
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshSales();
    setRefreshing(false);
  };

  const getFilteredSales = () => {
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

    return sales
      .filter(sale => filterDate(new Date(sale.timestamp)))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const filteredSales = getFilteredSales();

  const getTotalSales = () => {
    return filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  };

  const getTotalProfit = () => {
    return filteredSales.reduce((sum, sale) => sum + sale.profit, 0);
  };

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

  const handleDeleteSale = (sale: Sale) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir esta venda?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteSale(sale.id),
        },
      ]
    );
  };

  const groupSalesByDate = (sales: Sale[]) => {
    const grouped: { [key: string]: Sale[] } = {};
    
    sales.forEach(sale => {
      const date = formatDate(new Date(sale.timestamp));
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(sale);
    });

    return grouped;
  };

  const groupedSales = groupSalesByDate(filteredSales);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: colors.success,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 8,
    },
    headerSubtitle: {
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
      backgroundColor: colors.success,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    filterButtonTextActive: {
      color: '#FFFFFF',
    },
    summaryContainer: {
      flexDirection: 'row',
      marginBottom: 24,
      gap: 12,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    summaryIcon: {
      marginBottom: 8,
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    salesContainer: {
      flex: 1,
    },
    dateGroup: {
      marginBottom: 20,
    },
    dateHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginBottom: 12,
    },
    dateHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateHeaderText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 8,
    },
    dateHeaderSummary: {
      fontSize: 14,
      color: colors.success,
      fontWeight: '600',
    },
    saleItemContainer: {
      position: 'relative',
    },
    deleteButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: colors.error,
      borderRadius: 20,
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
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
        <Text style={styles.headerTitle}>Vendas</Text>
        <Text style={styles.headerSubtitle}>Acompanhe suas vendas</Text>
      </View>

      <View style={styles.content}>
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

        {/* Resumo */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <ShoppingCart size={24} color={colors.primary} />
            </View>
            <Text style={styles.summaryValue}>{filteredSales.length}</Text>
            <Text style={styles.summaryLabel}>Vendas{'\n'}{getDateFilterLabel()}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <TrendingUp size={24} color={colors.success} />
            </View>
            <Text style={styles.summaryValue}>{formatCurrency(getTotalSales())}</Text>
            <Text style={styles.summaryLabel}>Total{'\n'}Vendido</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <TrendingUp size={24} color={colors.warning} />
            </View>
            <Text style={styles.summaryValue}>{formatCurrency(getTotalProfit())}</Text>
            <Text style={styles.summaryLabel}>Lucro{'\n'}Total</Text>
          </View>
        </View>

        {/* Lista de Vendas */}
        <ScrollView
          style={styles.salesContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {Object.keys(groupedSales).length > 0 ? (
            Object.entries(groupedSales).map(([date, dateSales]) => {
              const dayTotal = dateSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
              
              return (
                <View key={date} style={styles.dateGroup}>
                  <View style={styles.dateHeader}>
                    <View style={styles.dateHeaderLeft}>
                      <Calendar size={16} color={colors.textSecondary} />
                      <Text style={styles.dateHeaderText}>{date}</Text>
                    </View>
                    <Text style={styles.dateHeaderSummary}>
                      {formatCurrency(dayTotal)}
                    </Text>
                  </View>
                  
                  {dateSales.map((sale) => (
                    <View key={sale.id} style={styles.saleItemContainer}>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteSale(sale)}
                      >
                        <Trash2 size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <SaleItem sale={sale} />
                    </View>
                  ))}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <ShoppingCart size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                Nenhuma venda encontrada para {getDateFilterLabel().toLowerCase()}.{'\n'}
                Que tal registrar uma venda?
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}