import mysql from 'mysql2/promise';

// Configuration de la connexion à la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_ekele_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Créer le pool de connexions
const pool = mysql.createPool(dbConfig);

// Tester la connexion
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Exécuter une requête
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Exécuter une transaction
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Classe de base pour les repositories
export class BaseRepository {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async findById(id: string): Promise<any> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const results = await query(sql, [id]);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  async findAll(filters?: any): Promise<any[]> {
    let sql = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    if (filters && Object.keys(filters).length > 0) {
      const conditions = Object.keys(filters).map(key => `${key} = ?`);
      sql += ` WHERE ${conditions.join(' AND ')}`;
      params.push(...Object.values(filters));
    }

    return await query(sql, params);
  }

  async create(data: any): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    await query(sql, values);
    
    return data.id ? this.findById(data.id) : null;
  }

  async update(id: string, data: any): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    await query(sql, [...values, id]);
    
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const result: any = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  async count(filters?: any): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params: any[] = [];

    if (filters && Object.keys(filters).length > 0) {
      const conditions = Object.keys(filters).map(key => `${key} = ?`);
      sql += ` WHERE ${conditions.join(' AND ')}`;
      params.push(...Object.values(filters));
    }

    const results: any = await query(sql, params);
    return results[0]?.count || 0;
  }
}

// Repositories spécifiques

export class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<any> {
    const sql = `SELECT * FROM ${this.tableName} WHERE email = ?`;
    const results = await query(sql, [email]);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  async findByUsername(username: string): Promise<any> {
    const sql = `SELECT * FROM ${this.tableName} WHERE username = ?`;
    const results = await query(sql, [username]);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }

  async findByRole(role: string, schoolId?: string): Promise<any[]> {
    let sql = `SELECT * FROM ${this.tableName} WHERE role = ?`;
    const params: any[] = [role];

    if (schoolId) {
      sql += ` AND id IN (
        SELECT user_id FROM teachers WHERE school_id = ?
        UNION
        SELECT user_id FROM students WHERE school_id = ?
      )`;
      params.push(schoolId, schoolId);
    }

    return await query(sql, params);
  }
}

export class StudentRepository extends BaseRepository {
  constructor() {
    super('students');
  }

  async findByClass(classId: string): Promise<any[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE class_id = ? AND status = 'active'`;
    return await query(sql, [classId]);
  }

  async findBySchool(schoolId: string, status?: string): Promise<any[]> {
    let sql = `SELECT * FROM ${this.tableName} WHERE school_id = ?`;
    const params: any[] = [schoolId];

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }

    return await query(sql, params);
  }

  async getStudentWithDetails(studentId: string): Promise<any> {
    const sql = `
      SELECT 
        s.*,
        c.name as class_name,
        c.level,
        c.section,
        u.email as student_email
      FROM ${this.tableName} s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `;
    const results = await query(sql, [studentId]);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }
}

export class TeacherRepository extends BaseRepository {
  constructor() {
    super('teachers');
  }

  async findBySchool(schoolId: string, status?: string): Promise<any[]> {
    let sql = `
      SELECT t.*, u.first_name, u.last_name, u.email, u.phone
      FROM ${this.tableName} t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.school_id = ?
    `;
    const params: any[] = [schoolId];

    if (status) {
      sql += ` AND t.status = ?`;
      params.push(status);
    }

    return await query(sql, params);
  }

  async getTeacherSubjects(teacherId: string): Promise<any[]> {
    const sql = `
      SELECT 
        ts.*,
        s.name as subject_name,
        s.code as subject_code,
        c.name as class_name
      FROM teacher_subjects ts
      LEFT JOIN subjects s ON ts.subject_id = s.id
      LEFT JOIN classes c ON ts.class_id = c.id
      WHERE ts.teacher_id = ?
    `;
    return await query(sql, [teacherId]);
  }
}

export class GradeRepository extends BaseRepository {
  constructor() {
    super('grades');
  }

  async findByStudent(studentId: string, schoolYearId?: string): Promise<any[]> {
    let sql = `
      SELECT 
        g.*,
        s.name as subject_name,
        s.coefficient,
        t.first_name as teacher_first_name,
        t.last_name as teacher_last_name
      FROM ${this.tableName} g
      LEFT JOIN subjects s ON g.subject_id = s.id
      LEFT JOIN teachers te ON g.teacher_id = te.id
      LEFT JOIN users t ON te.user_id = t.id
      WHERE g.student_id = ?
    `;
    const params: any[] = [studentId];

    if (schoolYearId) {
      sql += ` AND g.school_year_id = ?`;
      params.push(schoolYearId);
    }

    sql += ` ORDER BY g.exam_date DESC`;
    return await query(sql, params);
  }

  async getClassAverages(classId: string, subjectId: string, examType: string): Promise<any> {
    const sql = `
      SELECT 
        AVG(score) as average,
        MAX(score) as highest,
        MIN(score) as lowest,
        COUNT(*) as total_students
      FROM ${this.tableName}
      WHERE class_id = ? AND subject_id = ? AND exam_type = ?
    `;
    const results = await query(sql, [classId, subjectId, examType]);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  }
}

export class PaymentRepository extends BaseRepository {
  constructor() {
    super('payments');
  }

  async findByStudent(studentId: string): Promise<any[]> {
    const sql = `
      SELECT 
        p.*,
        f.name as fee_name,
        f.amount as fee_amount
      FROM ${this.tableName} p
      LEFT JOIN fees f ON p.fee_id = f.id
      WHERE p.student_id = ?
      ORDER BY p.payment_date DESC
    `;
    return await query(sql, [studentId]);
  }

  async getSchoolRevenue(schoolId: string, dateFrom?: Date, dateTo?: Date): Promise<any> {
    let sql = `
      SELECT 
        SUM(p.amount_paid) as total_revenue,
        COUNT(*) as total_payments,
        p.payment_method
      FROM ${this.tableName} p
      JOIN students s ON p.student_id = s.id
      WHERE s.school_id = ? AND p.status = 'completed'
    `;
    const params: any[] = [schoolId];

    if (dateFrom) {
      sql += ` AND p.payment_date >= ?`;
      params.push(dateFrom);
    }

    if (dateTo) {
      sql += ` AND p.payment_date <= ?`;
      params.push(dateTo);
    }

    sql += ` GROUP BY p.payment_method`;
    return await query(sql, params);
  }
}

export class AttendanceRepository extends BaseRepository {
  constructor() {
    super('attendance');
  }

  async findByStudentAndDateRange(studentId: string, dateFrom: Date, dateTo: Date): Promise<any[]> {
    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE student_id = ? AND date BETWEEN ? AND ?
      ORDER BY date DESC
    `;
    return await query(sql, [studentId, dateFrom, dateTo]);
  }

  async getClassAttendance(classId: string, date: Date): Promise<any[]> {
    const sql = `
      SELECT 
        a.*,
        s.first_name,
        s.last_name,
        s.student_number
      FROM ${this.tableName} a
      LEFT JOIN students s ON a.student_id = s.id
      WHERE a.class_id = ? AND a.date = ?
    `;
    return await query(sql, [classId, date]);
  }

  async getAttendanceStatistics(studentId: string, schoolYearId: string): Promise<any> {
    const sql = `
      SELECT 
        status,
        COUNT(*) as count
      FROM ${this.tableName}
      WHERE student_id = ?
      GROUP BY status
    `;
    return await query(sql, [studentId]);
  }
}

// Exporter les instances des repositories
export const repositories = {
  users: new UserRepository(),
  students: new StudentRepository(),
  teachers: new TeacherRepository(),
  grades: new GradeRepository(),
  payments: new PaymentRepository(),
  attendance: new AttendanceRepository(),
};

export default pool;
