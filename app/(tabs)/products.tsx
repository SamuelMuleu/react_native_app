import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { Plus, Search, X } from 'lucide-react-native';
import { ProductCard } from '@/components/ProductCard';
import { useTheme } from '@/contexts/ThemeContext';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { Product } from '@/types';
import { formatCurrency, parseCurrency } from '@/utils/currency';

export default function ProductsScreen() {
  const { colors } = useTheme();
  const { products, loading, addProduct, updateProduct, deleteProduct, refreshProducts } = useProducts();
  const { addSale } = useSales();
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sellQuantity, setSellQuantity] = useState('1');

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProducts();
    setRefreshing(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.category.toLowerCase().includes(searchText.toLowerCase())
  );

  const resetForm = () => {
    setProductName('');
    setCategory('');
    setSellPrice('');
    setCostPrice('');
    setStock('');
    setSellQuantity('1');
  };

  const handleAddProduct = async () => {
    if (!productName || !category || !sellPrice || !costPrice) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const sellPriceValue = parseCurrency(sellPrice);
    const costPriceValue = parseCurrency(costPrice);
    const stockValue = stock ? parseInt(stock) : undefined;

    if (sellPriceValue <= 0 || costPriceValue <= 0) {
      Alert.alert('Erro', 'Os preços devem ser maiores que zero.');
      return;
    }

    if (costPriceValue >= sellPriceValue) {
      Alert.alert('Atenção', 'O preço de venda deve ser maior que o custo para ter lucro.');
    }

    try {
      await addProduct({
        name: productName,
        category,
        sellPrice: sellPriceValue,
        costPrice: costPriceValue,
        stock: stockValue,
      });
      resetForm();
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o produto.');
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct || !productName || !category || !sellPrice || !costPrice) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const sellPriceValue = parseCurrency(sellPrice);
    const costPriceValue = parseCurrency(costPrice);
    const stockValue = stock ? parseInt(stock) : undefined;

    if (sellPriceValue <= 0 || costPriceValue <= 0) {
      Alert.alert('Erro', 'Os preços devem ser maiores que zero.');
      return;
    }

    try {
      await updateProduct(selectedProduct.id, {
        name: productName,
        category,
        sellPrice: sellPriceValue,
        costPrice: costPriceValue,
        stock: stockValue,
      });
      resetForm();
      setShowEditModal(false);
      setSelectedProduct(null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o produto.');
    }
  };

  const handleSellProduct = async () => {
    if (!selectedProduct || !sellQuantity) {
      Alert.alert('Erro', 'Por favor, informe a quantidade.');
      return;
    }

    const quantity = parseInt(sellQuantity);
    if (quantity <= 0) {
      Alert.alert('Erro', 'A quantidade deve ser maior que zero.');
      return;
    }

    if (selectedProduct.stock && quantity > selectedProduct.stock) {
      Alert.alert('Erro', 'Quantidade maior que o estoque disponível.');
      return;
    }

    try {
      const totalAmount = selectedProduct.sellPrice * quantity;
      const profit = (selectedProduct.sellPrice - selectedProduct.costPrice) * quantity;

      await addSale({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        unitPrice: selectedProduct.sellPrice,
        totalAmount,
        profit,
      });

      // Atualizar estoque se disponível
      if (selectedProduct.stock !== undefined) {
        await updateProduct(selectedProduct.id, {
          stock: selectedProduct.stock - quantity,
        });
      }

      resetForm();
      setShowSellModal(false);
      setSelectedProduct(null);
      Alert.alert('Sucesso', 'Venda registrada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar a venda.');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteProduct(product.id),
        },
      ]
    );
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setCategory(product.category);
    setSellPrice(product.sellPrice.toString());
    setCostPrice(product.costPrice.toString());
    setStock(product.stock?.toString() || '');
    setShowEditModal(true);
  };

  const openSellModal = (product: Product) => {
    setSelectedProduct(product);
    setSellQuantity('1');
    setShowSellModal(true);
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
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 16,
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
    addButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginBottom: 20,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      width: '90%',
      maxWidth: 400,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    priceRow: {
      flexDirection: 'row',
      gap: 12,
    },
    priceInput: {
      flex: 1,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.background,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    confirmButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    confirmButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    sellButton: {
      backgroundColor: colors.success,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    sellButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Produtos</Text>
        <Text style={styles.headerSubtitle}>Gerencie seus produtos</Text>
      </View>

      <View style={styles.content}>
        {/* Barra de pesquisa */}
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar produtos..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Botão adicionar */}
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Adicionar Produto</Text>
        </TouchableOpacity>

        {/* Lista de produtos */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSell={openSellModal}
                onEdit={openEditModal}
                onDelete={handleDeleteProduct}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Plus size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                Nenhum produto encontrado.{'\n'}
                Cadastre seus primeiros produtos!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Modal Adicionar Produto */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Produto</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowAddModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nome do Produto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Marmita Completa"
              placeholderTextColor={colors.textSecondary}
              value={productName}
              onChangeText={setProductName}
            />

            <Text style={styles.inputLabel}>Categoria *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Marmita, Doce, Salgado"
              placeholderTextColor={colors.textSecondary}
              value={category}
              onChangeText={setCategory}
            />

            <View style={styles.priceRow}>
              <View style={styles.priceInput}>
                <Text style={styles.inputLabel}>Preço de Venda *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="R$ 0,00"
                  placeholderTextColor={colors.textSecondary}
                  value={sellPrice}
                  onChangeText={setSellPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.priceInput}>
                <Text style={styles.inputLabel}>Custo *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="R$ 0,00"
                  placeholderTextColor={colors.textSecondary}
                  value={costPrice}
                  onChangeText={setCostPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Estoque (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 50"
              placeholderTextColor={colors.textSecondary}
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleAddProduct}>
                <Text style={styles.confirmButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Produto */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Produto</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowEditModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nome do Produto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Marmita Completa"
              placeholderTextColor={colors.textSecondary}
              value={productName}
              onChangeText={setProductName}
            />

            <Text style={styles.inputLabel}>Categoria *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Marmita, Doce, Salgado"
              placeholderTextColor={colors.textSecondary}
              value={category}
              onChangeText={setCategory}
            />

            <View style={styles.priceRow}>
              <View style={styles.priceInput}>
                <Text style={styles.inputLabel}>Preço de Venda *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="R$ 0,00"
                  placeholderTextColor={colors.textSecondary}
                  value={sellPrice}
                  onChangeText={setSellPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.priceInput}>
                <Text style={styles.inputLabel}>Custo *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="R$ 0,00"
                  placeholderTextColor={colors.textSecondary}
                  value={costPrice}
                  onChangeText={setCostPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Estoque (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 50"
              placeholderTextColor={colors.textSecondary}
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleEditProduct}>
                <Text style={styles.confirmButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Vender Produto */}
      <Modal visible={showSellModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Venda</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowSellModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedProduct && (
              <>
                <Text style={styles.inputLabel}>Produto</Text>
                <View style={styles.input}>
                  <Text style={{ color: colors.text }}>{selectedProduct.name}</Text>
                </View>

                <Text style={styles.inputLabel}>Preço Unitário</Text>
                <View style={styles.input}>
                  <Text style={{ color: colors.text }}>{formatCurrency(selectedProduct.sellPrice)}</Text>
                </View>

                <Text style={styles.inputLabel}>Quantidade</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor={colors.textSecondary}
                  value={sellQuantity}
                  onChangeText={setSellQuantity}
                  keyboardType="numeric"
                />

                {selectedProduct.stock !== undefined && (
                  <Text style={styles.inputLabel}>
                    Estoque disponível: {selectedProduct.stock} unidades
                  </Text>
                )}

                <TouchableOpacity style={styles.sellButton} onPress={handleSellProduct}>
                  <Text style={styles.sellButtonText}>
                    Vender - {formatCurrency(selectedProduct.sellPrice * parseInt(sellQuantity || '1'))}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}