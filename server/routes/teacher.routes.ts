import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { repositories } from '../../database/db';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { school_id } = req.query;
    const teachers = school_id 
      ? await repositories.teachers.findBySchool(school_id as string)
      : await repositories.teachers.findAll();
    res.json({ success: true, data: teachers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const teacher = await repositories.teachers.findById(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    res.json({ success: true, data: teacher });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/subjects', authenticateToken, async (req, res) => {
  try {
    const subjects = await repositories.teachers.getTeacherSubjects(req.params.id);
    res.json({ success: true, data: subjects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const teacher = await repositories.teachers.create(req.body);
    res.status(201).json({ success: true, message: 'Teacher created', data: teacher });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const teacher = await repositories.teachers.update(req.params.id, req.body);
    res.json({ success: true, message: 'Teacher updated', data: teacher });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
