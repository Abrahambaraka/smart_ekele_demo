import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../contexts/AuthContext';
import { reportsAPI, studentsAPI, teachersAPI, classesAPI, paymentsAPI } from '../services/api';

const SchoolDirectorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        if (!user?.schoolId) return;
        
        try {
            setLoading(true);
            const [comprehensiveRes, studentsRes, paymentsRes] = await Promise.all([
                reportsAPI.getComprehensive(user.schoolId.toString()),
                studentsAPI.getAll({ school_id: user.schoolId.toString() }),
                paymentsAPI.getAll()
            ]);

            if (comprehensiveRes.success) setStats(comprehensiveRes.data);
            if (studentsRes.success) setStudents(studentsRes.data || []);
            if (paymentsRes.success) setPayments(paymentsRes.data || []);
        } catch (error) {
            console.error('Erreur lors du chargement du dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    const recentStudents = students
        .sort((a: any, b: any) => new Date(b.enrollment_date).getTime() - new Date(a.enrollment_date).getTime())
        .slice(0, 5);

    const recentPayments = payments
        .sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
        .slice(0, 5);

    const totalRevenue = payments
        .filter((p: any) => p.status === 'Completed')
        .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

    const quickLinks = [
        { path: '/student-management', label: 'Gestion Étudiants', icon: 'fas fa-user-graduate' },
        { path: '/payment-management', label: 'Gestion Financière', icon: 'fas fa-file-invoice-dollar' },
        { path: '/class-management', label: 'Gestion des Classes', icon: 'fas fa-chalkboard-user' },
        { path: '/reports-dashboard', label: 'Voir les Rapports', icon: 'fas fa-chart-pie' },
    ];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">
                Tableau de Bord Directeur
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <DashboardCard 
                    title="Étudiants Inscrits" 
                    value={stats?.students?.total || students.length} 
                    icon={<i className="fas fa-user-graduate"></i>} 
                    color="bg-gradient-to-br from-blue-400 to-blue-600" 
                />
                <DashboardCard 
                    title="Étudiants Actifs" 
                    value={stats?.students?.active || students.filter((s: any) => s.status === 'Active').length} 
                    icon={<i className="fas fa-user-check"></i>} 
                    color="bg-gradient-to-br from-green-400 to-green-600" 
                />
                <DashboardCard 
                    title="Taux de Présence" 
                    value={`${stats?.attendance?.attendance_rate || 0}%`} 
                    icon={<i className="fas fa-calendar-check"></i>} 
                    color="bg-gradient-to-br from-purple-400 to-purple-600" 
                />
                <DashboardCard 
                    title="Revenu Total" 
                    value={`$${(totalRevenue/1000).toFixed(1)}k`} 
                    icon={<i className="fas fa-dollar-sign"></i>} 
                    color="bg-gradient-to-br from-yellow-400 to-yellow-600" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Inscriptions Récentes</h2>
                    <div className="space-y-3">
                        {recentStudents.length === 0 ? (
                            <p className="text-slate-500">Aucune inscription récente</p>
                        ) : (
                            recentStudents.map((student: any) => (
                                <div key={student.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                    <div>
                                        <p className="font-medium">{student.first_name} {student.last_name}</p>
                                        <p className="text-sm text-slate-500">{new Date(student.enrollment_date).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                    <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                        {student.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Paiements Récents</h2>
                    <div className="space-y-3">
                        {recentPayments.length === 0 ? (
                            <p className="text-slate-500">Aucun paiement récent</p>
                        ) : (
                            recentPayments.map((payment: any) => (
                                <div key={payment.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                    <div>
                                        <p className="font-medium">{payment.payment_type}</p>
                                        <p className="text-sm text-slate-500">{new Date(payment.payment_date).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                    <span className="font-bold text-green-600">${parseFloat(payment.amount).toFixed(2)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Accès Rapide</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickLinks.map((link, index) => (
                        <Link 
                            key={index} 
                            to={link.path}
                            className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-brand-primary hover:text-white transition-all duration-200 group"
                        >
                            <i className={`${link.icon} text-3xl mb-3 text-brand-primary group-hover:text-white`}></i>
                            <span className="text-sm font-medium text-center">{link.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SchoolDirectorDashboard;
