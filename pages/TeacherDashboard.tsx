
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardCard from '../components/DashboardCard';
import { MOCK_CLASSES, MOCK_EVENTS } from '../constants';

/**
 * Composant principal pour le tableau de bord de l'enseignant.
 * Affiche un aperçu des classes, des statistiques clés et des événements à venir.
 */
const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

  // Filtre les données pour n'afficher que celles pertinentes à l'enseignant connecté.
  const teacherClasses = MOCK_CLASSES.filter(c => c.teacherId === user?.id);
  const studentCount = teacherClasses.reduce((sum, cls) => sum + cls.studentCount, 0);

  // Données factices pour la démonstration du taux de présence moyen.
  const averageAttendance = "94%";

  return (
    <div className="container mx-auto animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-slate-800 dark:text-slate-100">Tableau de Bord du Professeur</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">Bienvenue, {user?.name}. Voici un aperçu de vos activités.</p>
        
        {/* Cartes de statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <DashboardCard title="Classes Assignées" value={teacherClasses.length} icon={<i className="fas fa-chalkboard"></i>} color="bg-gradient-to-br from-blue-400 to-blue-600" />
            <DashboardCard title="Total d'Élèves" value={studentCount} icon={<i className="fas fa-users"></i>} color="bg-gradient-to-br from-green-400 to-green-600" />
            <DashboardCard title="Présence Moyenne" value={averageAttendance} icon={<i className="fas fa-user-check"></i>} color="bg-gradient-to-br from-purple-400 to-purple-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            
            {/* Section principale contenant la liste des classes et les raccourcis */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                    <h2 className="text-lg md:text-xl font-semibold mb-4">Mes Classes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teacherClasses.map(cls => (
                             <div key={cls.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-100">{cls.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{cls.level}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-brand-primary dark:text-blue-400">{cls.studentCount}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">élèves</p>
                                </div>
                            </div>
                        ))}
                        {/* Affiche un message si l'enseignant n'a pas de classes assignées */}
                         {teacherClasses.length === 0 && <p className="text-slate-500 dark:text-slate-400 md:col-span-2">Aucune classe ne vous est assignée pour le moment.</p>}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                    <h2 className="text-lg md:text-xl font-semibold mb-4">Raccourcis Rapides</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/reports-dashboard" className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                            <i className="fas fa-calendar-check text-2xl text-green-500 mb-2"></i>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">Prendre les présences</span>
                        </Link>
                         <Link to="/notification-center" className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                            <i className="fas fa-paper-plane text-2xl text-blue-500 mb-2"></i>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">Envoyer une communication</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Section latérale affichant les événements à venir */}
            <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                <h2 className="text-lg md:text-xl font-semibold mb-4">Prochains Événements</h2>
                <div className="space-y-4">
                    {MOCK_EVENTS.map(event => {
                        const eventDate = new Date(event.date + 'T' + event.time);
                        const day = eventDate.toLocaleDateString('fr-FR', { day: '2-digit' });
                        const month = eventDate.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');

                        return (
                            <div key={event.id} className="flex items-center">
                                <div className="flex flex-col items-center justify-center bg-brand-primary text-white font-bold w-12 h-12 rounded-lg mr-4 flex-shrink-0">
                                    <span className="text-sm -mb-1">{month}</span>
                                    <span className="text-xl">{day}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{event.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        <i className="far fa-clock mr-1"></i>{event.time}
                                        {event.class && <span className="ml-2"><i className="fas fa-chalkboard mr-1"></i>{event.class}</span>}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                    {/* Affiche un message si aucun événement n'est programmé */}
                     {MOCK_EVENTS.length === 0 && <p className="text-slate-500 dark:text-slate-400">Aucun événement à venir.</p>}
                </div>
            </div>
        </div>
    </div>
  );
};

export default TeacherDashboard;
