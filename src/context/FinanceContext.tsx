import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, UserProfile } from '../types';
import { generateId } from '../utils/helpers';

interface FinanceContextType {
  transactions: Transaction[];
  profile: UserProfile;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  isLoading: boolean;
}

const defaultProfile: UserProfile = {
  fullName: 'Alex Yu',
  email: 'alex@gmail.com',
  totalBalance: 20000,
  cardNumber: '8763 1111 2222 0329',
  cardExpiry: '10/28',
  bankName: 'ADRBank',
};

const FinanceContext = createContext<FinanceContextType>({} as FinanceContextType);

const TRANSACTIONS_KEY = '@financeme_transactions';
const PROFILE_KEY = '@financeme_profile';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txData, profileData] = await Promise.all([
        AsyncStorage.getItem(TRANSACTIONS_KEY),
        AsyncStorage.getItem(PROFILE_KEY),
      ]);

      if (txData) setTransactions(JSON.parse(txData));
      if (profileData) setProfile(JSON.parse(profileData));
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const persistTransactions = async (txs: Transaction[]) => {
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
  };

  // ✅ FIXED: no stale closure
  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTransactions((prev) => {
      const newTx: Transaction = {
        ...tx,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };

      const updated = [newTx, ...prev];
      persistTransactions(updated);

      setProfile((prevProfile) => {
        const delta = tx.type === 'income' ? tx.amount : -tx.amount;
        const newProfile = {
          ...prevProfile,
          totalBalance: prevProfile.totalBalance + delta,
        };
        AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
        return newProfile;
      });

      return updated;
    });
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    setTransactions((prev) => {
      const tx = prev.find((t) => t.id === id);
      if (!tx) return prev;

      const updated = prev.filter((t) => t.id !== id);
      persistTransactions(updated);

      setProfile((prevProfile) => {
        const delta = tx.type === 'income' ? -tx.amount : tx.amount;
        const newProfile = {
          ...prevProfile,
          totalBalance: prevProfile.totalBalance + delta,
        };
        AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
        return newProfile;
      });

      return updated;
    });
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ✅ OPTIMIZED calculations
  const calculations = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTxs = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const monthlyIncome = monthlyTxs
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const monthlyExpense = monthlyTxs
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      monthlyIncome,
      monthlyExpense,
    };
  }, [transactions]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        profile,
        addTransaction,
        deleteTransaction,
        updateProfile,
        balance: profile.totalBalance,
        isLoading,
        ...calculations,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);