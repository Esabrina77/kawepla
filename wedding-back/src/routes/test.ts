import { Router } from 'express';

const router = Router();

// Route simple pour tester
router.get('/test', (req, res) => {
  res.json({ message: 'Test route works' });
});

export default router; 