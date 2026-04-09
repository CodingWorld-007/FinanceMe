import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';

const validate = (name: string, email: string, password: string, confirm: string) => {
  if (!name.trim() || name.trim().length < 2) return 'Please enter your full name';
  if (!email.includes('@')) return 'Please enter a valid email';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password !== confirm) return 'Passwords do not match';
  return null;
};

export default function SignUpScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formShake = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(formShake.value, [0, 0.25, 0.5, 0.75, 1], [0, -8, 8, -8, 0]) }],
  }));
  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale.value }] }));

  const handleSignUp = async () => {
    const err = validate(name, email, password, confirm);
    if (err) {
      setError(err);
      formShake.value = withSpring(1, { damping: 4 }, () => { formShake.value = 0; });
      return;
    }
    setError('');
    setLoading(true);
    buttonScale.value = withSpring(0.96);
    try {
      await signUp(name.trim(), email, password);
    } catch (e) {
      setError('Sign up failed. Try again.');
    } finally {
      setLoading(false);
      buttonScale.value = withSpring(1);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={[styles.orb1, { backgroundColor: theme.primary + '20' }]} />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
          <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
            <View style={styles.logoArea}>
              <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.logoBox}>
                <Text style={styles.logoText}>F</Text>
              </LinearGradient>
              <Text style={[styles.appName, { color: theme.text }]}>Welcome to Finance Me</Text>
              <Text style={[styles.tagline, { color: theme.textSecondary }]}>
                Send money globally with the real exchange rate
              </Text>
            </View>

            <Animated.View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }, shakeStyle]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Get started</Text>
              <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
                Sign in to your account or create a new one
              </Text>

              <View style={[styles.toggle, { backgroundColor: theme.bgSurface3 }]}>
                <TouchableOpacity style={styles.toggleBtn} onPress={() => navigation.navigate('SignIn')}>
                  <Text style={[styles.toggleText, { color: theme.textSecondary }]}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.toggleBtn, { backgroundColor: theme.bgCard, borderRadius: 10 }]}>
                  <Text style={[styles.toggleText, { color: theme.text }]}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              {[
                { label: 'Full Name', value: name, set: setName, placeholder: 'Enter your full name', type: 'default' },
                { label: 'Email', value: email, set: setEmail, placeholder: 'Enter your email', type: 'email-address' },
              ].map(({ label, value, set, placeholder, type }) => (
                <View key={label}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
                  <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder={placeholder}
                      placeholderTextColor={theme.textMuted}
                      value={value}
                      onChangeText={set}
                      keyboardType={type as any}
                      autoCapitalize={type === 'email-address' ? 'none' : 'words'}
                      autoCorrect={false}
                    />
                  </View>
                </View>
              ))}

              <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
              <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.text, flex: 1 }]}
                  placeholder="Create a password"
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Text style={{ color: theme.textSecondary, fontSize: 16 }}>{showPass ? '👁️' : '👁'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: theme.textSecondary }]}>Confirm Password</Text>
              <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.text, flex: 1 }]}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.textMuted}
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                  <Text style={{ color: theme.textSecondary, fontSize: 16 }}>{showConfirm ? '👁️' : '👁'}</Text>
                </TouchableOpacity>
              </View>

              {!!error && (
                <View style={[styles.errorBox, { backgroundColor: theme.expenseBg }]}>
                  <Text style={[styles.errorText, { color: theme.expense }]}>{error}</Text>
                </View>
              )}

              <Animated.View style={buttonStyle}>
                <TouchableOpacity onPress={handleSignUp} disabled={loading} activeOpacity={0.9}>
                  <LinearGradient
                    colors={[theme.primary, theme.primaryDark]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.signUpBtn}
                  >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  orb1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, top: -80, left: -80 },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoBox: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  appName: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  tagline: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  card: { borderRadius: 20, borderWidth: 0.5, padding: 24 },
  cardTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  cardSub: { fontSize: 13, marginBottom: 20 },
  toggle: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  toggleText: { fontSize: 14, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, borderWidth: 0.5, paddingHorizontal: 14,
    marginBottom: 16, height: 52,
  },
  input: { flex: 1, fontSize: 15 },
  eyeBtn: { padding: 4 },
  errorBox: { borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 13 },
  signUpBtn: { borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});