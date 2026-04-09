export const palette = {
  // Blacks & dark surfaces
  black: '#0A0A0F',
  surface1: '#111118',
  surface2: '#18181F',
  surface3: '#1E1E28',
  surface4: '#252530',
  border: '#2A2A38',
  borderLight: '#3A3A50',

  // Purples (primary accent)
  purple50: '#F0EEFF',
  purple100: '#D4CCFF',
  purple200: '#A89EFF',
  purple400: '#7C6FFF',
  purple500: '#6C5FEF',
  purple600: '#5A4ED4',
  purple800: '#2E2870',

  // Greens (income / success)
  green50: '#E6FFF5',
  green200: '#7DFFD3',
  green400: '#00E5A0',
  green500: '#00C98C',
  green600: '#00A873',

  // Reds (expense / danger)
  red50: '#FFF0F0',
  red200: '#FFB3B3',
  red400: '#FF5757',
  red500: '#E84040',

  // Ambers (warning)
  amber400: '#FFB547',
  amber500: '#F0A030',

  // Blues (info)
  blue400: '#4FC3F7',
  blue500: '#2196F3',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F8F8FC',
  gray100: '#EDEDF5',
  gray200: '#D0D0E0',
  gray400: '#8888A8',
  gray500: '#666680',
  gray600: '#444460',
  gray800: '#22223A',
  gray900: '#12121F',

  // Gradient stops
  gradientCard1: ['#7C6FFF', '#4A3FC4'],
  gradientCard2: ['#00C98C', '#007A58'],
  gradientCard3: ['#FF5757', '#C42020'],
  gradientGold: ['#FFB547', '#E07A10'],
};

export type Theme = typeof darkTheme;

export const darkTheme = {
  isDark: true,

  // Backgrounds
  bg: palette.black,
  bgSurface1: palette.surface1,
  bgSurface2: palette.surface2,
  bgSurface3: palette.surface3,
  bgCard: palette.surface2,
  bgInput: palette.surface3,
  bgModal: palette.surface1,

  // Borders
  border: palette.border,
  borderLight: palette.borderLight,

  // Text
  text: palette.white,
  textSecondary: palette.gray400,
  textTertiary: palette.gray500,
  textMuted: palette.gray600,

  // Accent
  primary: palette.purple400,
  primaryLight: palette.purple200,
  primaryDark: palette.purple600,
  primaryBg: 'rgba(124, 111, 255, 0.12)',

  // Semantic
  income: palette.green400,
  incomeLight: palette.green200,
  incomeBg: 'rgba(0, 229, 160, 0.1)',
  expense: palette.red400,
  expenseLight: palette.red200,
  expenseBg: 'rgba(255, 87, 87, 0.1)',
  warning: palette.amber400,
  info: palette.blue400,

  // Gradients
  gradientPrimary: palette.gradientCard1,
  gradientIncome: palette.gradientCard2,
  gradientExpense: palette.gradientCard3,

  // Tab bar
  tabBg: palette.surface1,
  tabBorder: palette.border,
  tabActive: palette.purple400,
  tabInactive: palette.gray500,
};

export const lightTheme: Theme = {
  isDark: false,

  bg: palette.gray50,
  bgSurface1: palette.white,
  bgSurface2: palette.gray50,
  bgSurface3: palette.gray100,
  bgCard: palette.white,
  bgInput: palette.gray100,
  bgModal: palette.white,

  border: palette.gray200,
  borderLight: palette.gray100,

  text: palette.gray900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray500,
  textMuted: palette.gray400,

  primary: palette.purple500,
  primaryLight: palette.purple200,
  primaryDark: palette.purple600,
  primaryBg: 'rgba(108, 95, 239, 0.08)',

  income: palette.green500,
  incomeLight: palette.green200,
  incomeBg: 'rgba(0, 201, 140, 0.08)',
  expense: palette.red500,
  expenseLight: palette.red200,
  expenseBg: 'rgba(232, 64, 64, 0.08)',
  warning: palette.amber500,
  info: palette.blue500,

  gradientPrimary: palette.gradientCard1,
  gradientIncome: palette.gradientCard2,
  gradientExpense: palette.gradientCard3,

  tabBg: palette.white,
  tabBorder: palette.gray200,
  tabActive: palette.purple500,
  tabInactive: palette.gray400,
};