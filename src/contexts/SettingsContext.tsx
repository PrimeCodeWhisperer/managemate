"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { TimeSpan } from "@/lib/definitions";

interface SettingsContextType {
  timeSpans: TimeSpan[];
  addTimeSpan: (span: Omit<TimeSpan, "id">) => Promise<void>;
  updateTimeSpan: (span: TimeSpan) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [timeSpans, setTimeSpans] = useState<TimeSpan[]>([]);

  useEffect(() => {
    const fetchSpans = async () => {
      const res = await fetch("/api/time-spans", { cache: "no-store" });
      if (res.ok) {
        const data: TimeSpan[] = await res.json();
        setTimeSpans(data);
      }
    };
    fetchSpans();
  }, []);

  const addTimeSpan = async (span: Omit<TimeSpan, "id">) => {
    const res = await fetch("/api/time-spans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(span),
    });
    if (res.ok) {
      const data: TimeSpan = await res.json();
      setTimeSpans((prev) => [...prev, data]);
    }
  };

  const updateTimeSpan = async (span: TimeSpan) => {
    const res = await fetch("/api/time-spans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(span),
    });
    if (res.ok) {
      setTimeSpans((prev) =>
        prev.map((s) => (s.id === span.id ? { ...span } : s))
      );
    }
  };

  return (
    <SettingsContext.Provider value={{ timeSpans, addTimeSpan, updateTimeSpan }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
};
