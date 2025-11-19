import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { repositories } from '../../database/db';

const router = Router();

// Get all students (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { school_id, class_id, status } = req.query;
    
    let students;
    if (school_id) {
      students = await repositories.students.findBySchool(school_id as string, status as string);
    } else if (class_id) {
      students = await repositories.students.findByClass(class_id as string);
    } else {
      students = await repositories.students.findAll();
    }

    res.json({
      success: true,
      data: students,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch students',
    });
  }
});

// Get student by ID with details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const student = await repositories.students.getStudentWithDetails(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch student',
    });
  }
});

// Create new student
router.post('/', authenticateToken, authorizeRoles('school_director'), async (req, res) => {
  try {
    const newStudent = await repositories.students.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: newStudent,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create student',
    });
  }
});

// Update student
router.put('/:id', authenticateToken, authorizeRoles('school_director'), async (req, res) => {
  try {
    const updatedStudent = await repositories.students.update(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update student',
    });
  }
});

// Delete student
router.delete('/:id', authenticateToken, authorizeRoles('school_director'), async (req, res) => {
  try {
    const deleted = await repositories.students.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete student',
    });
  }
});

export default router;
