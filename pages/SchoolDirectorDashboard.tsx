
import React from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import { MOCK_SCHOOLS, MOCK_PAYMENTS, MOCK_STUDENTS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { PaymentStatus } from '../types';

const SchoolDirectorDashboard: React.FC = () => {
    const { user } = useAuth();
    const mySchool = MOCK_SCHOOLS.find(s => s.id === user?.schoolId);

    if (!mySchool) {
        return <div className="text-center text-red-500">Erreur : Aucune école associée à ce directeur.</div>;
    }

    const totalRevenue = MOCK_PAYMENTS.filter(p => p.status === PaymentStatus.PAID).reduce((sum, p) => sum + p.amount, 0);

    const enrollmentData = [
        { name: 'Jan', Inscriptions: 15 }, { name: 'Fév', Inscriptions: 20 },
        { name: 'Mar', Inscriptions: 18 }, { name: 'Avr', Inscriptions: 25 },
        { name: 'Mai', Inscriptions: 30 }, { name: 'Juin', Inscriptions: 22 },
    ];

    const monthlyPaymentsData = [
        { name: 'Juil \'23', 'Paiements Reçus': 4000 }, { name: 'Août \'23', 'Paiements Reçus': 3000 },
        { name: 'Sep \'23', 'Paiements Reçus': 5000 }, { name: 'Oct \'23', 'Paiements Reçus': 4500 },
        { name: 'Nov \'23', 'Paiements Reçus': 6000 }, { name: 'Déc \'23', 'Paiements Reçus': 5500 },
        { name: 'Jan \'24', 'Paiements Reçus': 7000 }, { name: 'Fév \'24', 'Paiements Reçus': 6500 },
        { name: 'Mar \'24', 'Paiements Reçus': 8000 }, { name: 'Avr \'24', 'Paiements Reçus': 7500 },
        { name: 'Mai \'24', 'Paiements Reçus': 9000 }, { name: 'Juin \'24', 'Paiements Reçus': 8500 },
    ];
    
    const recentPayments = MOCK_PAYMENTS.slice(0, 3);
    const recentEnrollments = [...MOCK_STUDENTS]
        .sort((a, b) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime())
        .slice(0, 2);

    const recentActivities = [
        ...recentPayments.map(p => ({
            type: 'payment',
            text: `Paiement reçu de ${MOCK_STUDENTS.find(s => s.id === p.studentId)?.name || 'N/A'}`,
            value: `$${p.amount.toFixed(2)}`,
            date: new Date(p.dueDate),
            icon: 'fas fa-dollar-sign'
        })),
        ...recentEnrollments.map(s => ({
            type: 'enrollment',
            text: `Nouvelle inscription`,
            value: s.name,
            date: new Date(s.enrollmentDate),
            icon: 'fas fa-user-plus'
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
    
    const quickLinks = [
        { path: '/student-management', label: 'Gestion Étudiants', icon: 'fas fa-user-graduate' },
        { path: '/payment-management', label: 'Gestion Financière', icon: 'fas fa-file-invoice-dollar' },
        { path: '/class-management', label: 'Gestion des Classes', icon: 'fas fa-chalkboard-user' },
        { path: '/reports-dashboard', label: 'Voir les Rapports', icon: 'fas fa-chart-pie' },
    ];


    return (
        <div className="container mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">Tableau de Bord: {mySchool.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <DashboardCard title="Étudiants Inscrits" value={mySchool.studentCount} icon={<i className="fas fa-user-graduate"></i>} color="bg-gradient-to-br from-blue-400 to-blue-600" />
                <DashboardCard title="Personnel Enseignant" value={mySchool.teacherCount} icon={<i className="fas fa-chalkboard-user"></i>} color="bg-gradient-to-br from-green-400 to-green-600" />
                <DashboardCard title="Classes Organisées" value={mySchool.classCount} icon={<i className="fas fa-chalkboard"></i>} color="bg-gradient-to-br from-purple-400 to-purple-600" />
                <DashboardCard title="Revenu Total" value={`$${(totalRevenue/1000).toFixed(1)}k`} icon={<i className="fas fa-dollar-sign"></i>} color="bg-gradient-to-br from-yellow-400 to-yellow-600" />
            </div>

            <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- Main Column --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                        <h2 className="text-lg md:text-xl font-semibold mb-4">Paiements Mensuels (12 derniers mois)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyPaymentsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                                <XAxis dataKey="name" className="text-xs" />
                                <YAxis />
                                <Tooltip 
                                    cursor={{fill: 'rgba(239, 246, 255, 0.5)'}}
                                    contentStyle={{ backgroundColor: 'var(--color-slate-800)', border: 'none', borderRadius: '0.5rem', color: 'white' }} 
                                 />
                                <Legend />
                                <Bar dataKey="Paiements Reçus" fill="var(--color-success-500)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                        <h2 className="text-lg md:text-xl font-semibold mb-4">Évolution des Inscriptions</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={enrollmentData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                                <XAxis dataKey="name" className="text-xs" />
                                <YAxis />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-slate-800)', border: 'none', borderRadius: '0.5rem' }}/>
                                <Legend />
                                <Line type="monotone" dataKey="Inscriptions" stroke="var(--color-primary-500)" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                     <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                        <h2 className="text-lg md:text-xl font-semibold mb-4">Activités Récentes</h2>
                        <div className="space-y-4">
                            {recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${activity.type === 'payment' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                                        <i className={activity.icon}></i>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">{activity.text}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{activity.value}</p>
                                    </div>
                                    <div className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2">
                                        {activity.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- Sidebar Column --- */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                        <h2 className="text-lg md:text-xl font-semibold mb-4">Accès Rapide</h2>
                        <div className="space-y-2">
                            {quickLinks.map(link => (
                                <Link key={link.path} to={link.path} className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium text-slate-700 dark:text-slate-200 hover:text-brand-primary dark:hover:text-blue-400">
                                    <i className={`${link.icon} w-6 text-center text-slate-500 dark:text-slate-400 mr-3`}></i>
                                    <span>{link.label}</span>
                                    <i className="fas fa-chevron-right ml-auto text-xs text-slate-400"></i>
                                </Link>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                        <h2 className="text-lg md:text-xl font-semibold mb-4">Statut des Paiements</h2>
                        <div className="space-y-4">
                            {Object.values(PaymentStatus).map(status => {
                                const count = MOCK_PAYMENTS.filter(p => p.status === status).length;
                                const percentage = (count / MOCK_PAYMENTS.length) * 100;
                                let color = '';
                                if (status === PaymentStatus.PAID) color = 'bg-green-500';
                                else if (status === PaymentStatus.PARTIAL) color = 'bg-yellow-500';
                                else if (status === PaymentStatus.LATE) color = 'bg-red-500';
                                else color = 'bg-blue-500';

                                return (
                                    <div key={status}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs md:text-sm font-medium">{status}</span>
                                            <span className="text-xs md:text-sm font-medium">{count} ({percentage.toFixed(0)}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
                                            <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolDirectorDashboard;
