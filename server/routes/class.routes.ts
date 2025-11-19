import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { BaseRepository } from '../../database/db';

const router = Router();
const repo = new BaseRepository('classes');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { school_id } = req.query;
    const classes = school_id ? await repo.findAll({ school_id }) : await repo.findAll();
    res.json({ success: true, data: classes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const classData = await repo.findById(req.params.id);
    if (!classData) return res.status(404).json({ success: false, error: 'Class not found' });
    res.json({ success: true, data: classData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const classData = await repo.create(req.body);
    res.status(201).json({ success: true, message: 'Class created', data: classData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const classData = await repo.update(req.params.id, req.body);
    res.json({ success: true, message: 'Class updated', data: classData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await repo.delete(req.params.id);
    res.json({ success: true, message: 'Class deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
