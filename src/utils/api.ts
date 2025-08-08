import { Employee, User } from "@/lib/definitions";

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
