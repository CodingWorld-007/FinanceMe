import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, RefreshControl, FlatList
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeContext';
import { useFinance } from '../../context/FinanceContext';
import { getCategoryById } from '../../types';
import { formatCurrency, formatDateShort } from '../../utils/helpers';
import AddTransactionModal from '../../components/AddTransactionModal';


// ✅ MEMOIZED ROW (BIG PERFORMANCE BOOST)
const TransactionRow = React.memo(({ tx, onDelete }: any) => {
  const { theme } = useTheme();
  const category = getCategoryById(tx.category);

  return (
    <View style={[styles.txRow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
      <View style={[styles.txIcon, { backgroundColor: (category?.color || theme.primary) + '20' }]}>
        <Text>{category?.icon || '💳'}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.text }}>{category?.name}</Text>
        <Text style={{ color: theme.textSecondary }}>{formatDateShort(tx.date)}</Text>
      </View>

      <Text style={{ color: tx.type === 'income' ? theme.income : theme.expense }}>
        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
      </Text>

      <TouchableOpacity onPress={() => onDelete(tx.id)}>
        <Text style={{ color: theme.textMuted }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
});

export default function HomeScreen() {
  const { theme } = useTheme();
  const { transactions, profile, deleteTransaction, monthlyIncome, monthlyExpense } = useFinance();

  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fabScale = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  // ✅ MEMOIZED FILTER
  const filtered = useMemo(() => {
    return transactions.filter(t => filter === 'all' || t.type === filter);
  }, [transactions, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const onFabPress = () => {
    fabScale.value = withSpring(0.9);
    setTimeout(() => {
      fabScale.value = withSpring(1);
    }, 100);
    setShowAdd(true);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // ✅ HEADER CONTENT (used in FlatList)
  const ListHeader = () => (
    <>
      <Animated.View entering={FadeInDown.duration(300)}>
        <Text style={[styles.greeting, { color: theme.text }]}>
          {greeting()}, {profile.fullName.split(' ')[0]} 👋
        </Text>
      </Animated.View>

      <LinearGradient
        colors={[theme.primary, theme.primaryDark]}
        style={styles.balanceCard}
      >
        <Text style={{ color: '#fff' }}>{profile.bankName}</Text>
        <Text style={{ color: '#fff', fontSize: 20 }}>{profile.cardNumber}</Text>
      </LinearGradient>

      <View style={styles.summaryRow}>
        <Text style={{ color: theme.income }}>Income: {formatCurrency(monthlyIncome)}</Text>
        <Text style={{ color: theme.expense }}>Expense: {formatCurrency(monthlyExpense)}</Text>
      </View>

      <View style={styles.filterRow}>
        {['all', 'income', 'expense'].map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f as any)}>
            <Text style={{ color: filter === f ? theme.primary : theme.textSecondary }}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

      {/* ✅ FLATLIST (MAIN FIX) */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionRow tx={item} onDelete={deleteTransaction} />
        )}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      />

      {/* FAB */}
      <Animated.View style={[styles.fab, fabStyle]}>
        <TouchableOpacity onPress={onFabPress}>
          <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.fabInner}>
            <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <AddTransactionModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  greeting: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  balanceCard: { padding: 20, borderRadius: 16, marginBottom: 20 },
  summaryRow: { marginBottom: 20 },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  txRow: { flexDirection: 'row', padding: 12, borderRadius: 12, marginBottom: 10 },
  txIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', bottom: 90, right: 20 },
  fabInner: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});