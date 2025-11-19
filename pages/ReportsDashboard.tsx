import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ReportsDashboard: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [studentStats, setStudentStats] = useState<any>(null);
    const [attendanceStats, setAttendanceStats] = useState<any>(null);
    const [gradeStats, setGradeStats] = useState<any>(null);
    const [paymentStats, setPaymentStats] = useState<any>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const schoolId = user?.schoolId?.toString();
            
            const [studentRes, attendanceRes, gradeRes, paymentRes] = await Promise.all([
                reportsAPI.getStudentStats(schoolId),
                reportsAPI.getAttendanceStats(schoolId),
                reportsAPI.getGradeStats(schoolId),
                reportsAPI.getPaymentStats(schoolId)
            ]);
            
            if (studentRes.success) setStudentStats(studentRes.data);
            if (attendanceRes.success) setAttendanceStats(attendanceRes.data);
            if (gradeRes.success) setGradeStats(gradeRes.data);
            if (paymentRes.success) setPaymentStats(paymentRes.data);
        } catch (error) {
            console.error('Erreur:', error);
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

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Tableau de Bord des Rapports</h1>

            {/* Student Statistics */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Statistiques des Étudiants</h2>
                {studentStats ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-300">Total Étudiants</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">{studentStats.total_students || 0}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-300">Actifs</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-300">{studentStats.active_students || 0}</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-300">Classes</p>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">{studentStats.total_classes || 0}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-600 dark:text-slate-400">Aucune donnée disponible</p>
                )}
            </div>

            {/* Attendance Statistics */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Statistiques de Présence</h2>
                {attendanceStats ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-300">Présents</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-300">{attendanceStats.present || 0}</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-300">Absents</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-300">{attendanceStats.absent || 0}</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-300">Taux de présence</p>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-300">
                                {attendanceStats.attendance_rate ? `${attendanceStats.attendance_rate.toFixed(1)}%` : '0%'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-600 dark:text-slate-400">Aucune donnée disponible</p>
                )}
            </div>

            {/* Grade Statistics */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Statistiques des Notes</h2>
                {gradeStats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-300">Moyenne générale</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                                {gradeStats.average_score ? gradeStats.average_score.toFixed(2) : 'N/A'}
                            </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-300">Total Notes</p>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">{gradeStats.total_grades || 0}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-600 dark:text-slate-400">Aucune donnée disponible</p>
                )}
            </div>

            {/* Payment Statistics */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Statistiques des Paiements</h2>
                {paymentStats ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-300">Revenu Total</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-300">
                                ${paymentStats.total_revenue ? parseFloat(paymentStats.total_revenue).toFixed(2) : '0.00'}
                            </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-300">Paiements complétés</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">{paymentStats.completed_payments || 0}</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-300">En attente</p>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-300">{paymentStats.pending_payments || 0}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-600 dark:text-slate-400">Aucune donnée disponible</p>
                )}
            </div>

            {/* Export Options */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Options d'Export</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        Export Étudiants (PDF)
                    </button>
                    <button className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        Export Présence (Excel)
                    </button>
                    <button className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                        Export Notes (PDF)
                    </button>
                    <button className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                        Export Paiements (Excel)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportsDashboard;
