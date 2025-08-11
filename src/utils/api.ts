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

export const fetchEmployees = () => {
  return fetcher<Employee[]>("/api/employees");
};

export const fetchPendingEmployees = () => {
  return fetcher<PendingEmployee[]>("/api/pending-employees");
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
