-- Migration: Ajout du support multi-écoles complet
-- Date: 2024-11-17
-- Description: Ajoute school_id aux users pour isoler les données par école

-- 1. Pas besoin de modifier le rôle - on garde 'school_director' et 'teacher'
-- ALTER TABLE users MODIFY COLUMN role déjà OK

-- 2. Ajouter school_id à la table users (si elle n'existe pas déjà)
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'school_id';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN school_id VARCHAR(36) NULL AFTER role, ADD FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE',
  'SELECT "Column school_id already exists" AS status');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Créer des index pour améliorer les performances (ignore si existe déjà)
SET @idx1 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_school');
SET @sql1 = IF(@idx1 = 0, 'CREATE INDEX idx_users_school ON users(school_id)', 'SELECT "Index idx_users_school exists"');
PREPARE stmt1 FROM @sql1; EXECUTE stmt1; DEALLOCATE PREPARE stmt1;

SET @idx2 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND INDEX_NAME = 'idx_students_school');
SET @sql2 = IF(@idx2 = 0, 'CREATE INDEX idx_students_school ON students(school_id)', 'SELECT "Index idx_students_school exists"');
PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

SET @idx3 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'teachers' AND INDEX_NAME = 'idx_teachers_school');
SET @sql3 = IF(@idx3 = 0, 'CREATE INDEX idx_teachers_school ON teachers(school_id)', 'SELECT "Index idx_teachers_school exists"');
PREPARE stmt3 FROM @sql3; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

SET @idx4 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'classes' AND INDEX_NAME = 'idx_classes_school');
SET @sql4 = IF(@idx4 = 0, 'CREATE INDEX idx_classes_school ON classes(school_id)', 'SELECT "Index idx_classes_school exists"');
PREPARE stmt4 FROM @sql4; EXECUTE stmt4; DEALLOCATE PREPARE stmt4;

SET @idx5 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subjects' AND INDEX_NAME = 'idx_subjects_school');
SET @sql5 = IF(@idx5 = 0, 'CREATE INDEX idx_subjects_school ON subjects(school_id)', 'SELECT "Index idx_subjects_school exists"');
PREPARE stmt5 FROM @sql5; EXECUTE stmt5; DEALLOCATE PREPARE stmt5;

-- 4. Mise à jour des utilisateurs existants avec leur school_id
UPDATE users u
LEFT JOIN schools s ON s.director_id = u.id
SET u.school_id = s.id
WHERE u.role = 'school_director';

UPDATE users u
LEFT JOIN teachers t ON t.user_id = u.id
SET u.school_id = t.school_id
WHERE u.role = 'teacher';

-- 5. Mettre à jour les utilisateurs existants avec leur school_id
-- Les directeurs et professeurs doivent avoir un school_id
UPDATE users u
LEFT JOIN schools s ON s.director_id = u.id
SET u.school_id = s.id
WHERE u.role = 'Director';

UPDATE users u
LEFT JOIN teachers t ON t.user_id = u.id
SET u.school_id = t.school_id
WHERE u.role = 'Teacher';

-- 6. Créer une vue pour faciliter l'accès aux données des écoles
CREATE OR REPLACE VIEW v_school_stats AS
SELECT 
    s.id AS school_id,
    s.name AS school_name,
    s.code AS school_code,
    COUNT(DISTINCT st.id) AS total_students,
    COUNT(DISTINCT t.id) AS total_teachers,
    COUNT(DISTINCT c.id) AS total_classes,
    COUNT(DISTINCT CASE WHEN st.status = 'active' THEN st.id END) AS active_students
FROM schools s
LEFT JOIN students st ON st.school_id = s.id
LEFT JOIN teachers t ON t.school_id = s.id
LEFT JOIN classes c ON c.school_id = s.id
WHERE s.is_active = TRUE
GROUP BY s.id, s.name, s.code;

-- 7. Ajouter une contrainte pour s'assurer que les utilisateurs ont un school_id
DROP TRIGGER IF EXISTS before_user_insert;
DELIMITER $$
CREATE TRIGGER before_user_insert 
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.school_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'All users must have a school_id';
    END IF;
END$$
DELIMITER ;
DELIMITER ;

-- 8. Créer une table de logs pour tracer les accès multi-écoles (optionnel)
CREATE TABLE IF NOT EXISTS access_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    INDEX idx_access_logs_user (user_id),
    INDEX idx_access_logs_school (school_id),
    INDEX idx_access_logs_date (created_at)
);

-- 9. Ajouter une deuxième école pour démontrer le multi-écoles
-- Désactiver temporairement le trigger
DROP TRIGGER IF EXISTS before_user_insert;

-- Créer d'abord l'école SANS directeur
INSERT INTO schools (id, name, code, address, city, province, country, phone, email, is_active) 
VALUES
('sch-002', 'Lycée Moderne de Kinshasa', 'LYC-KIN-002', 'Avenue de la Libération 123', 'Kinshasa', 'Kinshasa', 'RDC', '+243900000200', 'info@lyceemodern.cd', TRUE);

-- Puis créer l'utilisateur avec school_id
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active, phone, school_id)
VALUES 
('usr-director-002', 'director2', 'directeur.lycee@smartekele.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marie', 'Kabila', 'school_director', TRUE, '+243900000202', 'sch-002');

-- Enfin mettre à jour l'école avec le director_id
UPDATE schools SET director_id = 'usr-director-002' WHERE id = 'sch-002';

-- Réactiver le trigger
DELIMITER $$
CREATE TRIGGER before_user_insert 
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.school_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'All users must have a school_id';
    END IF;
END$$
DELIMITER ;

-- Ajouter une année scolaire pour la deuxième école
INSERT INTO school_years (id, school_id, name, start_date, end_date, is_current) VALUES
('sy-003', 'sch-002', '2024-2025', '2024-09-01', '2025-06-30', TRUE);

-- Ajouter quelques classes pour la deuxième école
INSERT INTO classes (id, school_id, name, level, section, capacity, school_year_id) VALUES
('cls-101', 'sch-002', '6ème A', '6ème', 'A', 35, 'sy-003'),
('cls-102', 'sch-002', '5ème B', '5ème', 'B', 35, 'sy-003'),
('cls-103', 'sch-002', 'Terminale Scientifique', 'Terminale', 'Scientifique', 30, 'sy-003');

-- Ajouter un professeur pour la deuxième école
INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, role, is_active, school_id)
VALUES 
('usr-teacher-004', 'teacher4', 'prof.lycee@smartekele.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jacques', 'Lumbu', '+243900000304', 'teacher', TRUE, 'sch-002');

INSERT INTO teachers (id, user_id, school_id, teacher_number, qualification, specialization, hire_date, salary, status) VALUES
('tch-004', 'usr-teacher-004', 'sch-002', 'PROF-004', 'Licence en Histoire', 'Histoire-Géographie', '2022-09-01', 520000.00, 'active');

-- Ajouter quelques étudiants pour la deuxième école
INSERT INTO students (id, school_id, student_number, first_name, last_name, gender, class_id, status, enrollment_date) VALUES
('std-201', 'sch-002', 'LYC-2024-001', 'Joseph', 'Makasi', 'M', 'cls-101', 'active', '2024-09-01'),
('std-202', 'sch-002', 'LYC-2024-002', 'Grace', 'Nkulu', 'F', 'cls-101', 'active', '2024-09-01'),
('std-203', 'sch-002', 'LYC-2024-003', 'David', 'Tshisekedi', 'M', 'cls-102', 'active', '2024-09-01'),
('std-204', 'sch-002', 'LYC-2024-004', 'Sarah', 'Mwamba', 'F', 'cls-103', 'active', '2024-09-01'),
('std-205', 'sch-002', 'LYC-2024-005', 'Patrick', 'Kalonji', 'M', 'cls-103', 'active', '2024-09-01');

-- 10. Afficher les statistiques après migration
SELECT '=== MIGRATION TERMINÉE ===' AS status;
SELECT 'Total Schools:' AS metric, COUNT(*) AS value FROM schools;
SELECT 'Total Users:' AS metric, COUNT(*) AS value FROM users;
SELECT 'Directors:' AS metric, COUNT(*) AS value FROM users WHERE role = 'school_director';
SELECT 'Teachers:' AS metric, COUNT(*) AS value FROM users WHERE role = 'teacher';
SELECT * FROM v_school_stats;
