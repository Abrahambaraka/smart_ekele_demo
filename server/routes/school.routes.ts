import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { BaseRepository } from '../../database/db';

const router = Router();
const repo = new BaseRepository('schools');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const schools = await repo.findAll();
    res.json({ success: true, data: schools });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const school = await repo.findById(req.params.id);
    if (!school) return res.status(404).json({ success: false, error: 'School not found' });
    res.json({ success: true, data: school });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const school = await repo.create(req.body);
    res.status(201).json({ success: true, message: 'School created', data: school });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const school = await repo.update(req.params.id, req.body);
    res.json({ success: true, message: 'School updated', data: school });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
