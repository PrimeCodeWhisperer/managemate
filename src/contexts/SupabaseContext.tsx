'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '../utils/supabase/client';
import { Employee, User } from '@/lib/definitions';
import { fetchEmployees, getUser } from '@/utils/supabaseClient';

const supabase =createClient();
// Define the shape of the data you expect from Supabase

// Define the shape of the context
interface SupabaseDataContextType {
  data: User | undefined;
  employees:Employee[] | undefined;
  loading: boolean;
  error: string | null;
}

// Create the context
const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(undefined);

// Provider component
export const SupabaseDataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<User | undefined>();
  const [employees, setEmployees] = useState<Employee[] | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const data=await getUser(user?.id)
      const employees_list=await fetchEmployees();
      if (error) {
        setError(error);
      } else {
        setData(data);
        setEmployees(employees);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <SupabaseDataContext.Provider value={{ data,employees, loading, error }}>
      {children}
    </SupabaseDataContext.Provider>
  );
};

// Custom hook to use the SupabaseDataContext
export const useSupabaseData = () => {
  const context = useContext(SupabaseDataContext);
  if (!context) {
    throw new Error('useSupabaseData must be used within a SupabaseDataProvider');
  }
  return context;
};
