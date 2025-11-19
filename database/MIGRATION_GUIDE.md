# GUIDE DE MIGRATION MULTI-ÉCOLES

## Vue d'ensemble
Ce guide explique comment migrer la base de données pour supporter pleinement le système multi-écoles avec :
- Rôle SuperAdmin
- Isolation complète des données par école
- Deuxième école pour tester

## Étapes de migration

### 1. Exécuter le script de migration

```powershell
mysql -u root -proot smart_ekele_db < database/migration_multi_ecoles.sql
```

### 2. Vérifier la migration

Connectez-vous à MySQL et vérifiez :

```sql
-- Vérifier les nouveaux rôles
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Vérifier que les users ont un school_id
SELECT id, username, role, school_id FROM users;

-- Vérifier les statistiques des écoles
SELECT * FROM v_school_stats;
```

### 3. Comptes créés

**SuperAdmin :**
- Email: admin@smartekele.com
- Password: admin123
- Accès: TOUTES les écoles

**École 1 - Complexe Scolaire Ekele :**
- Directeur: directeur@demo.com
- Password: password123
- school_id: sch-001

**École 2 - Lycée Moderne de Kinshasa :**
- Directeur: directeur.lycee@smartekele.com
- Password: admin123
- school_id: sch-002

### 4. Tester l'isolation des données

**Test 1: Login SuperAdmin**
```
Email: admin@smartekele.com
Password: admin123
→ Doit voir TOUTES les écoles (sch-001 + sch-002)
```

**Test 2: Login Directeur École 1**
```
Email: directeur@demo.com
Password: password123
→ Doit voir UNIQUEMENT l'école 1 et ses données
→ Ne peut PAS voir les données de l'école 2
```

**Test 3: Login Directeur École 2**
```
Email: directeur.lycee@smartekele.com
Password: admin123
→ Doit voir UNIQUEMENT l'école 2 et ses données
→ Ne peut PAS voir les données de l'école 1
```

## Changements apportés

### Base de données
1. ✅ Ajout du rôle `SuperAdmin` à l'enum users.role
2. ✅ Ajout de la colonne `school_id` dans la table `users`
3. ✅ Création d'index pour améliorer les performances
4. ✅ Création d'un SuperAdmin par défaut
5. ✅ Ajout d'une deuxième école avec données de test
6. ✅ Création d'une vue `v_school_stats` pour statistiques
7. ✅ Trigger pour valider que Director/Teacher ont un school_id
8. ✅ Table `access_logs` pour tracer les accès (optionnel)

### Backend
1. ✅ Mise à jour du middleware `checkSchoolAccess`
   - SuperAdmin peut accéder à toutes les écoles
   - Director/Teacher limités à leur école
2. ✅ Ajout du middleware `logAccess` pour traçabilité
3. ✅ Interface `AuthRequest` mise à jour (schoolId nullable)

## Données de test ajoutées

### École 2: Lycée Moderne de Kinshasa
- **ID:** sch-002
- **Code:** LYC-KIN-002
- **Directeur:** Marie Kabila (usr-director-002)
- **Classes:** 3 (6ème A, 5ème B, Terminale Scientifique)
- **Étudiants:** 4 (Joseph Makasi, Grace Nkulu, David Tshisekedi, Sarah Mwamba)
- **Année scolaire:** 2024-2025

## Architecture de sécurité

```
SuperAdmin (role: SuperAdmin)
    ↓
    Accès à TOUTES les écoles
    ├─ École 1 (school_id: sch-001)
    │   ├─ Directeur 1
    │   ├─ Professeurs de l'école 1
    │   └─ Étudiants de l'école 1
    └─ École 2 (school_id: sch-002)
        ├─ Directeur 2
        ├─ Professeurs de l'école 2
        └─ Étudiants de l'école 2

Director (role: Director, school_id: sch-001)
    ↓
    Accès UNIQUEMENT à l'école 1
    └─ Données de l'école 1 SEULEMENT

Teacher (role: Teacher, school_id: sch-001)
    ↓
    Accès UNIQUEMENT à l'école 1
    └─ Ses classes et étudiants de l'école 1
```

## Vérifications de sécurité

### Filtrage automatique par school_id
Toutes les requêtes doivent filtrer par `school_id` :

```javascript
// ✅ BON
studentsAPI.getAll({ school_id: user.schoolId })

// ❌ MAUVAIS (sans filtrage)
studentsAPI.getAll()
```

### Validation côté serveur
Le middleware `checkSchoolAccess` vérifie que :
- Le user est authentifié
- Le user a accès au school_id demandé
- SuperAdmin bypass ces vérifications

### Token JWT contient school_id
```json
{
  "id": "usr-002",
  "email": "directeur@demo.com",
  "role": "Director",
  "schoolId": "sch-001"
}
```

## Rollback (si nécessaire)

En cas de problème, vous pouvez annuler les changements :

```sql
-- Supprimer le trigger
DROP TRIGGER IF EXISTS before_user_insert;

-- Supprimer la vue
DROP VIEW IF EXISTS v_school_stats;

-- Supprimer la table de logs
DROP TABLE IF EXISTS access_logs;

-- Supprimer la deuxième école
DELETE FROM students WHERE school_id = 'sch-002';
DELETE FROM classes WHERE school_id = 'sch-002';
DELETE FROM school_years WHERE school_id = 'sch-002';
DELETE FROM schools WHERE id = 'sch-002';
DELETE FROM users WHERE id IN ('usr-director-002', 'usr-superadmin-001');

-- Retirer school_id des users
ALTER TABLE users DROP FOREIGN KEY users_ibfk_1;
ALTER TABLE users DROP COLUMN school_id;

-- Restaurer l'ancien enum
ALTER TABLE users MODIFY COLUMN role ENUM('school_director', 'teacher') NOT NULL;
```

## Prochaines étapes

1. ✅ Exécuter la migration
2. ✅ Tester avec les 3 comptes (SuperAdmin, Director1, Director2)
3. ✅ Vérifier l'isolation des données
4. ✅ Tester la création d'étudiants/classes dans chaque école
5. ✅ Vérifier que les statistiques sont correctes par école

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs MySQL
2. Vérifiez que la migration s'est bien exécutée
3. Testez les requêtes manuellement dans MySQL
4. Vérifiez les tokens JWT dans le frontend
