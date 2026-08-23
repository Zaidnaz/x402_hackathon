import React, { createContext, useContext, useState, useCallback } from 'react';
import { ModelProvider, ComputeProvider } from '../types';
import { CostEstimate } from '../utils/costEstimator';

interface SelectedTaskConfig {
  model: ModelProvider | null;
  compute: ComputeProvider | null;
  estimate: CostEstimate | null;
}

interface TaskContextType {
  selectedConfig: SelectedTaskConfig;
  setSelection: (model: ModelProvider, compute: ComputeProvider, estimate: CostEstimate) => void;
  clearSelection: () => void;
  isLocked: boolean;
  setLocked: (locked: boolean) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedConfig, setSelectedConfig] = useState<SelectedTaskConfig>({
    model: null,
    compute: null,
    estimate: null,
  });
  const [isLocked, setIsLocked] = useState(false);

  const setSelection = useCallback((model: ModelProvider, compute: ComputeProvider, estimate: CostEstimate) => {
    setSelectedConfig({ model, compute, estimate });
    setIsLocked(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedConfig({ model: null, compute: null, estimate: null });
    setIsLocked(false);
  }, []);

  return (
    <TaskContext.Provider value={{ selectedConfig, setSelection, clearSelection, isLocked, setLocked: setIsLocked }}>
      {children}
    </TaskContext.Provider>
  );
};

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}