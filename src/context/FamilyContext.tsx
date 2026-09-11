import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Family, FamilyMember, BirthdayItem } from '../types';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

interface FamilyContextType {
  family: Family | null;
  members: FamilyMember[];
  birthdays: BirthdayItem[];
  selectedMemberFilter: string | null; // null = all members
  setSelectedMemberFilter: (id: string | null) => void;
  isLoading: boolean;
  fetchFamilyData: () => Promise<void>;
  addMember: (data: Partial<FamilyMember>) => Promise<FamilyMember>;
  updateMember: (id: string, data: Partial<FamilyMember>) => Promise<FamilyMember>;
  removeMember: (id: string) => Promise<void>;
  updateHousehold: (data: { name?: string; timezone?: string }) => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [birthdays, setBirthdays] = useState<BirthdayItem[]>([]);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFamilyData = useCallback(async () => {
    if (!user) {
      setFamily(null);
      setMembers([]);
      setBirthdays([]);
      return;
    }

    setIsLoading(true);
    try {
      const [familyRes, birthdaysRes] = await Promise.all([
        api.getFamily(),
        api.getBirthdays().catch(() => []),
      ]);
      setFamily(familyRes.family);
      setMembers(familyRes.members);
      setBirthdays(birthdaysRes);
    } catch (err) {
      console.error('Failed to load family data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFamilyData();
  }, [fetchFamilyData]);

  const addMember = async (data: Partial<FamilyMember>) => {
    const newMember = await api.createMember(data);
    await fetchFamilyData();
    return newMember;
  };

  const updateMember = async (id: string, data: Partial<FamilyMember>) => {
    const updated = await api.updateMember(id, data);
    await fetchFamilyData();
    return updated;
  };

  const removeMember = async (id: string) => {
    await api.deleteMember(id);
    await fetchFamilyData();
  };

  const updateHousehold = async (data: { name?: string; timezone?: string }) => {
    const updated = await api.updateFamily(data);
    setFamily(updated);
  };

  return (
    <FamilyContext.Provider
      value={{
        family,
        members,
        birthdays,
        selectedMemberFilter,
        setSelectedMemberFilter,
        isLoading,
        fetchFamilyData,
        addMember,
        updateMember,
        removeMember,
        updateHousehold,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
