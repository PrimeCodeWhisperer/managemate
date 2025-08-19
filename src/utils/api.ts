import { Employee, User, PendingEmployee } from "@/lib/definitions";
import { clearCacheAndLogout } from "./localStorage";

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

export const getUser = (id?: string) => {
  if (!id) return Promise.resolve(undefined);
  return fetcher<User>(`/api/user?id=${id}`);
};

export const fetchEmployees = (companyId?: string) => {
  const url = companyId ? `/api/employees?companyId=${companyId}` : "/api/employees";
  return fetcher<Employee[]>(url);
};

export const fetchPendingEmployees = (companyId?: string) => {
  const url = companyId ? `/api/pending-employees?companyId=${companyId}` : "/api/pending-employees";
  return fetcher<PendingEmployee[]>(url);
};
export const handleLogout =async ()=>{
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include', // Include cookies
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to logout');
        }
  
        // Clear localStorage and redirect
        clearCacheAndLogout();
        
  
}
