'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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

  const CACHE_VERSION = '3.0';
  const CACHE_REFRESH_INTERVAL = 5 * 60 * 1000;

  const fetchData = useCallback(async (useCache: boolean) => {
    setLoading(true);
    try {
      const cachedVersion = localStorage.getItem('cacheVersion');
      if (cachedVersion !== CACHE_VERSION) {
        clearAppCache();
        localStorage.setItem('cacheVersion', CACHE_VERSION);
      }

      let employeesData: Employee[] | undefined;
      let userData: User | undefined;
      let companyData: Company | undefined;

      if (useCache) {
        try {
          const cachedEmployees = localStorage.getItem('employees');
          const cachedUser = localStorage.getItem('userData');
          const cachedCompany = localStorage.getItem('companyData');
          if (cachedEmployees) employeesData = JSON.parse(cachedEmployees);
          if (cachedUser) userData = JSON.parse(cachedUser);
          if (cachedCompany) companyData = JSON.parse(cachedCompany);
        } catch {
          clearAppCache();
        }

        if (userData) setData(userData);
        if (companyData) setCompany(companyData);
        if (employeesData) setEmployees(employeesData);
      }

      const currentUser = (await supabase.auth.getUser()).data.user;
      if (currentUser?.id) {
        userData = await getUser(currentUser.id);
        if (userData?.role === 'admin') {
          companyData = userData.company;
          if (companyData?.id) {
            employeesData = await fetchEmployees(companyData.id);
          }
        } else {
          localStorage.clear();
          supabase.auth.signOut();
          userData = undefined;
          companyData = undefined;
          employeesData = undefined;
        }
      }

      if (userData) localStorage.setItem('userData', JSON.stringify(userData));
      if (companyData) localStorage.setItem('companyData', JSON.stringify(companyData));
      if (employeesData) localStorage.setItem('employees', JSON.stringify(employeesData));

      setData(userData);
      setCompany(companyData);
      setEmployees(employeesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    clearAppCache();
    setEmployees(undefined);
    setData(undefined);
    setCompany(undefined);
    fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), CACHE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData, CACHE_REFRESH_INTERVAL]);

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
