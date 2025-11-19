import React, { useState, FormEvent, useMemo, useEffect } from 'react';
import { studentsAPI, classesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    class_id: number;
    enrollment_date: string;
    status: string;
    phone_number?: string;
    parent_name: string;
    parent_phone: string;
    parent_address: string;
}

interface Class {
    id: number;
    name: string;
    school_year_id: number;
}

const StudentManagement: React.FC = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter and Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Form state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: 'Male',
        class_id: '',
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'Active',
        phone_number: '',
        parent_name: '',
        parent_phone: '',
        parent_address: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [studentsRes, classesRes] = await Promise.all([
                studentsAPI.getAll({ school_id: user?.school_id }),
                classesAPI.getAll({ school_id: user?.school_id })
            ]);
            
            if (studentsRes.success) setStudents(studentsRes.data || []);
            if (classesRes.success) setClasses(classesRes.data || []);
        } catch (err) {
            setError('Erreur lors du chargement des données');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'Inactive': return 'bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-300';
            case 'Graduated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case 'Transferred': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredStudents = useMemo(() => {
        return students
            .filter(student =>
                `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(student =>
                filterClass === 'all' ? true : student.class_id === parseInt(filterClass)
            )
            .filter(student =>
                filterStatus === 'all' ? true : student.status === filterStatus
            );
    }, [students, searchTerm, filterClass, filterStatus]);

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            date_of_birth: '',
            gender: 'Male',
            class_id: classes[0]?.id?.toString() || '',
            enrollment_date: new Date().toISOString().split('T')[0],
            status: 'Active',
            phone_number: '',
            parent_name: '',
            parent_phone: '',
            parent_address: ''
        });
        setEditingStudent(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleEditClick = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            first_name: student.first_name,
            last_name: student.last_name,
            date_of_birth: student.date_of_birth,
            gender: student.gender,
            class_id: student.class_id.toString(),
            enrollment_date: student.enrollment_date,
            status: student.status,
            phone_number: student.phone_number || '',
            parent_name: student.parent_name,
            parent_phone: student.parent_phone,
            parent_address: student.parent_address
        });
        setIsModalOpen(true);
    };

    const handleDeleteStudent = async (studentId: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible.")) {
            try {
                const response = await studentsAPI.delete(studentId.toString());
                if (response.success) {
                    setStudents(students.filter(student => student.id !== studentId));
                }
            } catch (err) {
                alert('Erreur lors de la suppression');
                console.error(err);
            }
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!formData.first_name || !formData.last_name || !formData.class_id) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        try {
            const studentData = {
                ...formData,
                class_id: parseInt(formData.class_id),
                school_id: user?.school_id
            };

            if (editingStudent) {
                const response = await studentsAPI.update(editingStudent.id.toString(), studentData);
                if (response.success) {
                    setStudents(students.map(s => s.id === editingStudent.id ? response.data : s));
                }
            } else {
                const response = await studentsAPI.create(studentData);
                if (response.success) {
                    setStudents([response.data, ...students]);
                }
            }
            handleCloseModal();
        } catch (err) {
            alert('Erreur lors de l\'enregistrement');
            console.error(err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    const StudentModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 backdrop-blur-sm animate-fade-in" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-lg m-4 transform transition-all animate-scale-in">
                <div className="flex justify-between items-center border-b pb-3 mb-4 dark:border-slate-700">
                    <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">
                        {editingStudent ? "Modifier l'étudiant" : "Inscrire un nouvel étudiant"}
                    </h3>
                    <button onClick={handleCloseModal} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" aria-label="Close modal">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-2">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prénom</label>
                                <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
                                <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date de naissance</label>
                                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Genre</label>
                                <select name="gender" value={formData.gender} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                    <option value="Male">Masculin</option>
                                    <option value="Female">Féminin</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Téléphone (Étudiant)</label>
                            <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom du parent</label>
                            <input type="text" name="parent_name" value={formData.parent_name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Téléphone du parent</label>
                            <input type="tel" name="parent_phone" value={formData.parent_phone} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adresse du parent</label>
                            <input type="text" name="parent_address" value={formData.parent_address} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Classe</label>
                                <select name="class_id" value={formData.class_id} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                    {classes.length === 0 && <option disabled>Aucune classe disponible</option>}
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statut</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                    <option value="Active">Actif</option>
                                    <option value="Inactive">Inactif</option>
                                    <option value="Graduated">Diplômé</option>
                                    <option value="Transferred">Transféré</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date d'inscription</label>
                            <input type="date" name="enrollment_date" value={formData.enrollment_date} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4 border-t pt-4 dark:border-slate-700">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-offset-gray-800">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 transition-colors shadow-md hover:shadow-lg">
                            {editingStudent ? 'Sauvegarder' : 'Inscrire'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 p-2 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Gestion des Étudiants</h1>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">{filteredStudents.length} étudiant(s) au total</p>
                </div>
                <button onClick={handleOpenAddModal} className="w-full sm:w-auto px-4 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Inscrire un étudiant
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rechercher</label>
                        <input type="text" placeholder="Nom de l'étudiant..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Filtrer par classe</label>
                        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="all">Toutes les classes</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Filtrer par statut</label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="all">Tous les statuts</option>
                            <option value="Active">Actif</option>
                            <option value="Inactive">Inactif</option>
                            <option value="Graduated">Diplômé</option>
                            <option value="Transferred">Transféré</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Étudiant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Classe</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredStudents.map(student => {
                                const studentClass = classes.find(c => c.id === student.class_id);
                                return (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                {student.first_name} {student.last_name}
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">{student.phone_number}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                                            {studentClass?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900 dark:text-slate-100">{student.parent_name}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">{student.parent_phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(student.status)}`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button onClick={() => handleEditClick(student)} className="text-brand-primary hover:text-brand-secondary transition-colors">
                                                Modifier
                                            </button>
                                            <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredStudents.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-slate-500 dark:text-slate-400">Aucun étudiant trouvé</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && <StudentModal />}
        </div>
    );
};

export default StudentManagement;
