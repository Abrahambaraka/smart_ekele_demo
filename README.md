{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "format": "prettier --write .",
    "ci": "npm ci && npm run lint && npm run typecheck && npm run test && npm run build"
  },
  "engines": {
    "node": ">=18"
  }
}<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎓 Smart Ekele - Système de Gestion Scolaire

Application complète de gestion scolaire pour les écoles en République Démocratique du Congo.

## 🌟 Fonctionnalités

- ✅ Gestion des utilisateurs (Directeurs, Enseignants)
- ✅ Gestion des classes et matières
- ✅ Suivi des présences
- ✅ Gestion des notes et bulletins
- ✅ Gestion des paiements (frais scolaires)
- ✅ Système de notifications
- ✅ Emplois du temps
- ✅ Rapports et statistiques
- ✅ Interface multilingue (Français)

## 🚀 Installation

### Prérequis

- Node.js (v18 ou supérieur)
- MySQL (v8.0 ou supérieur)
- npm ou yarn

### 1. Cloner le projet

```bash
git clone https://github.com/Abrahambaraka/smart_ekele_demo.git
cd smart_ekele_demo
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de la base de données

#### Créer le fichier .env

```bash
cp .env.example .env
```

Modifier le fichier `.env` avec vos paramètres MySQL :

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=smart_ekele_db
```

#### Installer la base de données

**Sur Windows :**
```bash
cd database
install.bat
```

**Sur Linux/Mac :**
```bash
cd database
chmod +x install.sh
./install.sh
```

Ou manuellement :

```bash
mysql -u root -p
```

```sql
CREATE DATABASE smart_ekele_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_ekele_db;
SOURCE database/schema.sql;
SOURCE database/seed_data.sql;
```

### 4. Lancer l'application

**Mode développement :**
```bash
npm run dev
```

**Mode production :**
```bash
npm run build
npm run preview
```

L'application sera accessible sur `http://localhost:5173`

## 🗄️ Structure de la base de données

La base de données comprend 17 tables principales :

- **users** - Utilisateurs du système
- **schools** - Informations des écoles
- **school_years** - Années scolaires
- **classes** - Classes
- **subjects** - Matières
- **students** - Élèves
- **teachers** - Enseignants
- **teacher_subjects** - Affectations enseignant-matière
- **attendance** - Présences
- **grades** - Notes
- **fees** - Frais scolaires
- **payments** - Paiements
- **notifications** - Notifications
- **notification_recipients** - Destinataires de notifications
- **timetables** - Emplois du temps
- **audit_logs** - Journaux d'audit
- **settings** - Paramètres

Voir la [documentation complète de la base de données](./database/README.md)

## 👥 Utilisateurs de test

Après l'installation avec les données de test :

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Directeur | director@ecole1.cd | password |
| Enseignant | prof1@ecole1.cd | password |

## 📁 Structure du projet

```
smart-ekele/
├── components/          # Composants React réutilisables
├── contexts/           # Contextes React (Auth, Theme)
├── pages/              # Pages de l'application
├── database/           # Schémas et scripts de base de données
│   ├── schema.sql      # Schéma de la base de données
│   ├── seed_data.sql   # Données de test
│   ├── db.ts           # Configuration et repositories
│   ├── types.ts        # Types TypeScript
│   └── README.md       # Documentation de la DB
├── uploads/            # Fichiers uploadés
├── logs/               # Fichiers de logs
├── .env.example        # Exemple de configuration
└── README.md           # Ce fichier
```

## 🛠️ Technologies utilisées

### Frontend
- React 19
- TypeScript
- React Router
- Recharts (graphiques)
- Vite

### Backend (à venir)
- Node.js
- Express
- MySQL2
- JWT (authentification)
- Bcrypt (hashing)

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt
- Authentification JWT
- Protection CSRF
- Validation des entrées
- Journalisation des actions (audit logs)

## 📊 Rapports disponibles

- Statistiques des élèves par classe
- Taux de présence
- Performance académique
- Revenus et paiements
- Statistiques générales de l'école

## 🌐 Déploiement

Pour déployer sur un serveur de production :

1. Build l'application
```bash
npm run build
```

2. Les fichiers seront dans le dossier `dist/`

3. Configurer Nginx ou Apache pour servir les fichiers statiques

4. Configurer les variables d'environnement de production

Voir le guide de déploiement complet dans [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT.

## 📧 Contact

Pour toute question ou support :
- Email: support@smartekele.cd
- GitHub: [@Abrahambaraka](https://github.com/Abrahambaraka)

## 🙏 Remerciements

Développé avec ❤️ pour améliorer la gestion scolaire en RDC.

---

**Smart Ekele** - Simplifier la gestion scolaire, améliorer l'éducation
