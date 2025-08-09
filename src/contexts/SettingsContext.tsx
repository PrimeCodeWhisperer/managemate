"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { TimeSpan } from "@/lib/definitions";

interface SettingsContextType {
  timeSpans: TimeSpan[];
  addTimeSpan: (span: Omit<TimeSpan, "id">) => void;
  updateTimeSpan: (span: TimeSpan) => void;
  removeTimeSpan: (id: number) => void;
  saveChanges: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [timeSpans, setTimeSpans] = useState<TimeSpan[]>([]);
  const [removedSpanIds, setRemovedSpanIds] = useState<number[]>([]);

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

  const addTimeSpan = (span: Omit<TimeSpan, "id">) => {
    setTimeSpans((prev) => [...prev, { id: Date.now() * -1, ...span }]);
  };

  const updateTimeSpan = (span: TimeSpan) => {
    setTimeSpans((prev) =>
      prev.map((s) => (s.id === span.id ? { ...span } : s)),
    );
  };

  const removeTimeSpan = (id: number) => {
    setTimeSpans((prev) => prev.filter((s) => s.id !== id));
    if (id > 0) {
      setRemovedSpanIds((prev) => [...prev, id]);
    }
  };

  const saveChanges = async () => {
    for (const span of timeSpans) {
      if (span.id < 0) {
        const res = await fetch("/api/time-spans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: span.name,
            start_time: span.start_time,
            end_time: span.end_time,
          }),
        });
        if (res.ok) {
          const saved: TimeSpan = await res.json();
          setTimeSpans((prev) =>
            prev.map((s) => (s.id === span.id ? saved : s)),
          );
        }
      } else {
        await fetch("/api/time-spans", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(span),
        });
      }
    }

    for (const id of removedSpanIds) {
      await fetch(`/api/time-spans?id=${id}`, {
        method: "DELETE",
      });
    }

    setRemovedSpanIds([]);

    const res = await fetch("/api/time-spans", { cache: "no-store" });
    if (res.ok) {
      const data: TimeSpan[] = await res.json();
      setTimeSpans(data);
    }
  };

  return (
    <SettingsContext.Provider
      value={{ timeSpans, addTimeSpan, updateTimeSpan, removeTimeSpan, saveChanges }}
    >

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