import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  connectPeraWallet, 
  reconnectPeraSession, 
  disconnectPeraWallet, 
  fetchLiveTestnetBalance,
  sendPeraTestnetPayment 
} from '../utils/peraWallet';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  liveBalanceAlgo: number | null;
  isConnecting: boolean;
  connectWallet: () => Promise<string | null>;
  disconnectWallet: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  executePeraPayment: (
    receiverAddress: string, 
    amountAlgo: number, 
    noteText: string
  ) => Promise<{ txId: string; round: number; explorerUrl: string }>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [liveBalanceAlgo, setLiveBalanceAlgo] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const updateBalance = async (addr: string) => {
    try {
      const bal = await fetchLiveTestnetBalance(addr);
      setLiveBalanceAlgo(bal);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Attempt automatic reconnect on load
    reconnectPeraSession().then((addr) => {
      if (addr) {
        setWalletAddress(addr);
        updateBalance(addr);
      }
    });
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const address = await connectPeraWallet();
      setWalletAddress(address);
      await updateBalance(address);
      return address;
    } catch (err) {
      console.error('Wallet connection failed:', err);
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    await disconnectPeraWallet();
    setWalletAddress(null);
    setLiveBalanceAlgo(null);
  };

  const refreshBalance = async () => {
    if (walletAddress) {
      await updateBalance(walletAddress);
    }
  };

  const executePeraPayment = async (
    receiverAddress: string,
    amountAlgo: number,
    noteText: string
  ) => {
    if (!walletAddress) {
      throw new Error('Pera Wallet is not connected');
    }
    const result = await sendPeraTestnetPayment({
      senderAddress: walletAddress,
      receiverAddress,
      amountAlgo,
      noteText
    });
    // Refresh balance after payment
    await refreshBalance();
    return result;
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected: Boolean(walletAddress),
        walletAddress,
        liveBalanceAlgo,
        isConnecting,
        connectWallet,
        disconnectWallet,
        refreshBalance,
        executePeraPayment
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
