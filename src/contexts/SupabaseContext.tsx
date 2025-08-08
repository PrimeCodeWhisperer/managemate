'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '../utils/supabase/client';
import { Employee, User } from '@/lib/definitions';
import { fetchEmployees, getUser } from '@/utils/api';

const supabase = createClient();

// Define the shape of the context
interface SupabaseDataContextType {
  data: User | undefined;
  employees: Employee[] | undefined;
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
      try {
        const cachedEmployees = localStorage.getItem('employees');
        const cachedUser = localStorage.getItem('userData');

        let employeesData: Employee[] | undefined = cachedEmployees
          ? JSON.parse(cachedEmployees)
          : undefined;
        let userData: User | undefined = cachedUser
          ? JSON.parse(cachedUser)
          : undefined;

        if (!employeesData || !userData) {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!userData) {
            userData = await getUser(user?.id);
            if (userData) {
              localStorage.setItem('userData', JSON.stringify(userData));
            }
          }

          if (!employeesData) {
            employeesData = await fetchEmployees();
            if (employeesData) {
              localStorage.setItem('employees', JSON.stringify(employeesData));
            }
          }
        }

        setData(userData);
        setEmployees(employeesData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <SupabaseDataContext.Provider value={{ data, employees, loading, error }}>
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
