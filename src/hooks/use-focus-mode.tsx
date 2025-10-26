
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from './use-local-storage';

// Define the shape of the settings
export interface FocusModeSettings {
  showInterviewPrep: boolean;
  showQuiz: boolean;
  showNotes: boolean;
  showCodeEditor: boolean;
}

// Define the context state
interface FocusModeContextState {
  settings: FocusModeSettings;
  setSetting: (key: keyof FocusModeSettings, value: boolean) => void;
  toggleSetting: (key: keyof FocusModeSettings) => void;
}

// Default values for the settings
const defaultSettings: FocusModeSettings = {
  showInterviewPrep: true,
  showQuiz: true,
  showNotes: true,
  showCodeEditor: true,
};

// Create the context
const FocusModeContext = createContext<FocusModeContextState | undefined>(undefined);

// Create the provider component
export const FocusModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<FocusModeSettings>('focus-mode-settings', defaultSettings);

  const setSetting = (key: keyof FocusModeSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleSetting = (key: keyof FocusModeSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const value = { settings, setSetting, toggleSetting };

  return (
    <FocusModeContext.Provider value={value}>
      {children}
    </FocusModeContext.Provider>
  );
};

// Create the hook to use the context
export const useFocusMode = (): FocusModeContextState => {
  const context = useContext(FocusModeContext);
  if (context === undefined) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
};
