'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '../utils/supabase/client';
import { Employee, User } from '@/lib/definitions';
import { fetchEmployees, getUser } from '@/utils/api';
import { clearAppCache } from '@/utils/localStorage';

const supabase = createClient();

// Define the shape of the context
interface SupabaseDataContextType {
  data: User | undefined;
  employees: Employee[] | undefined;
  loading: boolean;
  error: string | null;
  clearCache:()=>void;
}

// Create the context
const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(undefined);

// Provider component
export const SupabaseDataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<User | undefined>();
  const [employees, setEmployees] = useState<Employee[] | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const clearCache = () => {
    clearAppCache();
    // Reset state to undefined to trigger fresh fetch
    setEmployees(undefined);
    setData(undefined);;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Add cache version to invalidate when Employee type changes
        const CACHE_VERSION = '2.0'; 
        const cachedVersion = localStorage.getItem('cacheVersion');

        if (cachedVersion !== CACHE_VERSION) {
          localStorage.removeItem('employees');
          localStorage.removeItem('userData');
          localStorage.setItem('cacheVersion', CACHE_VERSION);
          console.log('Cache cleared due to version mismatch');
        }

        const cachedEmployees = localStorage.getItem('employees');
        const cachedUser = localStorage.getItem('userData');

        let employeesData: Employee[] | undefined;
        let userData: User | undefined;
        if (cachedEmployees && cachedVersion === CACHE_VERSION) {
          try {
            employeesData = JSON.parse(cachedEmployees);
            console.log('Using cached employees');
          } catch (parseError) {
            console.error('Error parsing cached employees:', parseError);
            localStorage.removeItem('employees');
            employeesData = undefined;
          }
        }
        if (cachedUser && cachedVersion === CACHE_VERSION) {
          try {
            userData=JSON.parse(cachedUser);
            console.log('Using cached user');
          } catch (parseError) {
            console.error('Error parsing cached user:', parseError);
            localStorage.removeItem('userData');
            userData = undefined;
          }
        }

        // If no valid cached data, fetch fresh
        if (!employeesData) {
          console.log('Fetching fresh employees data');
          employeesData = await fetchEmployees();
          if (employeesData) {
            localStorage.setItem('employees', JSON.stringify(employeesData));
          }
        }
        
        if(!userData){
          const currentUser=(await supabase.auth.getUser()).data.user;
          console.log(currentUser?.id)
          userData = await getUser(currentUser?.id);
          console.log(userData)
          if (userData) {
            localStorage.setItem('userData', JSON.stringify(userData));
          }
        }
          if(userData?.role!=="admin"){
            localStorage.clear()
            supabase.auth.signOut()
          }

        setEmployees(employeesData);
        setData(userData)
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <SupabaseDataContext.Provider value={{ data, employees, loading, error,clearCache }}>
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
