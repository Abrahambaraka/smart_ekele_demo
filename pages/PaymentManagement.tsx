import React, { useState, useEffect } from 'react';
import { paymentsAPI, studentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PaymentManagement: React.FC = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [formData, setFormData] = useState({
        student_id: '',
        amount: '',
        payment_type: 'Tuition',
        payment_method: 'Cash',
        payment_date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [paymentsRes, studentsRes] = await Promise.all([
                paymentsAPI.getAll(),
                studentsAPI.getAll({ school_id: user?.schoolId?.toString() })
            ]);
            
            if (paymentsRes.success) setPayments(paymentsRes.data || []);
            if (studentsRes.success) setStudents(studentsRes.data || []);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await paymentsAPI.create({
                ...formData,
                student_id: parseInt(formData.student_id),
                amount: parseFloat(formData.amount)
            });
            
            if (response.success) {
                setPayments([response.data, ...payments]);
                setIsModalOpen(false);
                resetForm();
            }
        } catch (error) {
            alert('Erreur lors de l\'enregistrement');
        }
    };

    const resetForm = () => {
        setFormData({
            student_id: '',
            amount: '',
            payment_type: 'Tuition',
            payment_method: 'Cash',
            payment_date: new Date().toISOString().split('T')[0],
            status: 'Completed',
            notes: ''
        });
    };

    const filteredPayments = payments.filter(p => {
        const student = students.find(s => s.id === p.student_id);
        const studentName = student ? `${student.first_name} ${student.last_name}` : '';
        const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalRevenue = payments
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

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
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestion des Paiements</h1>
                    <p className="text-slate-600 dark:text-slate-400">Revenu total: ${totalRevenue.toFixed(2)}</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary">
                    + Ajouter un paiement
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <input 
                        type="text" 
                        placeholder="Rechercher un étudiant..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
                    />
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="Completed">Complété</option>
                        <option value="Pending">En attente</option>
                        <option value="Failed">Échoué</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Étudiant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Montant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredPayments.map(payment => {
                                const student = students.find(s => s.id === payment.student_id);
                                return (
                                    <tr key={payment.id}>
                                        <td className="px-6 py-4">
                                            {student ? `${student.first_name} ${student.last_name}` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">{payment.payment_type}</td>
                                        <td className="px-6 py-4 font-bold text-green-600">${parseFloat(payment.amount).toFixed(2)}</td>
                                        <td className="px-6 py-4">{new Date(payment.payment_date).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                payment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Nouveau Paiement</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Étudiant</label>
                                <select 
                                    value={formData.student_id}
                                    onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                                    required
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                >
                                    <option value="">Sélectionner un étudiant</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Montant</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    required
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Type de paiement</label>
                                <select 
                                    value={formData.payment_type}
                                    onChange={(e) => setFormData({...formData, payment_type: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                                >
                                    <option value="Tuition">Scolarité</option>
                                    <option value="Fees">Frais</option>
                                    <option value="Other">Autre</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-md">
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
        </div>
    );
};

export default PaymentManagement;
