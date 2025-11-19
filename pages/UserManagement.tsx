import React, { useState, useEffect } from 'react';
import { usersAPI, schoolsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const UserManagement: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [schools, setSchools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [filterRole, setFilterRole] = useState('all');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'Teacher',
        school_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const usersRes = await usersAPI.getAll();
            const schoolsRes = user?.role === 'school_director' ? await schoolsAPI.getAll() : { success: true, data: [] };
            
            if (usersRes.success) {
                let filteredUsers = usersRes.data || [];
                if (user?.role === 'school_director') {
                    filteredUsers = filteredUsers.filter((u: any) => u.school_id === user.school_id);
                }
                setUsers(filteredUsers);
            }
            if (schoolsRes.success) setSchools(schoolsRes.data || []);
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
                school_id: formData.school_id || (user?.school_id || '')
            };

            const response = editingUser 
                ? await usersAPI.update(editingUser.id, payload)
                : await usersAPI.create(payload);
            
            if (response.success) {
                fetchData();
                setIsModalOpen(false);
                setEditingUser(null);
                resetForm();
            }
        } catch (error) {
            alert('Erreur lors de l\'enregistrement');
        }
    };

    const handleEdit = (usr: any) => {
        setEditingUser(usr);
        setFormData({
            username: usr.username,
            email: usr.email,
            password: '',
            first_name: usr.first_name,
            last_name: usr.last_name,
            role: usr.role,
            school_id: usr.school_id?.toString() || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Confirmer la suppression?')) {
            const response = await usersAPI.delete(id);
            if (response.success) {
                setUsers(users.filter(u => u.id !== id));
            }
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            role: 'Teacher',
            school_id: user?.school_id || ''
        });
    };

    const filteredUsers = filterRole === 'all' ? users : users.filter(u => u.role === filterRole);

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
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestion des Utilisateurs</h1>
                <button onClick={() => { setEditingUser(null); resetForm(); setIsModalOpen(true); }} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary">
                    + Ajouter un utilisateur
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Filtrer par rôle</label>
                    <select 
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
                    >
                        <option value="all">Tous les rôles</option>
                        <option value="SuperAdmin">Super Admin</option>
                        <option value="Director">Directeur</option>
                        <option value="Teacher">Enseignant</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nom complet</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rôle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredUsers.map(usr => (
                                <tr key={usr.id}>
                                    <td className="px-6 py-4">
                                        {usr.first_name} {usr.last_name}
                                    </td>
                                    <td className="px-6 py-4">{usr.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            usr.role === 'SuperAdmin' ? 'bg-purple-100 text-purple-800' :
                                            usr.role === 'Director' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {usr.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => handleEdit(usr)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                            Modifier
                                        </button>
                                        <button onClick={() => handleDelete(usr.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editingUser ? 'Modifier' : 'Nouvel'} Utilisateur</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Prénom</label>
                                    <input 
                                        type="text" 
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                        required
                                        className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nom</label>
                                    <input 
                                        type="text" 
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                        required
                                        className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nom d'utilisateur</label>
                                <input 
                                    type="text" 
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    required
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                />
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mot de passe</label>
                                    <input 
                                        type="password" 
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        required={!editingUser}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-1">Rôle</label>
                                <select 
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                >
                                    <option value="school_director">Directeur</option>
                                    <option value="teacher">Professeur</option>
                                    <option value="school_director">Directeur</option>
                                    <option value="teacher">Enseignant</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => { setIsModalOpen(false); setEditingUser(null); resetForm(); }} className="px-4 py-2 bg-slate-200 rounded-md">
                                    Annuler
                                </button>
                                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md">
                                    {editingUser ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
