import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, Animated as RNAnimated,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, G, Text as SvgText, Rect } from 'react-native-svg';

import { useTheme } from '../../theme/ThemeContext';
import { useFinance } from '../../context/FinanceContext';
import { EXPENSE_CATEGORIES } from '../../types';
import { formatCurrency, getLast6Months, getMonthName } from '../../utils/helpers';

const { width } = Dimensions.get('window');
const GAUGE_R = 90;
const GAUGE_CX = (width - 40) / 2;
const GAUGE_CY = 120;

function polarToXY(angle: number, r: number, cx: number, cy: number) {
  const rad = (angle - 180) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function GaugeChart({ score = 660 }: { score: number }) {
  const { theme } = useTheme();
  const animValue = useRef(new RNAnimated.Value(0)).current;
  const maxScore = 850;
  const minScore = 300;
  const pct = (score - minScore) / (maxScore - minScore);
  const angle = pct * 180; // 0..180

  useEffect(() => {
    RNAnimated.timing(animValue, { toValue: 1, duration: 1400, useNativeDriver: false }).start();
  }, []);

  const gaugeColors = ['#FF5757', '#FFB547', '#FFD700', '#7C6FFF', '#00E5A0'];
  const segmentAngles = [0, 36, 72, 108, 144, 180];

  const arcs: string[] = [];
  for (let i = 0; i < 5; i++) {
    const startA = segmentAngles[i];
    const endA = segmentAngles[i + 1];
    const s = polarToXY(startA, GAUGE_R, GAUGE_CX, GAUGE_CY);
    const e = polarToXY(endA, GAUGE_R, GAUGE_CX, GAUGE_CY);
    arcs.push(`M ${GAUGE_CX} ${GAUGE_CY} L ${s.x} ${s.y} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${e.x} ${e.y} Z`);
  }

  const needle = polarToXY(angle, GAUGE_R - 8, GAUGE_CX, GAUGE_CY);

  const label = pct < 0.3 ? 'Poor' : pct < 0.5 ? 'Fair' : pct < 0.7 ? 'Good' : pct < 0.85 ? 'Very Good' : 'Excellent';
  const labelColor = pct < 0.3 ? '#FF5757' : pct < 0.5 ? '#FFB547' : pct < 0.7 ? '#FFD700' : pct < 0.85 ? '#7C6FFF' : '#00E5A0';

  return (
    <View style={styles.gaugeWrap}>
      <Svg width={width - 40} height={160}>
        {arcs.map((d, i) => (
          <Path key={i} d={d} fill={gaugeColors[i]} opacity={0.85} />
        ))}
        <Circle cx={GAUGE_CX} cy={GAUGE_CY} r={GAUGE_R - 22} fill={theme.bgCard} />
        <Path
          d={`M ${GAUGE_CX} ${GAUGE_CY} L ${needle.x} ${needle.y}`}
          stroke="#fff"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <Circle cx={GAUGE_CX} cy={GAUGE_CY} r={7} fill="#fff" />
      </Svg>
      <View style={styles.gaugeCenter}>
        <Text style={[styles.gaugeScore, { color: theme.text }]}>{score}</Text>
        <Text style={[styles.gaugeLabel, { color: labelColor }]}>{label} Score</Text>
      </View>
    </View>
  );
}

function BarChart({ transactions }: { transactions: any[] }) {
  const { theme } = useTheme();
  const months = getLast6Months();
  const chartWidth = width - 80;
  const barW = chartWidth / months.length - 12;
  const chartH = 100;

  const data = months.map(({ month, year }) => {
    const inc = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year && t.type === 'income';
    }).reduce((s, t) => s + t.amount, 0);
    const exp = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year && t.type === 'expense';
    }).reduce((s, t) => s + t.amount, 0);
    return { inc, exp, label: months.find((m) => m.month === month)?.label || '' };
  });

  const maxVal = Math.max(...data.map((d) => Math.max(d.inc, d.exp)), 1);

  return (
    <Svg width={chartWidth} height={chartH + 20}>
      {data.map((d, i) => {
        const x = i * (barW + 12);
        const incH = (d.inc / maxVal) * chartH;
        const expH = (d.exp / maxVal) * chartH;
        return (
          <G key={i} x={x}>
            <Rect x={0} y={chartH - incH} width={barW / 2 - 2} height={incH} rx={4} fill={theme.income} opacity={0.8} />
            <Rect x={barW / 2 + 2} y={chartH - expH} width={barW / 2 - 2} height={expH} rx={4} fill={theme.expense} opacity={0.8} />
            <SvgText x={barW / 2} y={chartH + 14} fill={theme.textSecondary} fontSize={9} textAnchor="middle">
              {d.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

function PieChart({ transactions }: { transactions: any[] }) {
  const { theme } = useTheme();
  const r = 60;
  const cx = 80;
  const cy = 80;

  const expenses = transactions.filter((t) => t.type === 'expense');
  const total = expenses.reduce((s, t) => s + t.amount, 0);
  if (total === 0) return null;

  const catData = EXPENSE_CATEGORIES.map((cat) => {
    const amt = expenses.filter((t) => t.category === cat.id).reduce((s, t) => s + t.amount, 0);
    return { ...cat, amt, pct: amt / total };
  }).filter((c) => c.amt > 0).slice(0, 5);

  let startAngle = -90;
  const paths = catData.map((cat) => {
    const sweepAngle = cat.pct * 360;
    const s = polarToXY(startAngle, r, cx, cy);
    const e = polarToXY(startAngle + sweepAngle, r, cx, cy);
    const large = sweepAngle > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
    startAngle += sweepAngle;
    return { d, color: cat.color, name: cat.name, pct: cat.pct };
  });

  return (
    <View style={styles.pieWrap}>
      <Svg width={160} height={160}>
        {paths.map((p, i) => <Path key={i} d={p.d} fill={p.color} opacity={0.9} />)}
        <Circle cx={cx} cy={cy} r={r - 22} fill={theme.bgCard} />
      </Svg>
      <View style={styles.pieLegend}>
        {catData.map((cat) => (
          <View key={cat.id} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>
              {cat.name} {(cat.pct * 100).toFixed(0)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', rate: 1 },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', rate: 1.36 },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', rate: 0.79 },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', rate: 83.2 },
];

export default function BalancesScreen() {
  const { theme } = useTheme();
  const { transactions, totalIncome, totalExpense, balance, monthlyIncome, monthlyExpense } = useFinance();
  const [enabledCurrencies, setEnabledCurrencies] = useState(['USD']);

  const toggleCurrency = (code: string) => {
    setEnabledCurrencies((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.springify()}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Your Balances</Text>
          <Text style={[styles.pageSub, { color: theme.textSecondary }]}>Manage your multi-currency accounts</Text>
        </Animated.View>

        {/* Credit Score */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Credit Score</Text>
          <GaugeChart score={660} />
          <Text style={[styles.cardSub, { color: theme.textSecondary, textAlign: 'center', marginTop: -8 }]}>
            Last check: 21 Apr
          </Text>
        </Animated.View>

        {/* Monthly Summary */}
        <Animated.View entering={FadeInDown.delay(130).springify()} style={styles.summaryGrid}>
          {[
            { label: 'Total Income', value: totalIncome, color: theme.income, bg: theme.incomeBg },
            { label: 'Total Expenses', value: totalExpense, color: theme.expense, bg: theme.expenseBg },
            { label: 'Net Balance', value: balance, color: theme.primary, bg: theme.primaryBg },
            { label: 'This Month', value: monthlyIncome - monthlyExpense, color: monthlyIncome > monthlyExpense ? theme.income : theme.expense, bg: theme.bgSurface3 },
          ].map(({ label, value, color, bg }) => (
            <View key={label} style={[styles.summaryCard, { backgroundColor: bg, borderColor: color + '30' }]}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{label}</Text>
              <Text style={[styles.summaryValue, { color }]}>{formatCurrency(value)}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Bar Chart */}
        <Animated.View entering={FadeInDown.delay(180).springify()} style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Monthly Overview</Text>
            <View style={styles.chartLegend}>
              <View style={[styles.legendDot, { backgroundColor: theme.income }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>Income</Text>
              <View style={[styles.legendDot, { backgroundColor: theme.expense }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>Expense</Text>
            </View>
          </View>
          <BarChart transactions={transactions} />
        </Animated.View>

        {/* Pie Chart */}
        {transactions.some((t) => t.type === 'expense') && (
          <Animated.View entering={FadeInDown.delay(220).springify()} style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Spending by Category</Text>
            <PieChart transactions={transactions} />
          </Animated.View>
        )}

        {/* Currencies */}
        <Animated.View entering={FadeInDown.delay(260).springify()} style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Available Currencies</Text>
          {CURRENCIES.map((cur) => (
            <View key={cur.code} style={[styles.currencyRow, { borderColor: theme.border }]}>
              <Text style={{ fontSize: 24 }}>{cur.flag}</Text>
              <View style={styles.currencyMid}>
                <Text style={[styles.currencyCode, { color: theme.text }]}>{cur.code}</Text>
                <Text style={[styles.currencyName, { color: theme.textSecondary }]}>{cur.name}</Text>
              </View>
              <Text style={[styles.currencyRate, { color: theme.textTertiary }]}>
                ={cur.rate.toFixed(2)}
              </Text>
              <TouchableOpacity
                onPress={() => toggleCurrency(cur.code)}
                style={[
                  styles.enableBtn,
                  { backgroundColor: enabledCurrencies.includes(cur.code) ? theme.primaryBg : theme.bgSurface3 },
                ]}
              >
                <Text style={{ color: enabledCurrencies.includes(cur.code) ? theme.primary : theme.textSecondary, fontSize: 12, fontWeight: '600' }}>
                  {enabledCurrencies.includes(cur.code) ? '✓ On' : '+ Add'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  pageTitle: { fontSize: 24, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  pageSub: { fontSize: 13, marginBottom: 20 },
  card: { borderRadius: 16, borderWidth: 0.5, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  cardSub: { fontSize: 12 },
  gaugeWrap: { alignItems: 'center', position: 'relative' },
  gaugeCenter: { position: 'absolute', bottom: 16, alignItems: 'center' },
  gaugeScore: { fontSize: 36, fontWeight: '800' },
  gaugeLabel: { fontSize: 13, fontWeight: '600' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  summaryCard: { width: '47%', borderRadius: 14, padding: 14, borderWidth: 0.5 },
  summaryLabel: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  summaryValue: { fontSize: 16, fontWeight: '700' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pieWrap: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  pieLegend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12 },
  currencyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 0.5 },
  currencyMid: { flex: 1 },
  currencyCode: { fontSize: 15, fontWeight: '600' },
  currencyName: { fontSize: 12 },
  currencyRate: { fontSize: 12 },
  enableBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
});