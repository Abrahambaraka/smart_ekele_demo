import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { BaseRepository } from '../../database/db';
const router = Router();
const repo = new BaseRepository('notifications');
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await repo.findAll(req.query);
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post('/', authenticateToken, async (req, res) => {
  try {
    const notification = await repo.create(req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
export default router;
