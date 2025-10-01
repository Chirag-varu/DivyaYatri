import express from 'express';

const router = express.Router();

// Temple routes will be implemented here
router.get('/', (_req, res) => {
  res.json({ message: 'Temple routes coming soon' });
});

export default router;