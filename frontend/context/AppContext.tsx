'use client';

import React, { createContext, useContext, useState } from 'react';

export type Subject = {
  id: string;
  name: string;
  color: string;
  totalModules: number;
  completedModules: number;
};

export type Module = {
  id: string;
  subjectId: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedHours: number;
  completed: boolean;
};

type AppContextType = {
  subjects: Subject[];
  modules: Module[];
  addSubject: (subject: Subject) => void;
  addModule: (module: Module) => void;
  updateModule: (moduleId: string, updates: Partial<Module>) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);

  const addSubject = (subject: Subject) => {
    setSubjects((prev) => [...prev, subject]);
  };

  const addModule = (module: Module) => {
    setModules((prev) => [...prev, module]);
  };

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, ...updates } : m))
    );
  };

  return (
    <AppContext.Provider
      value={{ subjects, modules, addSubject, addModule, updateModule }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
