# 🏫 Smart Ekele - Système Multi-Écoles

## Vue d'ensemble

Smart Ekele est une application de gestion scolaire **MULTI-UTILISATEURS** où :
- Chaque école possède son propre compte avec des données isolées
- Plusieurs rôles avec permissions différentes (SuperAdmin, Director, Teacher)
- Isolation complète des données par école via `school_id`
- Architecture sécurisée avec JWT et filtrage automatique

## Architecture Multi-Écoles

### Principe de base

```
Base de données unique (smart_ekele_db)
    ├─ École 1 (school_id: sch-001)
    │   ├─ Directeur 1
    │   ├─ 5 Professeurs
    │   ├─ 150 Étudiants
    │   └─ Classes, Notes, Paiements...
    │
    ├─ École 2 (school_id: sch-002)
    │   ├─ Directeur 2
    │   ├─ 12 Professeurs
    │   ├─ 300 Étudiants
    │   └─ Classes, Notes, Paiements...
    │
    └─ SuperAdmin (school_id: null)
        └─ Accès à TOUTES les écoles
```

### Hiérarchie des rôles

1. **SuperAdmin** (role: `SuperAdmin`, school_id: `null`)
   - ✅ Voit TOUTES les écoles
   - ✅ Peut créer/modifier/supprimer des écoles
   - ✅ Accès complet sans restriction
   - ✅ Gestion des directeurs et SuperAdmins

2. **Director** (role: `Director`, school_id: `sch-XXX`)
   - ✅ Voit UNIQUEMENT son école
   - ✅ Gère étudiants, professeurs, classes
   - ✅ Accède aux paiements et statistiques de son école
   - ❌ Ne peut PAS voir les données d'autres écoles

3. **Teacher** (role: `Teacher`, school_id: `sch-XXX`)
   - ✅ Voit UNIQUEMENT son école
   - ✅ Gère ses classes et ses étudiants
   - ✅ Saisit notes et présences
   - ❌ Accès limité aux données de son école

## Isolation des données

### Filtrage automatique par school_id

Chaque requête SQL filtre automatiquement par `school_id` :

```sql
-- ✅ Bon: Filtre par école
SELECT * FROM students WHERE school_id = 'sch-001';

-- ❌ Mauvais: Sans filtrage (visible uniquement par SuperAdmin)
SELECT * FROM students;
```

### Middleware de sécurité

Le backend vérifie automatiquement les permissions :

```typescript
// Middleware checkSchoolAccess
if (user.role === 'Director' && user.schoolId !== requestedSchoolId) {
    return res.status(403).json({ error: 'Access denied' });
}
```

### Token JWT avec school_id

Chaque token contient le `school_id` de l'utilisateur :

```json
{
  "id": "usr-002",
  "email": "directeur@demo.com",
  "role": "Director",
  "schoolId": "sch-001"
}
```

## Tables principales avec school_id

Toutes ces tables ont une colonne `school_id` pour isolation :

- ✅ `users` → Utilisateurs (Directeur/Professeur)
- ✅ `students` → Étudiants
- ✅ `teachers` → Professeurs
- ✅ `classes` → Classes
- ✅ `subjects` → Matières
- ✅ `grades` → Notes
- ✅ `attendance` → Présences
- ✅ `payments` → Paiements
- ✅ `school_years` → Années scolaires

## Flux de données

### Exemple: Directeur consulte ses étudiants

```
1. Login
   POST /api/auth/login
   { email: "directeur@demo.com", password: "password123" }
   ↓
   Reçoit token JWT avec { role: "Director", schoolId: "sch-001" }

2. Frontend demande les étudiants
   studentsAPI.getAll({ school_id: user.schoolId })
   ↓
   GET /api/students?school_id=sch-001

3. Backend vérifie les permissions
   - Token valide ✅
   - user.schoolId === req.query.school_id ✅
   - Autorisé à continuer

4. Database query
   SELECT * FROM students WHERE school_id = 'sch-001'
   ↓
   Retourne UNIQUEMENT les étudiants de l'école 1

5. Frontend affiche les données
   setStudents(response.data)
```

### Exemple: SuperAdmin voit toutes les écoles

```
1. Login
   POST /api/auth/login
   { email: "admin@smartekele.com", password: "admin123" }
   ↓
   Reçoit token JWT avec { role: "SuperAdmin", schoolId: null }

2. Frontend demande toutes les écoles
   schoolsAPI.getAll()
   ↓
   GET /api/schools

3. Backend vérifie les permissions
   - Token valide ✅
   - user.role === "SuperAdmin" ✅
   - Bypass school_id check ✅

4. Database query
   SELECT * FROM schools
   ↓
   Retourne TOUTES les écoles (pas de filtre)

5. Frontend affiche toutes les écoles
```

## Installation et migration

### 1. Installer les dépendances

```powershell
npm install
```

### 2. Créer la base de données

```powershell
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS smart_ekele_db;"
mysql -u root -proot smart_ekele_db < database/schema.sql
mysql -u root -proot smart_ekele_db < database/seed_data.sql
```

### 3. Exécuter la migration multi-écoles

```powershell
mysql -u root -proot smart_ekele_db < database/migration_multi_ecoles.sql
```

Cette migration :
- ✅ Ajoute le rôle `SuperAdmin`
- ✅ Ajoute `school_id` dans la table `users`
- ✅ Crée un SuperAdmin par défaut
- ✅ Crée une deuxième école pour tester
- ✅ Ajoute des index pour performances
- ✅ Crée une vue `v_school_stats`

### 4. Démarrer l'application

```powershell
# Backend (port 3000)
npm run server:dev

# Frontend (port 5173)
npm run dev
```

## Comptes de test

### SuperAdmin
```
Email: admin@smartekele.com
Password: admin123
Accès: TOUTES les écoles
```

### École 1: Complexe Scolaire Ekele
```
Directeur:
  Email: directeur@demo.com
  Password: password123
  school_id: sch-001

Professeur:
  Email: professeur@demo.com
  Password: password123
  school_id: sch-001
```

### École 2: Lycée Moderne de Kinshasa
```
Directeur:
  Email: directeur.lycee@smartekele.com
  Password: admin123
  school_id: sch-002
```

## Tests de sécurité

### Test 1: Isolation des données

1. Login avec directeur@demo.com (École 1)
2. Ouvrir StudentManagement
3. Vérifier que seuls les étudiants de l'école 1 sont visibles
4. Essayer d'accéder aux données de l'école 2 → **403 Forbidden**

### Test 2: SuperAdmin

1. Login avec admin@smartekele.com
2. Ouvrir SuperAdminDashboard
3. Vérifier que TOUTES les écoles sont visibles
4. Créer un nouvel utilisateur → Peut choisir n'importe quelle école

### Test 3: Professeur

1. Login avec professeur@demo.com
2. Ouvrir TeacherDashboard
3. Vérifier que seules ses classes sont visibles
4. Saisir des notes → Uniquement pour ses étudiants

## Sécurité

### Mesures de sécurité implémentées

1. **Filtrage automatique par school_id**
   - Toutes les requêtes filtrent par école
   - Impossible d'accéder aux données d'une autre école

2. **Validation côté serveur**
   - Middleware `checkSchoolAccess`
   - Vérification du token JWT
   - Validation des permissions par rôle

3. **Mots de passe sécurisés**
   - Hash bcrypt avec 10 rounds
   - Jamais stockés en clair

4. **Tokens JWT**
   - Expiration après 7 jours
   - Contient role et schoolId
   - Vérifié à chaque requête

5. **Audit logs** (optionnel)
   - Table `access_logs`
   - Trace toutes les actions
   - IP, user_agent, timestamp

### Bonnes pratiques

```typescript
// ✅ BON: Toujours filtrer par school_id
const students = await studentsAPI.getAll({ 
  school_id: user.schoolId 
});

// ✅ BON: Vérifier les permissions
if (user.role !== 'SuperAdmin' && user.schoolId !== targetSchoolId) {
  return res.status(403).json({ error: 'Access denied' });
}

// ❌ MAUVAIS: Pas de filtrage
const students = await studentsAPI.getAll();

// ❌ MAUVAIS: Confiance aveugle dans le frontend
// Toujours valider côté serveur
```

## Structure du code

### Backend (Express/TypeScript)

```
server/
├── index.ts              # Point d'entrée
├── middleware/
│   └── auth.middleware.ts # JWT, checkSchoolAccess, logAccess
└── routes/
    ├── auth.routes.ts    # Login, register (avec school_id)
    ├── student.routes.ts # Filtre par school_id
    ├── teacher.routes.ts # Filtre par school_id
    ├── class.routes.ts   # Filtre par school_id
    └── ... (13 modules)
```

### Frontend (React/TypeScript)

```
src/
├── contexts/
│   └── AuthContext.tsx   # Gère user avec schoolId
├── services/
│   └── api.ts            # Axios avec token JWT
└── pages/
    ├── Login.tsx         # Authentification
    ├── SchoolDirectorDashboard.tsx # Directeur
    ├── TeacherDashboard.tsx        # Professeur
    ├── SuperAdminDashboard.tsx     # SuperAdmin
    └── ... (11 pages)
```

### Database (MySQL)

```
database/
├── schema.sql                  # Structure complète
├── seed_data.sql               # Données de démonstration
├── migration_multi_ecoles.sql  # Migration multi-écoles
├── MIGRATION_GUIDE.md          # Guide de migration
└── types.ts                    # Types TypeScript
```

## Environnement

### Backend (.env)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=smart_ekele_db
DB_PORT=3306

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

BCRYPT_ROUNDS=10

PORT=3000
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:3000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Créer un utilisateur (avec school_id)
- `POST /api/auth/login` - Connexion (retourne token avec schoolId)
- `GET /api/auth/profile` - Profil utilisateur

### Students (filtré par school_id)
- `GET /api/students?school_id=sch-001` - Liste des étudiants
- `POST /api/students` - Créer un étudiant
- `PUT /api/students/:id` - Modifier un étudiant
- `DELETE /api/students/:id` - Supprimer un étudiant

### Schools (SuperAdmin uniquement)
- `GET /api/schools` - Liste de toutes les écoles
- `POST /api/schools` - Créer une école
- `PUT /api/schools/:id` - Modifier une école
- `DELETE /api/schools/:id` - Supprimer une école

### Reports (filtré par school_id)
- `GET /api/reports/school/:school_id/comprehensive` - Statistiques complètes
- `GET /api/reports/students/:school_id` - Stats étudiants
- `GET /api/reports/attendance/:school_id` - Stats présence
- `GET /api/reports/grades/:school_id` - Stats notes

## Dépannage

### Problème: "Access denied" malgré login correct

**Solution:** Vérifier que le token JWT contient bien `schoolId`

```javascript
// Dans la console du navigateur
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload); // Doit contenir schoolId
```

### Problème: Voir les données d'une autre école

**Solution:** C'est un bug de sécurité ! Vérifier :
1. Le middleware `checkSchoolAccess` est actif
2. Les requêtes filtrent bien par `school_id`
3. Le token JWT est valide et contient le bon `schoolId`

### Problème: SuperAdmin ne voit qu'une seule école

**Solution:** Vérifier que `user.schoolId === null` pour SuperAdmin

```sql
SELECT id, email, role, school_id FROM users WHERE role = 'SuperAdmin';
-- school_id doit être NULL
```

## Support et contact

Pour toute question ou problème :
1. Vérifier `ARCHITECTURE_DATABASE.txt`
2. Lire `database/MIGRATION_GUIDE.md`
3. Vérifier les logs du serveur
4. Tester avec les comptes de démonstration

---

**Version:** 1.0.0  
**Date:** Novembre 2024  
**Auteur:** Smart Ekele Team
