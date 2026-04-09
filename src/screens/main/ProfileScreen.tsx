import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Switch,
  TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeContext';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/helpers';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { profile, updateProfile, totalExpense } = useFinance();
  const { signOut } = useAuth();

  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [name, setName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tabSlide = useSharedValue(mode === 'preview' ? 0 : 1);

  const handleUpdate = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.includes('@')) { setError('Valid email required'); return; }
    if (password && password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password && password !== confirm) { setError('Passwords do not match'); return; }

    setError('');
    await updateProfile({ fullName: name.trim(), email });
    setSuccess('Profile updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
    setPassword('');
    setConfirm('');
    setMode('preview');
  };

  const switchMode = (m: 'preview' | 'edit') => {
    setMode(m);
    tabSlide.value = withSpring(m === 'preview' ? 0 : 1);
    setError('');
    setSuccess('');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.avatar}>
          <Text style={styles.avatarText}>F</Text>
        </LinearGradient>
        <Text style={[styles.appTitle, { color: theme.text }]}>Finance Me</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: theme.bgSurface3 }]}>
            <Text>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: theme.bgSurface3 }]}>
            <Text>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* User Identity */}
            <Animated.View entering={FadeInDown.springify()} style={styles.userRow}>
              <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>{profile.fullName.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
              <Text style={[styles.userName, { color: theme.text }]}>{profile.fullName}</Text>
            </Animated.View>

            {/* Mode Toggle */}
            <Animated.View entering={FadeInDown.delay(60).springify()} style={[styles.toggle, { backgroundColor: theme.bgSurface3 }]}>
              {(['preview', 'edit'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => switchMode(m)}
                  style={[styles.toggleBtn, mode === m && { backgroundColor: theme.bgCard, borderRadius: 10 }]}
                >
                  <Text style={[styles.toggleText, { color: mode === m ? theme.text : theme.textSecondary }]}>
                    {m === 'preview' ? 'Preview' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>

            {mode === 'preview' ? (
              <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.previewCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                {[
                  { label: 'Total Spendings', value: formatCurrency(totalExpense), color: theme.expense },
                  { label: 'Email', value: profile.email, color: theme.text },
                  { label: 'Balance', value: formatCurrency(profile.totalBalance), color: theme.income },
                  { label: 'Card', value: profile.cardNumber, color: theme.textSecondary },
                  { label: 'Bank', value: profile.bankName, color: theme.textSecondary },
                ].map(({ label, value, color }) => (
                  <View key={label} style={[styles.previewRow, { borderColor: theme.border }]}>
                    <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>{label}</Text>
                    <Text style={[styles.previewValue, { color }]}>{value}</Text>
                  </View>
                ))}
              </Animated.View>
            ) : (
              <Animated.View entering={FadeInDown.delay(100).springify()}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
                <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>

                <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
                <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <Text style={[styles.label, { color: theme.textSecondary }]}>New Password (optional)</Text>
                <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.input, { color: theme.text, flex: 1 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry={!showPass}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    <Text style={{ color: theme.textSecondary }}>{showPass ? '👁️' : '👁'}</Text>
                  </TouchableOpacity>
                </View>

                {!!password && (
                  <>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Confirm Password</Text>
                    <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
                      <TextInput
                        style={[styles.input, { color: theme.text }]}
                        value={confirm}
                        onChangeText={setConfirm}
                        placeholder="Confirm your password"
                        placeholderTextColor={theme.textMuted}
                        secureTextEntry
                      />
                    </View>
                  </>
                )}

                {!!error && (
                  <View style={[styles.errorBox, { backgroundColor: theme.expenseBg }]}>
                    <Text style={[styles.errorText, { color: theme.expense }]}>{error}</Text>
                  </View>
                )}
                {!!success && (
                  <View style={[styles.errorBox, { backgroundColor: theme.incomeBg }]}>
                    <Text style={[styles.errorText, { color: theme.income }]}>{success}</Text>
                  </View>
                )}

                <TouchableOpacity onPress={handleUpdate} activeOpacity={0.9}>
                  <LinearGradient
                    colors={[theme.primary, theme.primaryDark]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.updateBtn}
                  >
                    <Text style={styles.updateBtnText}>Update Details</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Settings */}
            <Animated.View entering={FadeInDown.delay(180).springify()} style={[styles.settingsCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <Text style={[styles.settingsTitle, { color: theme.text }]}>Settings</Text>

              <View style={[styles.settingRow, { borderColor: theme.border }]}>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
                  <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Switch appearance</Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor="#fff"
                />
              </View>

              <View style={[styles.settingRow, { borderColor: theme.border }]}>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Notifications</Text>
                  <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Transaction alerts</Text>
                </View>
                <Switch
                  value={false}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor="#fff"
                />
              </View>
            </Animated.View>

            {/* Sign out */}
            <Animated.View entering={FadeInDown.delay(220).springify()}>
              <TouchableOpacity onPress={signOut} style={[styles.signOutBtn, { borderColor: theme.expense + '60', backgroundColor: theme.expenseBg }]}>
                <Text style={[styles.signOutText, { color: theme.expense }]}>Sign Out</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  appTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8, marginBottom: 20 },
  userAvatar: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  userName: { fontSize: 22, fontWeight: '700' },
  toggle: { flexDirection: 'row', borderRadius: 14, padding: 4, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  toggleText: { fontSize: 14, fontWeight: '600' },
  previewCard: { borderRadius: 16, borderWidth: 0.5, marginBottom: 16, overflow: 'hidden' },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5 },
  previewLabel: { fontSize: 14, fontWeight: '500' },
  previewValue: { fontSize: 15, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 0.5, paddingHorizontal: 14, marginBottom: 16, height: 52 },
  input: { flex: 1, fontSize: 15 },
  errorBox: { borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 13 },
  updateBtn: { borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  updateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  settingsCard: { borderRadius: 16, borderWidth: 0.5, padding: 16, marginBottom: 16 },
  settingsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
  settingLabel: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  settingDesc: { fontSize: 12 },
  signOutBtn: { borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 16 },
  signOutText: { fontSize: 16, fontWeight: '700' },
});