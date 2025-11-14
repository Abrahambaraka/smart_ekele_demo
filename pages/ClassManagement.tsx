
import React from 'react';
import { MOCK_CLASSES } from '../constants';
import { ClassLevel } from '../types';

const ClassManagement: React.FC = () => {
  return (
    <div className="container mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">Gestion des Classes</h1>
        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg md:text-xl font-semibold">Liste des Classes</h2>
                <button className="bg-brand-primary text-white font-semibold px-3 py-2 md:px-4 rounded-md shadow-md hover:bg-brand-secondary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:-translate-y-px flex items-center">
                    <i className="fas fa-plus sm:mr-2"></i><span className="hidden sm:inline">Ajouter une Classe</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left table-style text-sm">
                    <thead>
                        <tr>
                            <th className="p-3 font-semibold">Nom</th>
                            <th className="p-3 font-semibold">Niveau</th>
                            <th className="p-3 font-semibold">Professeur ID</th>
                            <th className="p-3 font-semibold">Nb. Étudiants</th>
                            <th className="p-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_CLASSES.map(cls => (
                            <tr key={cls.id} className="border-b dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                <td className="p-3 font-medium">{cls.name}</td>
                                <td className="p-3">{cls.level}</td>
                                <td className="p-3">{cls.teacherId}</td>
                                <td className="p-3">{cls.studentCount}</td>
                                <td className="p-3 space-x-2">
                                    <button className="text-primary-500 hover:text-primary-700 transition-colors"><i className="fas fa-pencil-alt"></i></button>
                                    <button className="text-danger-500 hover:text-red-700 transition-colors"><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default ClassManagement;