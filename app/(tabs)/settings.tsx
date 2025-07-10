import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Moon, Sun, Trash2, Info, CircleHelp as HelpCircle, Shield, Download, Upload } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Storage } from '@/utils/storage';

export default function SettingsScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleClearAllData = () => {
    Alert.alert(
      'Confirmar limpeza',
      'Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await Storage.clearAll();
              Alert.alert('Sucesso', 'Todos os dados foram removidos.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível limpar os dados.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      setIsLoading(true);
      const products = await Storage.getProducts();
      const sales = await Storage.getSales();
      
      const dataToExport = {
        products,
        sales,
        exportDate: new Date().toISOString(),
        version: '1.0',
      };

      // Em uma implementação real, você salvaria em um arquivo
      // Por agora, apenas mostramos um alerta
      Alert.alert(
        'Exportar Dados',
        `Encontrados:\n• ${products.length} produtos\n• ${sales.length} vendas\n\nEm uma versão futura, os dados serão exportados para um arquivo.`
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowInfo = () => {
    Alert.alert(
      'Sobre o App',
      'App desenvolvido para microempreendedores que vendem comida caseira.\n\nVersão: 1.0.0\nDesenvolvido com React Native'
    );
  };

  const handleShowHelp = () => {
    Alert.alert(
      'Como usar o App',
      '1. Cadastre seus produtos na aba "Produtos"\n2. Registre vendas tocando em "Vender"\n3. Acompanhe seu desempenho no "Dashboard"\n4. Veja o histórico na aba "Vendas"'
    );
  };

  const handleShowPrivacy = () => {
    Alert.alert(
      'Privacidade',
      'Todos os seus dados ficam armazenados apenas no seu dispositivo. Não coletamos nem compartilhamos informações pessoais.'
    );
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
    section: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
      paddingHorizontal: 12,
      paddingTop: 12,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    settingItemLast: {
      borderBottomWidth: 0,
    },
    settingIcon: {
      marginRight: 12,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    settingRight: {
      marginLeft: 'auto',
    },
    dangerItem: {
      backgroundColor: colors.error + '10',
    },
    dangerText: {
      color: colors.error,
    },
    loadingText: {
      color: colors.textSecondary,
    },
    appVersion: {
      textAlign: 'center',
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 20,
      paddingBottom: 20,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configurações</Text>
        <Text style={styles.headerSubtitle}>Personalize seu app</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Aparência */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>
          
          <TouchableOpacity
            style={[styles.settingItem, styles.settingItemLast]}
            onPress={toggleTheme}
          >
            <View style={styles.settingIcon}>
              {isDarkMode ? (
                <Moon size={20} color={colors.primary} />
              ) : (
                <Sun size={20} color={colors.primary} />
              )}
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Tema</Text>
              <Text style={styles.settingDescription}>
                {isDarkMode ? 'Modo escuro ativado' : 'Modo claro ativado'}
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Dados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleExportData}
            disabled={isLoading}
          >
            <View style={styles.settingIcon}>
              <Download size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Exportar Dados</Text>
              <Text style={styles.settingDescription}>
                Faça backup dos seus produtos e vendas
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, styles.settingItemLast, styles.dangerItem]}
            onPress={handleClearAllData}
            disabled={isLoading}
          >
            <View style={styles.settingIcon}>
              <Trash2 size={20} color={colors.error} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, styles.dangerText]}>
                Limpar Todos os Dados
              </Text>
              <Text style={styles.settingDescription}>
                {isLoading ? 'Limpando...' : 'Remove todos os produtos e vendas'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Suporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleShowHelp}>
            <View style={styles.settingIcon}>
              <HelpCircle size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Ajuda</Text>
              <Text style={styles.settingDescription}>Como usar o aplicativo</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleShowPrivacy}>
            <View style={styles.settingIcon}>
              <Shield size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacidade</Text>
              <Text style={styles.settingDescription}>Como seus dados são tratados</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, styles.settingItemLast]}
            onPress={handleShowInfo}
          >
            <View style={styles.settingIcon}>
              <Info size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Sobre</Text>
              <Text style={styles.settingDescription}>Informações do aplicativo</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.appVersion}>
          App Comida Caseira v1.0.0{'\n'}
          Desenvolvido para microempreendedores
        </Text>
      </ScrollView>
    </View>
  );
}