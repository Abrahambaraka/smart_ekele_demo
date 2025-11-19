import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { repositories } from '../../database/db';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await repositories.users.findAll();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await repositories.users.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', authenticateToken, authorizeRoles('school_director'), async (req, res) => {
  try {
    const user = await repositories.users.update(req.params.id, req.body);
    res.json({ success: true, message: 'User updated', data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('school_director'), async (req, res) => {
  try {
    const deleted = await repositories.users.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
