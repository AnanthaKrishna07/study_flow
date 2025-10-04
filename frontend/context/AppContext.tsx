'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- Types for your data structures ---

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed?: boolean;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  description?: string;
};

export type Module = {
  id: string;
  name: string;
  subjectId?: string;
};

export type Subject = {
  id: string;
  name: string;
};

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type SettingsType = {
  emailReminders: boolean;
  studyHoursPerDay: number;
  preferredStudyTimes: string[];
  difficultyWeights: Record<Difficulty, number>;
};

// --- Default settings for first load ---
const defaultSettings: SettingsType = {
  emailReminders: false,
  studyHoursPerDay: 2,
  preferredStudyTimes: [],
  difficultyWeights: { Easy: 1, Medium: 1, Hard: 1 },
};

// --- Context type ---
type AppContextType = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  modules: Module[];
  setModules: React.Dispatch<React.SetStateAction<Module[]>>;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  settings: SettingsType;
  setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
};

// --- Create Context ---
const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Provider ---
export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);

  return (
    <AppContext.Provider
      value={{
        tasks,
        setTasks,
        events,
        setEvents,
        modules,
        setModules,
        subjects,
        setSubjects,
        settings,
        setSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// --- Hook to use the context ---
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
