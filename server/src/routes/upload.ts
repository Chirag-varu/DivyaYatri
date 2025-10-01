import express from 'express';

const router = express.Router();

// Upload routes will be implemented here
router.get('/', (_req, res) => {
  res.json({ message: 'Upload routes coming soon' });
});

export default router;