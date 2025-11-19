import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { repositories } from '../../database/db';
const router = Router();
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.query;
    const payments = student_id 
      ? await repositories.payments.findByStudent(student_id as string)
      : await repositories.payments.findAll(req.query);
    res.json({ success: true, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post('/', authenticateToken, async (req, res) => {
  try {
    const payment = await repositories.payments.create(req.body);
    res.status(201).json({ success: true, message: 'Payment recorded', data: payment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get('/revenue/:school_id', authenticateToken, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const revenue = await repositories.payments.getSchoolRevenue(
      req.params.school_id,
      date_from ? new Date(date_from as string) : undefined,
      date_to ? new Date(date_to as string) : undefined
    );
    res.json({ success: true, data: revenue });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
export default router;
