import { Hono } from 'hono';
import { algorandService } from '../services/algorandService.js';
import { storage } from '../db/storage.js';

const ledgerRouter = new Hono();

ledgerRouter.get('/accounts', (c) => {
  const accounts = algorandService.getAccountList();
  return c.json({
    success: true,
    network: 'Algorand TestNet (v3.2)',
    genesisId: 'testnet-v1.0',
    accounts
  });
});

ledgerRouter.get('/transactions', (c) => {
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : 50;
  const transactions = algorandService.getTransactionHistory(limit);
  return c.json({
    success: true,
    count: transactions.length,
    transactions
  });
});

ledgerRouter.get('/stats', (c) => {
  const stats = storage.getGlobalStats();
  const failovers = storage.getFailovers();
  return c.json({
    success: true,
    stats: {
      ...stats,
      failovers
    }
  });
});

export { ledgerRouter };
