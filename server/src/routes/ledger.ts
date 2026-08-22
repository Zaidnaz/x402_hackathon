import { Hono } from 'hono';
import { algorandService } from '../services/algorandService.js';
import { storage } from '../db/storage.js';

const ledgerRouter = new Hono();

ledgerRouter.get('/accounts', async (c) => {
  const accounts = await algorandService.getAccountList();
  return c.json({
    success: true,
    network: 'Algorand TestNet (v3.2)',
    genesisId: 'testnet-v1.0',
    accounts
  });
});

// Agent wallet funding status — poll this before running a live demo.
ledgerRouter.get('/funding', async (c) => {
  const info = algorandService.getFundingInfo();
  const balanceAlgo = await algorandService.fetchLiveBalanceAlgo(info.address, 0);
  return c.json({
    success: true,
    agentAddress: info.address,
    balanceAlgo,
    isFunded: balanceAlgo >= 1,
    fundUrl: info.fundUrl
  });
});

ledgerRouter.get('/transactions', async (c) => {
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : 50;
  const transactions = await algorandService.getTransactionHistory(limit);
  return c.json({
    success: true,
    count: transactions.length,
    transactions
  });
});

ledgerRouter.get('/stats', async (c) => {
  const [stats, failovers] = await Promise.all([
    storage.getGlobalStats(),
    storage.getFailovers()
  ]);
  return c.json({
    success: true,
    stats: {
      ...stats,
      failovers
    }
  });
});

export { ledgerRouter };
