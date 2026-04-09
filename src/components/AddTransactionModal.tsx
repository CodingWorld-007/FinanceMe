import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal,
  KeyboardAvoidingView, Platform, ScrollView,
  TouchableWithoutFeedback, Keyboard, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TransactionType } from '../types';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({ visible, onClose }: Props) {
  const { theme } = useTheme();
  const { addTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // ✅ FIXED: inside component
  const translateY = useSharedValue(height);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : height, { duration: 250 });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const reset = () => {
    setAmount('');
    setCategory('');
    setNote('');
    setError('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!category) {
      setError('Please select a category');
      return;
    }
    setError('');
    setSaving(true);

    try {
      await addTransaction({
        type,
        amount: parseFloat(amount),
        category,
        date: new Date(date).toISOString(),
        note: note.trim(),
      });
      handleClose();
    } catch {
      setError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            {/* ✅ FIXED: Reanimated View */}
            <Animated.View
              style={[
                styles.sheet,
                { backgroundColor: theme.bgModal },
                animatedStyle,
              ]}
            >
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView bounces={false} keyboardShouldPersistTaps="handled">

                  <View style={styles.handleWrap}>
                    <View style={[styles.handle, { backgroundColor: theme.border }]} />
                  </View>

                  <View style={styles.titleRow}>
                    <Text style={[styles.title, { color: theme.text }]}>Add Transaction</Text>
                    <TouchableOpacity
                      onPress={handleClose}
                      style={[styles.closeBtn, { backgroundColor: theme.bgSurface3 }]}
                    >
                      <Text style={{ color: theme.textSecondary }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Type Toggle */}
                  <View style={[styles.typeToggle, { backgroundColor: theme.bgSurface3 }]}>
                    {['expense', 'income'].map((t) => (
                      <TouchableOpacity
                        key={t}
                        onPress={() => {
                          setType(t as TransactionType);
                          setCategory('');
                        }}
                        style={[
                          styles.typeBtn,
                          type === t && {
                            backgroundColor: t === 'expense' ? theme.expense : theme.income,
                          },
                        ]}
                      >
                        <Text style={[
                          styles.typeBtnText,
                          { color: type === t ? '#fff' : theme.textSecondary }
                        ]}>
                          {t === 'expense' ? '↓ Expense' : '↑ Income'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Amount */}
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Amount</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: theme.bgInput }]}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={setAmount}
                  />

                  {/* Category */}
                  <View style={styles.catGrid}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCategory(cat.id)}
                        style={[
                          styles.catChip,
                          category === cat.id && { borderColor: cat.color },
                        ]}
                      >
                        <Text>{cat.icon}</Text>
                        <Text style={{ color: theme.text }}>{cat.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {!!error && <Text style={{ color: 'red' }}>{error}</Text>}

                  <TouchableOpacity onPress={handleSave}>
                    <LinearGradient
                      colors={[theme.primary, theme.primaryDark]}
                      style={styles.saveBtn}
                    >
                      <Text style={styles.saveBtnText}>
                        {saving ? 'Saving...' : 'Save'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                </ScrollView>
              </KeyboardAvoidingView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 },
  handleWrap: { alignItems: 'center', marginBottom: 10 },
  handle: { width: 40, height: 4, borderRadius: 2 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700' },
  closeBtn: { padding: 6, borderRadius: 8 },
  typeToggle: { flexDirection: 'row', padding: 4, borderRadius: 10 },
  typeBtn: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8 },
  typeBtnText: { fontWeight: '600' },
  label: { marginTop: 10 },
  input: { borderRadius: 10, padding: 12, marginVertical: 10 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { padding: 8, borderWidth: 1, borderRadius: 10 },
  saveBtn: { marginTop: 20, padding: 14, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});