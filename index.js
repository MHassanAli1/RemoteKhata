import express from 'express';
import prisma from './prisma/client.js'; // Adjust path as needed

const router = express.Router();

router.post('/sync/transactions', async (req, res) => {
  try {
    const { type, localIds = [], create = [], update = [], delete: toDelete = [] } = req.body;

    if (type === 'get') {
      // Send back only IDs and SyncedAt fields
      const existing = await prisma.transaction.findMany({
        where: { id: { in: localIds } },
        select: { id: true, SyncedAt: true }
      });
      return res.json(existing);
    }

    if (type === 'sync') {
      // === CREATE ===
      for (const txn of create) {
        const { trollies, akhrajat, ...txnData } = txn;

        await prisma.transaction.create({
          data: {
            ...txnData,
            trollies: {
              create: trollies ?? []
            },
            akhrajat: {
              create: akhrajat ?? []
            }
          }
        });
      }

      // === UPDATE ===
      for (const txn of update) {
        const { trollies, akhrajat, ...txnData } = txn;

        // Delete existing nested items to simplify update logic
        await prisma.trolly.deleteMany({ where: { transactionId: txn.id } });
        await prisma.akhrajat.deleteMany({ where: { transactionId: txn.id } });

        await prisma.transaction.update({
          where: { id: txn.id },
          data: {
            ...txnData,
            trollies: {
              create: trollies ?? []
            },
            akhrajat: {
              create: akhrajat ?? []
            }
          }
        });
      }

      // === DELETE ===
      for (const id of toDelete) {
        await prisma.transaction.delete({
          where: { id }
        });
      }

      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid sync type' });

  } catch (err) {
    console.error('[CLOUD SYNC ERROR]', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err.message });
  }
});

export default router;
