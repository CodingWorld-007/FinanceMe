import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; name: string } | null;
  signIn: (email: string, password: string, name?: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
const AUTH_KEY = '@financeme_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY).then((data) => {
      if (data) setUser(JSON.parse(data));
      setIsLoading(false);
    });
  }, []);

  const signIn = async (email: string, _password: string) => {
    // In real app, validate against backend. Here we just persist.
    const userData = { email, name: email.split('@')[0] };
    setUser(userData);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
  };

  const signUp = async (name: string, email: string, _password: string) => {
    const userData = { email, name };
    setUser(userData);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      signIn,
      signUp,
      signOut,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);