import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import {
  getCurrentUser,
  saveCurrentUser,
  clearCurrentUser,
  getFamilyMembers,
  addFamilyMember,
} from '../config/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (phoneNumber: string, pin: string) => Promise<void>;
  signUp: (phoneNumber: string, name: string, role: 'mom' | 'family', pin: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  const signIn = async (phoneNumber: string, pin: string) => {
    try {
      // Simple PIN verification (last 4 digits of phone)
      const expectedPin = phoneNumber.slice(-4);
      if (pin !== expectedPin) {
        throw new Error('Invalid PIN');
      }

      // Check if user exists in family members (they signed up on another device)
      const familyMembers = await getFamilyMembers();
      const existingUser = familyMembers.find(m => m.phone_number === phoneNumber);

      if (!existingUser) {
        throw new Error('User not found. Please sign up first.');
      }

      await saveCurrentUser(existingUser);
      setUser(existingUser);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (phoneNumber: string, name: string, role: 'mom' | 'family', pin: string) => {
    try {
      // Create new user
      const newUser: User = {
        id: generateId(),
        phone_number: phoneNumber,
        name,
        role,
        expo_push_token: null,
        notification_time: '09:00:00',
        alert_time: '11:00:00',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save as current user
      await saveCurrentUser(newUser);
      
      // Also add to family members list so they can sign in on other devices
      await addFamilyMember(newUser);
      
      setUser(newUser);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await clearCurrentUser();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Simple ID generator (UUID alternative)
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
