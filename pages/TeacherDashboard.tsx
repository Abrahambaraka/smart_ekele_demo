import React, { useState, useEffect } from 'react';
import { teachersAPI, classesAPI, gradesAPI, attendanceAPI, studentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [teacher, setTeacher] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);

    const [gradeForm, setGradeForm] = useState({
        student_id: '',
        subject_id: '',
        grade_type: 'Quiz',
        score: '',
        max_score: '100'
    });

    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchTeacherData();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchClassStudents(selectedClass.id);
        }
    }, [selectedClass]);

    const fetchTeacherData = async () => {
        try {
            setLoading(true);
            const teachersRes = await teachersAPI.getAll({ school_id: user?.schoolId?.toString() });
            
            if (teachersRes.success) {
                const teacherData = teachersRes.data?.find((t: any) => t.email === user?.email);
                setTeacher(teacherData);
                
                if (teacherData) {
                    const classesRes = await classesAPI.getAll({ teacher_id: teacherData.id.toString() });
                    if (classesRes.success) {
                        setClasses(classesRes.data || []);
                        if (classesRes.data && classesRes.data.length > 0) {
                            setSelectedClass(classesRes.data[0]);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClassStudents = async (classId: number) => {
        try {
            const response = await studentsAPI.getAll({ class_id: classId.toString() });
            if (response.success) {
                setStudents(response.data || []);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleSubmitGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await gradesAPI.create({
                ...gradeForm,
                student_id: parseInt(gradeForm.student_id),
                subject_id: parseInt(gradeForm.subject_id),
                score: parseFloat(gradeForm.score),
                max_score: parseFloat(gradeForm.max_score),
                class_id: selectedClass.id,
                academic_year: selectedClass.academic_year
            });
            
            if (response.success) {
                alert('Note enregistrée avec succès');
                setShowGradeModal(false);
                setGradeForm({ student_id: '', subject_id: '', grade_type: 'Quiz', score: '', max_score: '100' });
            }
        } catch (error) {
            alert('Erreur lors de l\'enregistrement de la note');
        }
    };

    const handleMarkAttendance = async (studentId: number, status: string) => {
        try {
            const response = await attendanceAPI.create({
                student_id: studentId,
                class_id: selectedClass.id,
                attendance_date: attendanceDate,
                status
            });
            
            if (response.success) {
                alert('Présence enregistrée');
            }
        } catch (error) {
            alert('Erreur lors de l\'enregistrement de la présence');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="p-6">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
                    Aucune donnée d'enseignant trouvée pour cet utilisateur.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Tableau de Bord Enseignant</h1>
                <p className="text-slate-600 dark:text-slate-400">Bienvenue, {teacher.first_name} {teacher.last_name}</p>
            </div>

            {/* Teacher Info */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Informations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Spécialité</p>
                        <p className="font-semibold">{teacher.specialization || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                        <p className="font-semibold">{teacher.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Classes</p>
                        <p className="font-semibold">{classes.length}</p>
                    </div>
                </div>
            </div>

            {/* Class Selector */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <label className="block text-sm font-medium mb-2">Sélectionner une classe</label>
                <select 
                    value={selectedClass?.id || ''}
                    onChange={(e) => setSelectedClass(classes.find(c => c.id === parseInt(e.target.value)))}
                    className="w-full md:w-auto px-4 py-2 border rounded-md dark:bg-slate-700"
                    aria-label="Sélectionner une classe"
                >
                    {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.class_name} - {cls.level}</option>
                    ))}
                </select>
            </div>

            {selectedClass && (
                <>
                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => setShowGradeModal(true)} className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold">
                            📝 Saisir des Notes
                        </button>
                        <button onClick={() => setShowAttendanceModal(true)} className="px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold">
                            ✓ Marquer la Présence
                        </button>
                    </div>

                    {/* Students List */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Étudiants de {selectedClass.class_name}</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nom</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {students.map(student => (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4">{student.first_name} {student.last_name}</td>
                                            <td className="px-6 py-4">{student.email || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    student.enrollment_status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {student.enrollment_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Grade Modal */}
            {showGradeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Saisir une Note</h2>
                        <form onSubmit={handleSubmitGrade} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Étudiant</label>
                                <select 
                                    value={gradeForm.student_id}
                                    onChange={(e) => setGradeForm({...gradeForm, student_id: e.target.value})}
                                    required
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                    aria-label="Sélectionner un étudiant"
                                >
                                    <option value="">Sélectionner un étudiant</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Type d'évaluation</label>
                                <select 
                                    value={gradeForm.grade_type}
                                    onChange={(e) => setGradeForm({...gradeForm, grade_type: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                    aria-label="Type d'évaluation"
                                >
                                    <option value="Quiz">Quiz</option>
                                    <option value="Exam">Examen</option>
                                    <option value="Assignment">Devoir</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Note</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={gradeForm.score}
                                        onChange={(e) => setGradeForm({...gradeForm, score: e.target.value})}
                                        required
                                        className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                        aria-label="Note obtenue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sur</label>
                                    <input 
                                        type="number" 
                                        value={gradeForm.max_score}
                                        onChange={(e) => setGradeForm({...gradeForm, max_score: e.target.value})}
                                        required
                                        className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                        aria-label="Note maximale"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setShowGradeModal(false)} className="px-4 py-2 bg-slate-200 rounded-md">
                                    Annuler
                                </button>
                                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md">
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Attendance Modal */}
            {showAttendanceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl">
                        <h2 className="text-xl font-bold mb-4">Marquer la Présence</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input 
                                type="date" 
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                className="px-3 py-2 border rounded-md dark:bg-slate-700"
                                aria-label="Date de présence"
                            />
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {students.map(student => (
                                <div key={student.id} className="flex justify-between items-center p-3 border rounded-lg dark:border-slate-700">
                                    <span>{student.first_name} {student.last_name}</span>
                                    <div className="space-x-2">
                                        <button onClick={() => handleMarkAttendance(student.id, 'Present')} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                                            Présent
                                        </button>
                                        <button onClick={() => handleMarkAttendance(student.id, 'Absent')} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                                            Absent
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end mt-4">
                            <button onClick={() => setShowAttendanceModal(false)} className="px-4 py-2 bg-slate-200 rounded-md">
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
