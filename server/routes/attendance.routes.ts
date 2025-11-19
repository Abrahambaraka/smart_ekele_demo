import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { repositories } from '../../database/db';
const router = Router();
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, class_id, date } = req.query;
    let attendance;
    if (class_id && date) {
      attendance = await repositories.attendance.getClassAttendance(class_id as string, new Date(date as string));
    } else {
      attendance = await repositories.attendance.findAll(req.query);
    }
    res.json({ success: true, data: attendance });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post('/', authenticateToken, async (req, res) => {
  try {
    const attendance = await repositories.attendance.create(req.body);
    res.status(201).json({ success: true, data: attendance });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const attendance = await repositories.attendance.update(req.params.id, req.body);
    res.json({ success: true, data: attendance });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
export default router;
