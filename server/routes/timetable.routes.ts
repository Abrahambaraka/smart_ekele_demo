import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { BaseRepository } from '../../database/db';

const router = Router();
const repo = new BaseRepository('timetable');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const timetables = await repo.findAll(req.query);
    res.json({ success: true, data: timetables });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const entry = await repo.create(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await repo.update(req.params.id, req.body);
    res.json({ success: true, data: entry });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await repo.delete(req.params.id);
    res.json({ success: true, message: 'Timetable entry deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
