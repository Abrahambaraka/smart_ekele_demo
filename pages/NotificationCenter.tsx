import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const NotificationCenter: React.FC = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterAudience, setFilterAudience] = useState('all');

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        target_audience: 'All',
        target_id: ''
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationsAPI.getAll({ school_id: user?.schoolId?.toString() });
            if (response.success) {
                setNotifications(response.data || []);
            }
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
                sender_id: user?.id,
                target_id: formData.target_id ? parseInt(formData.target_id) : null
            };

            const response = await notificationsAPI.create(payload);
            
            if (response.success) {
                setNotifications([response.data, ...notifications]);
                setIsModalOpen(false);
                resetForm();
            }
        } catch (error) {
            alert('Erreur lors de l\'envoi de la notification');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            target_audience: 'All',
            target_id: ''
        });
    };

    const filteredNotifications = filterAudience === 'all' 
        ? notifications 
        : notifications.filter(n => n.target_audience === filterAudience);

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
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Centre de Notifications</h1>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary">
                    + Nouvelle notification
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Filtrer par audience</label>
                    <select 
                        value={filterAudience}
                        onChange={(e) => setFilterAudience(e.target.value)}
                        className="px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
                    >
                        <option value="all">Toutes les audiences</option>
                        <option value="All">Tous</option>
                        <option value="Directors">Directeurs</option>
                        <option value="Teachers">Enseignants</option>
                        <option value="Class">Classe spécifique</option>
                    </select>
                </div>

                <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">Aucune notification disponible</p>
                    ) : (
                        filteredNotifications.map(notif => (
                            <div key={notif.id} className="border dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{notif.title}</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-3 py-1 text-xs rounded-full ${
                                            notif.target_audience === 'All' ? 'bg-purple-100 text-purple-800' :
                                            notif.target_audience === 'Directors' ? 'bg-blue-100 text-blue-800' :
                                            notif.target_audience === 'Teachers' ? 'bg-green-100 text-green-800' :
                                            'bg-orange-100 text-orange-800'
                                        }`}>
                                            {notif.target_audience}
                                        </span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            notif.is_read ? 'bg-slate-200 text-slate-600' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {notif.is_read ? 'Lu' : 'Non lu'}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mb-2">{notif.message}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {new Date(notif.created_at).toLocaleString('fr-FR')}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Nouvelle Notification</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Titre</label>
                                <input 
                                    type="text" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea 
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    required
                                    rows={4}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Audience cible</label>
                                <select 
                                    value={formData.target_audience}
                                    onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                >
                                    <option value="All">Tous</option>
                                    <option value="Directors">Directeurs</option>
                                    <option value="Teachers">Enseignants</option>
                                    <option value="Class">Classe spécifique</option>
                                </select>
                            </div>
                            {formData.target_audience === 'Class' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">ID de la classe</label>
                                    <input 
                                        type="number" 
                                        value={formData.target_id}
                                        onChange={(e) => setFormData({...formData, target_id: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                    />
                                </div>
                            )}
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 bg-slate-200 rounded-md">
                                    Annuler
                                </button>
                                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md">
                                    Envoyer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
