import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from './WalletContext';
import { fetchFundingStatus } from '../utils/api';

interface EscrowState {
  isActive: boolean;
  totalDepositedAlgo: number;
  remainingBalanceAlgo: number;
  tasksAuthorized: number;
  tasksUsed: number;
  depositTxId: string | null;
  depositRound: number | null;
}

interface EscrowContextType {
  state: EscrowState;
  depositEscrow: (amountAlgo: number, tasks: number) => Promise<boolean>;
  releaseEscrow: () => Promise<void>;
  canExecuteSilently: () => boolean;
  recordTaskExecution: (estimatedCostAlgo: number) => void;
  resetEscrow: () => void;
}

const DEFAULT_STATE: EscrowState = {
  isActive: false,
  totalDepositedAlgo: 0,
  remainingBalanceAlgo: 0,
  tasksAuthorized: 0,
  tasksUsed: 0,
  depositTxId: null,
  depositRound: null,
};

const EscrowContext = createContext<EscrowContextType | undefined>(undefined);

const STORAGE_KEY = 'agentgrid_escrow_state';

export const EscrowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { executePeraPayment, refreshBalance, walletAddress, isConnected } = useWallet();
  const [state, setState] = useState<EscrowState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...DEFAULT_STATE, ...parsed };
        }
      } catch {}
    }
    return DEFAULT_STATE;
  });

  const persistState = useCallback((newState: EscrowState) => {
    setState(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
  }, []);

  const canExecuteSilently = useCallback(() => {
    return state.isActive && state.tasksUsed < state.tasksAuthorized && state.remainingBalanceAlgo > 0;
  }, [state]);

  const recordTaskExecution = useCallback((estimatedCostAlgo: number) => {
    if (!state.isActive) return;
    const newRemaining = Math.max(0, state.remainingBalanceAlgo - estimatedCostAlgo);
    const newTasksUsed = state.tasksUsed + 1;
    persistState({
      ...state,
      remainingBalanceAlgo: newRemaining,
      tasksUsed: newTasksUsed,
    });
  }, [state, persistState]);

  const depositEscrow = async (amountAlgo: number, tasks: number): Promise<boolean> => {
    if (!isConnected || !walletAddress) {
      alert('Please connect Pera Wallet first');
      return false;
    }

    try {
      const agentFunding = await fetchFundingStatus();
      const agentAddress = agentFunding?.agentAddress;
      if (!agentAddress) {
        alert('Could not fetch agent wallet address');
        return false;
      }

      const result = await executePeraPayment(
        agentAddress,
        amountAlgo,
        `Escrow deposit: ${amountAlgo} ALGO for ${tasks} tasks`
      );

      const newState: EscrowState = {
        isActive: true,
        totalDepositedAlgo: amountAlgo,
        remainingBalanceAlgo: amountAlgo,
        tasksAuthorized: tasks,
        tasksUsed: 0,
        depositTxId: result.txId,
        depositRound: result.round,
      };
      persistState(newState);
      await refreshBalance();
      return true;
    } catch (error: any) {
      console.error('Escrow deposit failed:', error);
      alert(`Deposit failed: ${error.message}`);
      return false;
    }
  };

  const releaseEscrow = async () => {
    if (!state.isActive) return;
    
    try {
      const agentFunding = await fetchFundingStatus();
      const agentAddress = agentFunding?.agentAddress;
      if (!agentAddress || state.remainingBalanceAlgo <= 0) {
        persistState(DEFAULT_STATE);
        return;
      }

      await executePeraPayment(
        walletAddress!,
        state.remainingBalanceAlgo,
        `Escrow release: returning ${state.remainingBalanceAlgo} ALGO`
      );
    } catch (error) {
      console.error('Escrow release failed:', error);
    } finally {
      persistState(DEFAULT_STATE);
      await refreshBalance();
    }
  };

  const resetEscrow = () => {
    persistState(DEFAULT_STATE);
  };

  return (
    <EscrowContext.Provider value={{ state, depositEscrow, releaseEscrow, canExecuteSilently, recordTaskExecution, resetEscrow }}>
      {children}
    </EscrowContext.Provider>
  );
};

export function useEscrow() {
  const context = useContext(EscrowContext);
  if (!context) {
    throw new Error('useEscrow must be used within an EscrowProvider');
  }
  return context;
}