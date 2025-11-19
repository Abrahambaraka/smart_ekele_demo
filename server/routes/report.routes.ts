import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import pool from '../../database/db';

const router = Router();

// Get student statistics
router.get('/students/:school_id', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_count,
        COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_count,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_students,
        COUNT(CASE WHEN status = 'Inactive' THEN 1 END) as inactive_students
      FROM students 
      WHERE school_id = ?`,
      [req.params.school_id]
    );
    res.json({ success: true, data: stats[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get attendance statistics
router.get('/attendance/:school_id', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN status = 'Late' THEN 1 END) as late_count,
        ROUND((COUNT(CASE WHEN status = 'Present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_rate
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE s.school_id = ? 
      ${start_date ? 'AND a.date >= ?' : ''}
      ${end_date ? 'AND a.date <= ?' : ''}`,
      [req.params.school_id, start_date, end_date].filter(Boolean)
    );
    res.json({ success: true, data: stats[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get grade statistics
router.get('/grades/:school_id', authenticateToken, async (req, res) => {
  try {
    const { school_year_id } = req.query;
    const [stats] = await pool.query(
      `SELECT 
        AVG(g.score) as average_score,
        MIN(g.score) as min_score,
        MAX(g.score) as max_score,
        COUNT(*) as total_grades,
        COUNT(CASE WHEN g.score >= 90 THEN 1 END) as A_count,
        COUNT(CASE WHEN g.score >= 80 AND g.score < 90 THEN 1 END) as B_count,
        COUNT(CASE WHEN g.score >= 70 AND g.score < 80 THEN 1 END) as C_count,
        COUNT(CASE WHEN g.score >= 60 AND g.score < 70 THEN 1 END) as D_count,
        COUNT(CASE WHEN g.score < 60 THEN 1 END) as F_count
      FROM grades g
      JOIN students s ON g.student_id = s.id
      WHERE s.school_id = ?
      ${school_year_id ? 'AND g.school_year_id = ?' : ''}`,
      [req.params.school_id, school_year_id].filter(Boolean)
    );
    res.json({ success: true, data: stats[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get payment/revenue statistics
router.get('/payments/:school_id', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const [stats] = await pool.query(
      `SELECT 
        SUM(amount) as total_revenue,
        COUNT(*) as total_transactions,
        AVG(amount) as average_payment,
        COUNT(CASE WHEN payment_type = 'Tuition' THEN 1 END) as tuition_count,
        SUM(CASE WHEN payment_type = 'Tuition' THEN amount ELSE 0 END) as tuition_revenue,
        COUNT(CASE WHEN payment_type = 'Fees' THEN 1 END) as fees_count,
        SUM(CASE WHEN payment_type = 'Fees' THEN amount ELSE 0 END) as fees_revenue,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN status = 'Failed' THEN 1 END) as failed_payments
      FROM payments p
      JOIN students s ON p.student_id = s.id
      WHERE s.school_id = ?
      ${start_date ? 'AND p.payment_date >= ?' : ''}
      ${end_date ? 'AND p.payment_date <= ?' : ''}`,
      [req.params.school_id, start_date, end_date].filter(Boolean)
    );
    res.json({ success: true, data: stats[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get teacher statistics
router.get('/teachers/:school_id', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(DISTINCT t.id) as total_teachers,
        COUNT(DISTINCT ts.subject_id) as subjects_covered,
        COUNT(DISTINCT c.id) as classes_assigned
      FROM teachers t
      LEFT JOIN teacher_subjects ts ON t.id = ts.teacher_id
      LEFT JOIN classes c ON t.id = c.teacher_id
      WHERE t.school_id = ?`,
      [req.params.school_id]
    );
    res.json({ success: true, data: stats[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get comprehensive school report
router.get('/school/:school_id/comprehensive', authenticateToken, async (req, res) => {
  try {
    const { school_year_id } = req.query;
    
    // Run multiple queries in parallel
    const [studentStats] = await pool.query(
      `SELECT COUNT(*) as total, 
       COUNT(CASE WHEN status = 'Active' THEN 1 END) as active 
       FROM students WHERE school_id = ?`,
      [req.params.school_id]
    );

    const [gradeStats] = await pool.query(
      `SELECT AVG(g.score) as avg_score 
       FROM grades g 
       JOIN students s ON g.student_id = s.id 
       WHERE s.school_id = ? ${school_year_id ? 'AND g.school_year_id = ?' : ''}`,
      [req.params.school_id, school_year_id].filter(Boolean)
    );

    const [paymentStats] = await pool.query(
      `SELECT SUM(p.amount) as total_revenue 
       FROM payments p 
       JOIN students s ON p.student_id = s.id 
       WHERE s.school_id = ? AND p.status = 'Completed'`,
      [req.params.school_id]
    );

    const [attendanceStats] = await pool.query(
      `SELECT 
        ROUND((COUNT(CASE WHEN a.status = 'Present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_rate
       FROM attendance a 
       JOIN students s ON a.student_id = s.id 
       WHERE s.school_id = ?`,
      [req.params.school_id]
    );

    res.json({
      success: true,
      data: {
        students: studentStats[0],
        grades: gradeStats[0],
        payments: paymentStats[0],
        attendance: attendanceStats[0]
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
