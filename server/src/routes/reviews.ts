import express from 'express';

const router = express.Router();

// Review routes will be implemented here
router.get('/', (_req, res) => {
  res.json({ message: 'Review routes coming soon' });
});

export default router;