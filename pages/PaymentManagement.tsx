import React, { useState, FormEvent, useEffect, useRef, useMemo } from 'react';
import { MOCK_PAYMENTS, MOCK_STUDENTS, MOCK_CLASSES } from '../constants';
import { Payment, PaymentStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';

const PaymentManagement: React.FC = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter and Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('all');
    const [filterReason, setFilterReason] = useState('all');
    const [filterMonth, setFilterMonth] = useState('all');

    // Form state
    const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
    const [selectedStudentClass, setSelectedStudentClass] = useState<string>('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedStatus, setSelectedStatus] = useState<PaymentStatus>(PaymentStatus.LATE);
    const [paymentReason, setPaymentReason] = useState('frais_scolaire');
    const [selectedMonth, setSelectedMonth] = useState('septembre');
    const [selectedInstallment, setSelectedInstallment] = useState('1ère');

    // Searchable dropdown state
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    
    const filteredPayments = useMemo(() => {
        return payments.filter(payment => {
            const student = MOCK_STUDENTS.find(s => s.id === payment.studentId);
            if (!student) return false;

            const studentNameMatch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
            const classMatch = filterClass === 'all' || student.classId === parseInt(filterClass);
            
            const descriptionLower = payment.description.toLowerCase();
            const reasonMatch = filterReason === 'all' || descriptionLower.includes(filterReason.toLowerCase());
            const monthMatch = filterMonth === 'all' || descriptionLower.includes(filterMonth.toLowerCase());
            
            return studentNameMatch && classMatch && reasonMatch && monthMatch;
        });
    }, [payments, searchTerm, filterClass, filterReason, filterMonth]);


    useEffect(() => {
        if (selectedStudentId) {
            const student = MOCK_STUDENTS.find(s => s.id === selectedStudentId);
            if (student) {
                const studentClass = MOCK_CLASSES.find(c => c.id === student.classId);
                setSelectedStudentClass(studentClass ? studentClass.name : 'Classe inconnue');
            }
        } else {
            setSelectedStudentClass('');
        }
    }, [selectedStudentId]);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsStudentDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchContainerRef]);

    const getStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case PaymentStatus.PARTIAL: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case PaymentStatus.LATE: return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            case PaymentStatus.EXEMPTED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        }
    }

    const getStudentName = (studentId: number) => MOCK_STUDENTS.find(s => s.id === studentId)?.name || 'N/A';
    
    const resetForm = () => {
        setSelectedStudentId('');
        setAmount('');
        setDueDate(new Date().toISOString().split('T')[0]);
        setSelectedStatus(PaymentStatus.LATE);
        setStudentSearchTerm('');
        setPaymentReason('frais_scolaire');
        setSelectedMonth('septembre');
        setSelectedInstallment('1ère');
    };

    const handleOpenAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId || !amount || parseFloat(amount) <= 0) {
            alert("Veuillez sélectionner un étudiant et entrer un montant valide.");
            return;
        }
        
        let description = '';
        switch(paymentReason) {
            case 'inscription':
                description = 'Inscription';
                break;
            case 'frais_scolaire':
                description = `Frais Scolaire - ${selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)}`;
                break;
            case 'frais_etat':
                description = `Frais de l'état - ${selectedInstallment} Tranche`;
                break;
            case 'frais_examen':
                description = `Frais d'examen - ${selectedInstallment} Tranche`;
                break;
            default:
                description = "Paiement divers";
        }

        const newPayment: Payment = {
            id: Date.now(),
            studentId: selectedStudentId,
            amount: parseFloat(amount),
            dueDate,
            status: selectedStatus,
            description: description
        };

        setPayments([newPayment, ...payments]);
        setIsModalOpen(false);
        resetForm();
    };

    const handleGenerateInvoice = (payment: Payment) => {
        const student = MOCK_STUDENTS.find(s => s.id === payment.studentId);
        if (!student) {
            alert("Impossible de trouver les informations de l'étudiant.");
            return;
        }
        const studentClass = MOCK_CLASSES.find(c => c.id === student.classId);
        const cashierName = user?.name || 'N/A';

        const receiptHtml = `
            <html>
            <head>
                <title>Recu #${payment.id}</title>
                <style>
                    body { 
                        font-family: 'Courier New', Courier, monospace; 
                        font-size: 10pt; 
                        color: #000;
                        margin: 0;
                        padding: 0;
                    }
                    .receipt-container { 
                        width: 280px;
                        padding: 10px;
                    }
                    .center { text-align: center; }
                    .left { text-align: left; }
                    .right { text-align: right; }
                    .bold { font-weight: bold; }
                    .line { border-top: 1px dashed #000; margin: 10px 0; }
                    .header h1 { font-size: 12pt; margin: 0; }
                    .header p { margin: 2px 0; font-size: 9pt; }
                    .details-table { width: 100%; }
                    .details-table td { padding: 1px 0; }
                    .item-table { width: 100%; margin-top: 10px; }
                    .item-table th { border-bottom: 1px dashed #000; font-weight: bold; text-align: left; padding-bottom: 5px; }
                    .item-table td { padding: 5px 0; }
                    .total-section { margin-top: 10px; }
                    .total-section td { font-size: 11pt; }
                    .footer p { font-size: 9pt; margin: 2px 0; }
                    @media print {
                        @page {
                            margin: 0;
                        }
                        body {
                           margin: 0.5cm;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="header center">
                        <h1 class="bold">LYCEE SALAMA</h1>
                        <p>123 Av. de l'Enseignement, Gombe</p>
                        <p>Kinshasa, R.D. Congo</p>
                        <p>Tel: +243 81 123 4567</p>
                        <p>NIF: A1234567B</p>
                    </div>
                    
                    <div class="line"></div>
                    
                    <table class="details-table">
                        <tr>
                            <td class="left">Reçu #:</td>
                            <td class="right">${payment.id}</td>
                        </tr>
                        <tr>
                            <td class="left">Date:</td>
                            <td class="right">${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                        <tr>
                            <td class="left">Caissier:</td>
                            <td class="right">${cashierName}</td>
                        </tr>
                    </table>
                    
                    <div class="line"></div>

                    <p class="bold">ÉLÈVE:</p>
                    <p>${student.name}</p>
                    <p>CLASSE: ${studentClass?.name || 'N/A'}</p>
                    
                    <table class="item-table">
                        <thead>
                            <tr>
                                <th class="left">DESCRIPTION</th>
                                <th class="right">MONTANT</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="left">${payment.description}</td>
                                <td class="right">${payment.amount.toFixed(2)} $</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="line"></div>
                    
                    <table class="details-table total-section">
                        <tr>
                            <td class="left bold">TOTAL PAYÉ:</td>
                            <td class="right bold">${payment.amount.toFixed(2)} $</td>
                        </tr>
                    </table>
                    
                    <div class="line"></div>
                    
                    <div class="footer center">
                        <p class="bold">MERCI POUR VOTRE PAIEMENT</p>
                        <p>Smart Ekele - Gestion Scolaire</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(receiptHtml);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };


    const PaymentModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 backdrop-blur-sm animate-fade-in" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-lg m-4 transform transition-all animate-scale-in">
                <div className="flex justify-between items-center border-b pb-3 mb-4 dark:border-slate-700">
                    <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">Ajouter un nouveau paiement</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" aria-label="Close modal">
                        <i className="fas fa-times h-6 w-6"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div>
                            <label htmlFor="studentSearch" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Étudiant</label>
                            <div className="relative" ref={searchContainerRef}>
                                <input
                                    type="text"
                                    id="studentSearch"
                                    value={studentSearchTerm}
                                    onChange={(e) => {
                                        setStudentSearchTerm(e.target.value);
                                        setSelectedStudentId('');
                                        if (!isStudentDropdownOpen) setIsStudentDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsStudentDropdownOpen(true)}
                                    placeholder="Rechercher un étudiant..."
                                    autoComplete="off"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                                {isStudentDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {MOCK_STUDENTS
                                            .filter(student => student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()))
                                            .map(student => (
                                                <div
                                                    key={student.id}
                                                    onClick={() => {
                                                        setSelectedStudentId(student.id);
                                                        setStudentSearchTerm(student.name);
                                                        setIsStudentDropdownOpen(false);
                                                    }}
                                                    className="px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-primary-500 hover:text-white cursor-pointer"
                                                >
                                                    {student.name}
                                                </div>
                                            ))
                                        }
                                        {MOCK_STUDENTS.filter(student => student.name.toLowerCase().includes(studentSearchTerm.toLowerCase())).length === 0 && (
                                             <div className="px-4 py-2 text-sm text-slate-500">Aucun étudiant trouvé</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                         <div>
                            <label htmlFor="studentClass" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Classe de l'élève</label>
                            <input 
                                type="text" 
                                id="studentClass" 
                                value={selectedStudentClass} 
                                readOnly 
                                disabled 
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-300 cursor-not-allowed" 
                            />
                        </div>

                        <div>
                            <label htmlFor="paymentReason" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motif du paiement</label>
                            <select 
                                id="paymentReason" 
                                value={paymentReason} 
                                onChange={(e) => setPaymentReason(e.target.value)} 
                                required 
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            >
                                <option value="frais_scolaire">Paiement Frais Scolaire</option>
                                <option value="inscription">Inscription</option>
                                <option value="frais_etat">Frais de l'état</option>
                                <option value="frais_examen">Frais d'examen</option>
                            </select>
                        </div>

                        {paymentReason === 'frais_scolaire' && (
                            <div className="animate-fade-in">
                                <label htmlFor="selectedMonth" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mois</label>
                                <select 
                                    id="selectedMonth" 
                                    value={selectedMonth} 
                                    onChange={(e) => setSelectedMonth(e.target.value)} 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                    <option value="septembre">Septembre</option>
                                    <option value="octobre">Octobre</option>
                                    <option value="novembre">Novembre</option>
                                    <option value="decembre">Décembre</option>
                                    <option value="janvier">Janvier</option>
                                    <option value="fevrier">Février</option>
                                    <option value="mars">Mars</option>
                                    <option value="avril">Avril</option>
                                    <option value="mai">Mai</option>
                                    <option value="juin">Juin</option>
                                </select>
                            </div>
                        )}
                        
                        {(paymentReason === 'frais_etat' || paymentReason === 'frais_examen') && (
                             <div className="animate-fade-in">
                                <label htmlFor="selectedInstallment" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tranche</label>
                                <select 
                                    id="selectedInstallment" 
                                    value={selectedInstallment} 
                                    onChange={(e) => setSelectedInstallment(e.target.value)} 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                    <option value="1ère">1ère Tranche</option>
                                    <option value="2ème">2ème Tranche</option>
                                </select>
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Montant ($)</label>
                            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date d'échéance</label>
                            <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statut</label>
                            <select id="status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as PaymentStatus)} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                {Object.values(PaymentStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4 border-t pt-4 dark:border-slate-700">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-offset-gray-800">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 transition-colors shadow-md hover:shadow-lg">
                            Ajouter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const commonSelectClass = "w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white";

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">Gestion Financière</h1>
            <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 sm:mb-0">Suivi des Paiements</h2>
                    <button onClick={handleOpenAddModal} className="bg-brand-primary text-white font-semibold px-3 py-2 md:px-4 rounded-md shadow-md hover:bg-brand-secondary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:-translate-y-px w-full sm:w-auto flex items-center justify-center">
                        <i className="fas fa-plus sm:mr-2"></i><span className="hidden sm:inline">Ajouter un Paiement</span>
                    </button>
                </div>

                {/* Filter Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <input
                        type="text"
                        placeholder="Rechercher par nom d'élève..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                    <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className={commonSelectClass}>
                        <option value="all">Toutes les classes</option>
                        {MOCK_CLASSES.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                    </select>
                    <select value={filterReason} onChange={(e) => setFilterReason(e.target.value)} className={commonSelectClass}>
                        <option value="all">Tous les motifs</option>
                        <option value="Inscription">Inscription</option>
                        <option value="Frais Scolaire">Frais Scolaire</option>
                        <option value="Frais de l'état">Frais de l'état</option>
                        <option value="Frais d'examen">Frais d'examen</option>
                    </select>
                    <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className={commonSelectClass}>
                        <option value="all">Tous les mois</option>
                        {['Septembre', 'Octobre', 'Novembre', 'Décembre', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'].map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>
                 
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 px-1">
                    Affichage de <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredPayments.length}</span> sur <span className="font-semibold text-slate-700 dark:text-slate-200">{payments.length}</span> paiements.
                </p>

                 <div className="overflow-x-auto">
                    <table className="w-full text-left table-style text-sm">
                        <thead>
                            <tr>
                                <th className="p-3 font-semibold">Étudiant</th>
                                <th className="p-3 font-semibold">Description</th>
                                <th className="p-3 font-semibold">Montant ($)</th>
                                <th className="p-3 font-semibold hidden md:table-cell">Date d'échéance</th>
                                <th className="p-3 font-semibold">Statut</th>
                                <th className="p-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.length > 0 ? (
                                filteredPayments.map(payment => (
                                    <tr key={payment.id} className="border-b dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                        <td className="p-3 font-medium">{getStudentName(payment.studentId)}</td>
                                        <td className="p-3">{payment.description}</td>
                                        <td className="p-3">{payment.amount.toFixed(2)} $</td>
                                        <td className="p-3 hidden md:table-cell">{payment.dueDate}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>{payment.status}</span>
                                        </td>
                                        <td className="p-3">
                                            <button 
                                                onClick={() => handleGenerateInvoice(payment)} 
                                                className="text-slate-500 hover:text-primary-600 transition-colors"
                                                title="Générer la facture d'attente"
                                            >
                                                <i className="fas fa-receipt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                             ) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-4 text-slate-500 dark:text-slate-400">
                                        Aucun paiement trouvé correspondant aux filtres.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <PaymentModal />}
        </div>
    );
};

export default PaymentManagement;