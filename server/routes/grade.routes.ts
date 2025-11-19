import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { repositories } from '../../database/db';
const router = Router();
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, school_year_id } = req.query;
    const grades = student_id 
      ? await repositories.grades.findByStudent(student_id as string, school_year_id as string)
      : await repositories.grades.findAll(req.query);
    res.json({ success: true, data: grades });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post('/', authenticateToken, async (req, res) => {
  try {
    const grade = await repositories.grades.create(req.body);
    res.status(201).json({ success: true, data: grade });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const grade = await repositories.grades.update(req.params.id, req.body);
    res.json({ success: true, data: grade });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
export default router;
