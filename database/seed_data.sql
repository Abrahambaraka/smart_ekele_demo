-- Smart Ekele School Management System - Sample Data
-- This file contains sample data for testing and development

-- Insert sample users
INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, role, is_active) VALUES
('usr-002', 'director1', 'director@ecole1.cd', '$2b$10$xYzABCdefghijklmnopqrst', 'Jean', 'Kabongo', '+243900000002', 'school_director', TRUE),
('usr-003', 'teacher1', 'prof1@ecole1.cd', '$2b$10$xYzABCdefghijklmnopqrst', 'Marie', 'Tshilombo', '+243900000003', 'teacher', TRUE),
('usr-004', 'teacher2', 'prof2@ecole1.cd', '$2b$10$xYzABCdefghijklmnopqrst', 'Pierre', 'Mbuyi', '+243900000004', 'teacher', TRUE),
('usr-005', 'teacher3', 'prof3@ecole1.cd', '$2b$10$xYzABCdefghijklmnopqrst', 'Grace', 'Kalala', '+243900000005', 'teacher', TRUE);

-- Insert sample school
INSERT INTO schools (id, name, code, address, city, province, country, phone, email, director_id, is_active) VALUES
('sch-001', 'Complexe Scolaire Ekele', 'CS-EKELE-001', 'Avenue Kalemie No. 45', 'Lubumbashi', 'Haut-Katanga', 'RDC', '+243900000100', 'info@csekele.cd', 'usr-002', TRUE);

-- Insert school year
INSERT INTO school_years (id, school_id, name, start_date, end_date, is_current) VALUES
('sy-001', 'sch-001', '2024-2025', '2024-09-01', '2025-06-30', TRUE),
('sy-002', 'sch-001', '2023-2024', '2023-09-01', '2024-06-30', FALSE);

-- Insert classes
INSERT INTO classes (id, school_id, name, level, section, capacity, school_year_id) VALUES
('cls-001', 'sch-001', 'Primaire 1A', 'Primaire 1', 'A', 30, 'sy-001'),
('cls-002', 'sch-001', 'Primaire 2A', 'Primaire 2', 'A', 30, 'sy-001'),
('cls-003', 'sch-001', 'Secondaire 1 Scientifique', 'Secondaire 1', 'Scientifique', 35, 'sy-001'),
('cls-004', 'sch-001', 'Secondaire 2 Scientifique', 'Secondaire 2', 'Scientifique', 35, 'sy-001'),
('cls-005', 'sch-001', 'Secondaire 3 Littéraire', 'Secondaire 3', 'Littéraire', 30, 'sy-001');

-- Insert subjects
INSERT INTO subjects (id, school_id, name, code, description, coefficient) VALUES
('sub-001', 'sch-001', 'Mathématiques', 'MATH', 'Cours de mathématiques', 3.0),
('sub-002', 'sch-001', 'Français', 'FR', 'Langue française', 2.5),
('sub-003', 'sch-001', 'Physique', 'PHY', 'Sciences physiques', 2.5),
('sub-004', 'sch-001', 'Chimie', 'CHIM', 'Sciences chimiques', 2.0),
('sub-005', 'sch-001', 'Biologie', 'BIO', 'Sciences de la vie', 2.0),
('sub-006', 'sch-001', 'Histoire', 'HIST', 'Histoire générale', 1.5),
('sub-007', 'sch-001', 'Géographie', 'GEO', 'Géographie', 1.5),
('sub-008', 'sch-001', 'Anglais', 'ENG', 'Langue anglaise', 2.0),
('sub-009', 'sch-001', 'Éducation Civique', 'EDC', 'Éducation civique et morale', 1.0),
('sub-010', 'sch-001', 'Sport', 'EPS', 'Éducation physique et sportive', 1.0);

-- Insert teachers
INSERT INTO teachers (id, user_id, school_id, teacher_number, qualification, specialization, hire_date, salary, status) VALUES
('tch-001', 'usr-003', 'sch-001', 'PROF-001', 'Licence en Mathématiques', 'Mathématiques', '2020-09-01', 500000.00, 'active'),
('tch-002', 'usr-004', 'sch-001', 'PROF-002', 'Licence en Lettres', 'Français', '2019-09-01', 450000.00, 'active'),
('tch-003', 'usr-005', 'sch-001', 'PROF-003', 'Licence en Sciences', 'Physique-Chimie', '2021-09-01', 480000.00, 'active');

-- Insert teacher-subject assignments
INSERT INTO teacher_subjects (id, teacher_id, subject_id, class_id, school_year_id) VALUES
('ts-001', 'tch-001', 'sub-001', 'cls-003', 'sy-001'),
('ts-002', 'tch-001', 'sub-001', 'cls-004', 'sy-001'),
('ts-003', 'tch-002', 'sub-002', 'cls-003', 'sy-001'),
('ts-004', 'tch-002', 'sub-002', 'cls-004', 'sy-001'),
('ts-005', 'tch-003', 'sub-003', 'cls-003', 'sy-001'),
('ts-006', 'tch-003', 'sub-004', 'cls-004', 'sy-001');

-- Insert students
INSERT INTO students (id, school_id, student_number, first_name, last_name, date_of_birth, gender, address, city, phone, parent_name, parent_phone, class_id, enrollment_date, status) VALUES
('std-001', 'sch-001', 'STD-2024-001', 'Joseph', 'Mukendi', '2010-05-15', 'M', 'Avenue Lumumba 123', 'Lubumbashi', '+243900001001', 'Papa Mukendi', '+243900001000', 'cls-003', '2024-09-01', 'active'),
('std-002', 'sch-001', 'STD-2024-002', 'Miriam', 'Kasongo', '2010-08-22', 'F', 'Quartier Kenya', 'Lubumbashi', '+243900002001', 'Maman Kasongo', '+243900002000', 'cls-003', '2024-09-01', 'active'),
('std-003', 'sch-001', 'STD-2024-003', 'David', 'Kabila', '2009-11-10', 'M', 'Avenue Kabalo 45', 'Lubumbashi', '+243900003001', 'Papa Kabila', '+243900003000', 'cls-004', '2024-09-01', 'active'),
('std-004', 'sch-001', 'STD-2024-004', 'Sarah', 'Mujinga', '2009-03-18', 'F', 'Quartier Gambela', 'Lubumbashi', '+243900004001', 'Maman Mujinga', '+243900004000', 'cls-004', '2024-09-01', 'active'),
('std-005', 'sch-001', 'STD-2024-005', 'Emmanuel', 'Tshisekedi', '2011-07-05', 'M', 'Avenue Kasenga 78', 'Lubumbashi', '+243900005001', 'Papa Tshisekedi', '+243900005000', 'cls-001', '2024-09-01', 'active');

-- Insert fees
INSERT INTO fees (id, school_id, name, description, amount, fee_type, class_id, school_year_id, is_mandatory) VALUES
('fee-001', 'sch-001', 'Frais scolaires - 1er trimestre', 'Frais de scolarité du premier trimestre', 150000.00, 'frais_scolaires', NULL, 'sy-001', TRUE),
('fee-002', 'sch-001', 'Frais scolaires - 2e trimestre', 'Frais de scolarité du deuxième trimestre', 150000.00, 'frais_scolaires', NULL, 'sy-001', TRUE),
('fee-003', 'sch-001', 'Frais scolaires - 3e trimestre', 'Frais de scolarité du troisième trimestre', 150000.00, 'frais_scolaires', NULL, 'sy-001', TRUE),
('fee-004', 'sch-001', 'Frais inscription', 'Frais d\'inscription annuelle', 50000.00, 'inscription', NULL, 'sy-001', TRUE),
('fee-005', 'sch-001', 'Uniforme scolaire', 'Achat de l\'uniforme scolaire', 80000.00, 'uniforme', NULL, 'sy-001', FALSE);

-- Insert payments
INSERT INTO payments (id, student_id, fee_id, amount_paid, payment_date, payment_method, reference_number, status, recorded_by) VALUES
('pay-001', 'std-001', 'fee-004', 50000.00, '2024-09-05', 'mobile_money', 'MM-2024-0001', 'completed', 'usr-002'),
('pay-002', 'std-001', 'fee-001', 150000.00, '2024-09-10', 'cash', 'CASH-2024-0001', 'completed', 'usr-002'),
('pay-003', 'std-002', 'fee-004', 50000.00, '2024-09-06', 'mobile_money', 'MM-2024-0002', 'completed', 'usr-002'),
('pay-004', 'std-002', 'fee-001', 150000.00, '2024-09-12', 'bank_transfer', 'BT-2024-0001', 'completed', 'usr-002'),
('pay-005', 'std-003', 'fee-004', 50000.00, '2024-09-07', 'cash', 'CASH-2024-0002', 'completed', 'usr-002');

-- Insert grades
INSERT INTO grades (id, student_id, subject_id, class_id, school_year_id, exam_type, score, max_score, exam_date, teacher_id) VALUES
('grd-001', 'std-001', 'sub-001', 'cls-003', 'sy-001', 'interrogation', 15.00, 20.00, '2024-10-15', 'tch-001'),
('grd-002', 'std-001', 'sub-002', 'cls-003', 'sy-001', 'interrogation', 16.50, 20.00, '2024-10-16', 'tch-002'),
('grd-003', 'std-002', 'sub-001', 'cls-003', 'sy-001', 'interrogation', 18.00, 20.00, '2024-10-15', 'tch-001'),
('grd-004', 'std-002', 'sub-002', 'cls-003', 'sy-001', 'interrogation', 17.00, 20.00, '2024-10-16', 'tch-002'),
('grd-005', 'std-003', 'sub-001', 'cls-004', 'sy-001', 'devoir', 14.00, 20.00, '2024-10-20', 'tch-001');

-- Insert attendance records
INSERT INTO attendance (id, student_id, class_id, date, status, recorded_by) VALUES
('att-001', 'std-001', 'cls-003', '2024-11-01', 'present', 'usr-003'),
('att-002', 'std-002', 'cls-003', '2024-11-01', 'present', 'usr-003'),
('att-003', 'std-001', 'cls-003', '2024-11-04', 'absent', 'usr-003'),
('att-004', 'std-002', 'cls-003', '2024-11-04', 'present', 'usr-003'),
('att-005', 'std-003', 'cls-004', '2024-11-01', 'present', 'usr-004');

-- Insert timetable
INSERT INTO timetables (id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, school_year_id) VALUES
('tt-001', 'cls-003', 'sub-001', 'tch-001', 'lundi', '08:00:00', '09:30:00', 'Salle 101', 'sy-001'),
('tt-002', 'cls-003', 'sub-002', 'tch-002', 'lundi', '10:00:00', '11:30:00', 'Salle 102', 'sy-001'),
('tt-003', 'cls-003', 'sub-003', 'tch-003', 'mardi', '08:00:00', '09:30:00', 'Labo 1', 'sy-001'),
('tt-004', 'cls-004', 'sub-001', 'tch-001', 'mardi', '10:00:00', '11:30:00', 'Salle 201', 'sy-001'),
('tt-005', 'cls-004', 'sub-002', 'tch-002', 'mercredi', '08:00:00', '09:30:00', 'Salle 202', 'sy-001');

-- Insert notifications
INSERT INTO notifications (id, school_id, title, message, type, target_audience, priority, sent_by) VALUES
('not-001', 'sch-001', 'Rentrée scolaire 2024-2025', 'La rentrée scolaire aura lieu le 1er septembre 2024. Tous les élèves sont priés d\'être présents.', 'announcement', 'all', 'high', 'usr-002'),
('not-002', 'sch-001', 'Réunion des parents', 'Une réunion des parents d\'élèves est prévue le 15 septembre 2024 à 14h.', 'info', 'parents', 'medium', 'usr-002'),
('not-003', 'sch-001', 'Examens du 1er trimestre', 'Les examens du premier trimestre auront lieu du 10 au 20 novembre 2024.', 'urgent', 'all', 'high', 'usr-002');

-- Insert settings
INSERT INTO settings (id, school_id, setting_key, setting_value, data_type, description) VALUES
('set-001', 'sch-001', 'school_hours_start', '07:30:00', 'string', 'Heure de début des cours'),
('set-002', 'sch-001', 'school_hours_end', '15:30:00', 'string', 'Heure de fin des cours'),
('set-003', 'sch-001', 'passing_grade', '50', 'number', 'Note minimale de passage'),
('set-004', 'sch-001', 'max_absences', '10', 'number', 'Nombre maximum d\'absences autorisées'),
('set-005', 'sch-001', 'enable_sms_notifications', 'true', 'boolean', 'Activer les notifications SMS');
