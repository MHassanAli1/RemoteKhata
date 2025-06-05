import express from 'express';
import prisma from './prisma/client.js';
import authRoutes from './routes/auth.js';

const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.use('/auth', authRoutes); // e.g. POST /auth/register

app.post('/sync/transactions', async (req, res) => {
  const { type, create = [], update = [], delete: toDelete = [], localIds = [] } = req.body;

  try {
    if (type === 'get') {
      const cloudTxns = await prisma.transaction.findMany({
        where: { id: { in: localIds } },
        select: { id: true }
      });
      return res.json(cloudTxns);
    }

    if (type === 'sync') {
      // Handle CREATE
      for (const txn of create) {
        await prisma.transaction.create({
          data: {
            id: txn.id,
            userID: txn.userID,
            ZoneName: txn.ZoneName,
            KhdaName: txn.KhdaName,
            KulAmdan: BigInt(txn.KulAmdan),
            date: new Date(txn.date),
            KulAkhrajat: BigInt(txn.KulAkhrajat),
            SaafiAmdan: BigInt(txn.SaafiAmdan),
            Exercise: BigInt(txn.Exercise),
            KulMaizan: BigInt(txn.KulMaizan),
            createdAt: new Date(txn.createdAt),
            updatedAt: new Date(txn.updatedAt),
            Synced: true,
            SyncedAt: new Date(),
            trollies: {
              create: txn.trollies?.map(t => ({
                total: t.total,
                StartingNum: BigInt(t.StartingNum),
                EndingNum: BigInt(t.EndingNum),
                createdAt: new Date(t.createdAt),
                updatedAt: new Date(t.updatedAt),
              }))
            },
            akhrajat: {
              create: txn.akhrajat?.map(a => ({
                description: a.description,
                amount: BigInt(a.amount),
              }))
            }
          }
        });
      }

      // Handle UPDATE
      for (const txn of update) {
        // Delete old nested data first
        await prisma.trolly.deleteMany({ where: { transactionId: txn.id } });
        await prisma.akhrajat.deleteMany({ where: { transactionId: txn.id } });

        await prisma.transaction.update({
          where: { id: txn.id },
          data: {
            ZoneName: txn.ZoneName,
            KhdaName: txn.KhdaName,
            KulAmdan: BigInt(txn.KulAmdan),
            date: new Date(txn.date),
            KulAkhrajat: BigInt(txn.KulAkhrajat),
            SaafiAmdan: BigInt(txn.SaafiAmdan),
            Exercise: BigInt(txn.Exercise),
            KulMaizan: BigInt(txn.KulMaizan),
            updatedAt: new Date(txn.updatedAt),
            Synced: true,
            SyncedAt: new Date(),
            trollies: {
              create: txn.trollies?.map(t => ({
                total: t.total,
                StartingNum: BigInt(t.StartingNum),
                EndingNum: BigInt(t.EndingNum),
                createdAt: new Date(t.createdAt),
                updatedAt: new Date(t.updatedAt),
              }))
            },
            akhrajat: {
              create: txn.akhrajat?.map(a => ({
                description: a.description,
                amount: BigInt(a.amount),
              }))
            }
          }
        });
      }

      // Handle DELETE
      if (toDelete.length > 0) {
        await prisma.transaction.deleteMany({ where: { id: { in: toDelete } } });
      }

      return res.json({ status: 'ok' });
    }

    res.status(400).json({ error: 'Invalid request type' });
  } catch (err) {
    console.error('[SYNC ERROR]', err.message, err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log('✅ Server started on http://localhost:3000');
});
