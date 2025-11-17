# Smart Ekele - Database Documentation

## Vue d'ensemble

La base de données **smart_ekele_db** est conçue pour gérer un système complet de gestion scolaire pour les écoles en République Démocratique du Congo.

## Architecture

### Tables principales

#### 1. **users** - Gestion des utilisateurs
- Stocke tous les utilisateurs du système (administrateurs, directeurs, enseignants, étudiants, parents)
- Rôles: `super_admin`, `school_director`, `teacher`, `student`, `parent`
- Authentification par email/mot de passe hashé

#### 2. **schools** - Écoles
- Gère les informations des écoles
- Plans d'abonnement: `basic`, `premium`, `enterprise`
- Lien avec le directeur de l'école

#### 3. **school_years** - Années scolaires
- Permet de gérer plusieurs années académiques
- Un flag `is_current` pour l'année en cours

#### 4. **classes** - Classes
- Organisation des classes par niveau et section
- Lié à une année scolaire spécifique
- Capacité maximale d'élèves

#### 5. **subjects** - Matières
- Matières enseignées dans l'école
- Coefficient pour le calcul des moyennes

#### 6. **students** - Élèves
- Informations complètes des élèves
- Numéro d'étudiant unique
- Informations des parents/tuteurs
- Statut: `active`, `suspended`, `graduated`, `expelled`

#### 7. **teachers** - Enseignants
- Profil des enseignants
- Qualifications et spécialisations
- Informations salariales

#### 8. **teacher_subjects** - Affectations enseignant-matière
- Relation many-to-many entre enseignants, matières et classes
- Évite les doublons d'affectation

#### 9. **attendance** - Présences
- Suivi quotidien des présences
- Statuts: `present`, `absent`, `late`, `excused`

#### 10. **grades** - Notes
- Stockage de toutes les notes des élèves
- Types d'examens: `interrogation`, `devoir`, `examen_1`, `examen_2`, `examen_final`
- Lié à l'enseignant qui a saisi la note

#### 11. **fees** - Frais scolaires
- Différents types de frais (scolarité, inscription, uniforme, etc.)
- Peut être spécifique à une classe ou général

#### 12. **payments** - Paiements
- Historique de tous les paiements
- Méthodes: `cash`, `mobile_money`, `bank_transfer`, `check`
- Statuts: `completed`, `pending`, `cancelled`, `refunded`

#### 13. **notifications** - Notifications
- Système de notification pour tous les utilisateurs
- Ciblage par audience (tous, enseignants, étudiants, parents, classe spécifique)
- Niveaux de priorité

#### 14. **notification_recipients** - Destinataires de notifications
- Suivi de la lecture des notifications par utilisateur

#### 15. **timetables** - Emplois du temps
- Organisation des cours par jour et horaire
- Affectation salle/enseignant/matière

#### 16. **audit_logs** - Journal d'audit
- Traçabilité de toutes les actions importantes
- Stockage JSON des anciennes et nouvelles valeurs

#### 17. **settings** - Paramètres
- Configuration flexible par école
- Différents types de données supportés

## Relations clés

```
users → schools (1:N via director_id)
schools → classes (1:N)
schools → students (1:N)
schools → teachers (1:N)
classes → students (1:N)
teachers ←→ subjects ←→ classes (N:N via teacher_subjects)
students → attendance (1:N)
students → grades (1:N)
students → payments (1:N)
```

## Installation

### 1. Créer la base de données

```bash
mysql -u root -p
```

```sql
CREATE DATABASE smart_ekele_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_ekele_db;
```

### 2. Exécuter le schéma

```bash
mysql -u root -p smart_ekele_db < database/schema.sql
```

### 3. Charger les données de test

```bash
mysql -u root -p smart_ekele_db < database/seed_data.sql
```

## Sécurité

- Tous les mots de passe sont hashés avec bcrypt
- Utilisation de UUID pour les clés primaires
- Audit complet des actions via `audit_logs`
- Contraintes de clés étrangères avec CASCADE approprié

## Performance

- Index sur les colonnes fréquemment utilisées
- Index composites pour les requêtes complexes
- Timestamp automatique pour created_at/updated_at

## Utilisateurs de test

Après avoir chargé `seed_data.sql`, vous pouvez vous connecter avec :

| Rôle | Email | Mot de passe (hash) |
|------|-------|---------------------|
| Super Admin | admin@smartekele.cd | password |
| Directeur | director@ecole1.cd | password |
| Enseignant | prof1@ecole1.cd | password |

*Note: Les hash actuels sont des exemples. En production, utiliser bcrypt avec les vrais mots de passe.*

## Évolutions futures

- Table pour les examens/tests planifiés
- Table pour la bibliothèque
- Table pour les événements scolaires
- Table pour les rapports médicaux
- Table pour les sanctions/comportements
- Système de messagerie interne
- Gestion des inventaires

## Maintenance

### Backup quotidien recommandé

```bash
mysqldump -u root -p smart_ekele_db > backup_$(date +%Y%m%d).sql
```

### Nettoyage des anciennes données

```sql
-- Supprimer les logs d'audit de plus de 1 an
DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Archiver les anciennes années scolaires
-- (créer une base de données d'archive séparée)
```
