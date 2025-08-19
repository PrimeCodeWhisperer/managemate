'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '../utils/supabase/client';
import { Employee, User, Company } from '@/lib/definitions';
import { fetchEmployees, getUser } from '@/utils/api';
import { clearAppCache } from '@/utils/localStorage';

const supabase = createClient();

// Define the shape of the context
interface SupabaseDataContextType {
  data: User | undefined;
  company: Company | undefined;
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
  const [company, setCompany] = useState<Company | undefined>();
  const [employees, setEmployees] = useState<Employee[] | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const clearCache = () => {
    clearAppCache();
    // Reset state to undefined to trigger fresh fetch
    setEmployees(undefined);
    setData(undefined);
    setCompany(undefined);
  };

  useEffect(() => {
    const CACHE_VERSION = '3.0';
    const CACHE_REFRESH_INTERVAL = 5 * 60 * 1000;

    const fetchData = async (useCache: boolean) => {
      setLoading(true);
      try {
        const cachedVersion = localStorage.getItem('cacheVersion');
        if (cachedVersion !== CACHE_VERSION) {
          localStorage.removeItem('employees');
          localStorage.removeItem('userData');
          localStorage.removeItem('companyData');
          localStorage.setItem('cacheVersion', CACHE_VERSION);
          console.log('Cache cleared due to version mismatch');
        }

        let employeesData: Employee[] | undefined;
        let userData: User | undefined;
        let companyData: Company | undefined;

        if (useCache) {
          const cachedEmployees = localStorage.getItem('employees');
          const cachedUser = localStorage.getItem('userData');
          const cachedCompany = localStorage.getItem('companyData');
          if (cachedEmployees && cachedVersion === CACHE_VERSION) {
            try {
              employeesData = JSON.parse(cachedEmployees);
              console.log('Using cached employees');
            } catch {
              localStorage.removeItem('employees');
            }
          }
          if (cachedUser && cachedVersion === CACHE_VERSION) {
            try {
              userData = JSON.parse(cachedUser);
              console.log('Using cached user');
            } catch {
              localStorage.removeItem('userData');
            }
          }
          if (cachedCompany && cachedVersion === CACHE_VERSION) {
            try {
              companyData = JSON.parse(cachedCompany);
              console.log('Using cached company');
            } catch {
              localStorage.removeItem('companyData');
            }
          }
        }

        const currentUser = (await supabase.auth.getUser()).data.user;

        if (!userData) {
          userData = await getUser(currentUser?.id);
          if (userData) {
            localStorage.setItem('userData', JSON.stringify(userData));
          }
        }

        if (!companyData && userData?.company) {
          companyData = userData.company;
          localStorage.setItem('companyData', JSON.stringify(companyData));
        }

        if (!employeesData && companyData?.id) {
          console.log('Fetching fresh employees data');
          employeesData = await fetchEmployees(companyData.id);
          if (employeesData) {
            localStorage.setItem('employees', JSON.stringify(employeesData));
          }
        }

        if (userData?.role !== "admin") {
          localStorage.clear();
          supabase.auth.signOut();
        }

        setEmployees(employeesData);
        setData(userData);
        setCompany(companyData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData(true);
    const interval = setInterval(() => fetchData(false), CACHE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <SupabaseDataContext.Provider value={{ data, company, employees, loading, error, clearCache }}>
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
