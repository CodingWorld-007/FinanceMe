export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO string
  note: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export interface UserProfile {
  fullName: string;
  email: string;
  totalBalance: number;
  cardNumber: string;
  cardExpiry: string;
  bankName: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: '🍔', color: '#FF8C42', type: 'expense' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#4FC3F7', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#F06292', type: 'expense' },
  { id: 'health', name: 'Health', icon: '❤️', color: '#EF5350', type: 'expense' },
  { id: 'entertainment', name: 'Fun', icon: '🎬', color: '#AB47BC', type: 'expense' },
  { id: 'bills', name: 'Bills', icon: '⚡', color: '#FFD54F', type: 'expense' },
  { id: 'education', name: 'Education', icon: '📚', color: '#26C6DA', type: 'expense' },
  { id: 'housing', name: 'Housing', icon: '🏠', color: '#66BB6A', type: 'expense' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#78909C', type: 'expense' },
  { id: 'other_exp', name: 'Other', icon: '📦', color: '#8888A8', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary', icon: '💼', color: '#00E5A0', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#7C6FFF', type: 'income' },
  { id: 'investment', name: 'Invest', icon: '📈', color: '#FFB547', type: 'income' },
  { id: 'gift', name: 'Gift', icon: '🎁', color: '#F06292', type: 'income' },
  { id: 'rental', name: 'Rental', icon: '🏘️', color: '#26C6DA', type: 'income' },
  { id: 'other_inc', name: 'Other', icon: '💰', color: '#8888A8', type: 'income' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const getCategoryById = (id: string): Category | undefined =>
  ALL_CATEGORIES.find((c) => c.id === id);