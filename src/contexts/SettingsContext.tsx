'use client'
import React, { createContext, useContext, useState } from 'react';

interface TimeSpan {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

interface SettingsContextValue {
  timeSpans: TimeSpan[];
  setTimeSpans: React.Dispatch<React.SetStateAction<TimeSpan[]>>;
}

const defaultTimeSpans: TimeSpan[] = [
  { id: 1, name: 'Morning', startTime: '06:00', endTime: '14:00' },
  { id: 2, name: 'Afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 3, name: 'Night', startTime: '22:00', endTime: '06:00' }
];

const SettingsContext = createContext<SettingsContextValue>({
  timeSpans: defaultTimeSpans,
  setTimeSpans: () => {}
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeSpans, setTimeSpans] = useState<TimeSpan[]>(defaultTimeSpans);

  return (
    <SettingsContext.Provider value={{ timeSpans, setTimeSpans }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

export type { TimeSpan };
