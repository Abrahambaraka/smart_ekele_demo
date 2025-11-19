import React, { useState, useEffect } from 'react';
import { classesAPI, teachersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ClassManagement: React.FC = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<any>(null);

    const [formData, setFormData] = useState({
        class_name: '',
        level: '',
        academic_year: '2024-2025',
        teacher_id: '',
        max_students: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [classesRes, teachersRes] = await Promise.all([
                classesAPI.getAll({ school_id: user?.schoolId?.toString() }),
                teachersAPI.getAll({ school_id: user?.schoolId?.toString() })
            ]);
            
            if (classesRes.success) setClasses(classesRes.data || []);
            if (teachersRes.success) setTeachers(teachersRes.data || []);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                school_id: user?.schoolId,
                teacher_id: formData.teacher_id ? parseInt(formData.teacher_id) : null,
                max_students: formData.max_students ? parseInt(formData.max_students) : null
            };

            const response = editingClass 
                ? await classesAPI.update(editingClass.id, payload)
                : await classesAPI.create(payload);
            
            if (response.success) {
                fetchData();
                setIsModalOpen(false);
                setEditingClass(null);
                resetForm();
            }
        } catch (error) {
            alert('Erreur lors de l\'enregistrement');
        }
    };

    const handleEdit = (cls: any) => {
        setEditingClass(cls);
        setFormData({
            class_name: cls.class_name,
            level: cls.level,
            academic_year: cls.academic_year,
            teacher_id: cls.teacher_id?.toString() || '',
            max_students: cls.max_students?.toString() || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Confirmer la suppression?')) {
            const response = await classesAPI.delete(id.toString());
            if (response.success) {
                setClasses(classes.filter(c => c.id !== id));
            }
        }
    };

    const resetForm = () => {
        setFormData({
            class_name: '',
            level: '',
            academic_year: '2024-2025',
            teacher_id: '',
            max_students: ''
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestion des Classes</h1>
                <button onClick={() => { setEditingClass(null); resetForm(); setIsModalOpen(true); }} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary">
                    + Ajouter une classe
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(cls => {
                    const teacher = teachers.find(t => t.id === cls.teacher_id);
                    return (
                        <div key={cls.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{cls.class_name}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{cls.level}</p>
                                </div>
                                <span className="px-3 py-1 bg-brand-primary text-white text-xs rounded-full">
                                    {cls.academic_year}
                                </span>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <p className="text-sm">
                                    <span className="font-medium">Titulaire:</span>{' '}
                                    {teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Non assigné'}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Effectif:</span>{' '}
                                    {cls.current_students || 0} / {cls.max_students || '∞'}
                                </p>
                            </div>

                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(cls)} className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    Modifier
                                </button>
                                <button onClick={() => handleDelete(cls.id)} className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editingClass ? 'Modifier' : 'Nouvelle'} Classe</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nom de la classe</label>
                                <input 
                                    type="text" 
                                    value={formData.class_name}
                                    onChange={(e) => setFormData({...formData, class_name: e.target.value})}
                                    required
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Niveau</label>
                                <input 
                                    type="text" 
                                    value={formData.level}
                                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                                    required
                                    placeholder="Ex: CP1, CE1, 6ème"
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Enseignant titulaire</label>
                                <select 
                                    value={formData.teacher_id}
                                    onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                >
                                    <option value="">Aucun</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Effectif maximum</label>
                                <input 
                                    type="number" 
                                    value={formData.max_students}
                                    onChange={(e) => setFormData({...formData, max_students: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => { setIsModalOpen(false); setEditingClass(null); resetForm(); }} className="px-4 py-2 bg-slate-200 rounded-md">
                                    Annuler
                                </button>
                                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md">
                                    {editingClass ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassManagement;
