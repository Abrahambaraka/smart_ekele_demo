# 📦 Guide d'Installation Rapide - Smart Ekele

## Configuration de la base de données MySQL

### 1️⃣ Créer le fichier de configuration

Copiez le fichier d'exemple et configurez vos paramètres :

```bash
cp .env.example .env
```

Éditez le fichier `.env` et modifiez ces lignes :

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=VOTRE_MOT_DE_PASSE_ICI
DB_NAME=smart_ekele_db
```

### 2️⃣ Installer la base de données

#### Option A : Script automatique (Windows)

Double-cliquez sur `database/install.bat` ou exécutez :

```cmd
cd database
install.bat
```

#### Option B : Script automatique (Linux/Mac)

```bash
cd database
chmod +x install.sh
./install.sh
```

#### Option C : Installation manuelle

1. Connectez-vous à MySQL :

```bash
mysql -u root -p
```

2. Créez la base de données :

```sql
CREATE DATABASE smart_ekele_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_ekele_db;
```

3. Exécutez le schéma :

```sql
SOURCE schema.sql;
```

4. Chargez les données de test (optionnel) :

```sql
SOURCE seed_data.sql;
```

5. Quittez MySQL :

```sql
EXIT;
```

### 3️⃣ Installer les dépendances Node.js

```bash
npm install
```

### 4️⃣ Lancer l'application

**Mode développement :**

```bash
npm run dev
```

Ouvrez votre navigateur sur : `http://localhost:5173`

**Mode production :**

```bash
npm run build
npm run preview
```

## 🎯 Comptes de test

Après l'installation avec les données de test, utilisez ces comptes :

### Directeur d'école
- **Email :** `director@ecole1.cd`
- **Mot de passe :** `password`
- **Rôle :** Gestion d'une école (Complexe Scolaire Ekele)

### Enseignant
- **Email :** `prof1@ecole1.cd`
- **Mot de passe :** `password`
- **Rôle :** Professeur de Mathématiques

## 🔍 Vérifier l'installation

### Tester la connexion à la base de données

```bash
mysql -u root -p smart_ekele_db -e "SHOW TABLES;"
```

Vous devriez voir 17 tables :

```
+---------------------------+
| Tables_in_smart_ekele_db  |
+---------------------------+
| attendance                |
| audit_logs                |
| classes                   |
| fees                      |
| grades                    |
| notification_recipients   |
| notifications             |
| payments                  |
| school_years              |
| schools                   |
| settings                  |
| students                  |
| subjects                  |
| teacher_subjects          |
| teachers                  |
| timetables                |
| users                     |
+---------------------------+
```

### Vérifier les données de test

```bash
mysql -u root -p smart_ekele_db -e "SELECT COUNT(*) as total_users FROM users;"
```

Vous devriez voir 5 utilisateurs.

## ⚠️ Dépannage

### Erreur : "Access denied for user"

Vérifiez que :
- Le mot de passe dans `.env` est correct
- L'utilisateur MySQL a les permissions nécessaires

```sql
GRANT ALL PRIVILEGES ON smart_ekele_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Erreur : "Database does not exist"

La base de données n'a pas été créée. Relancez le script d'installation.

### Erreur : "Cannot find module 'mysql2'"

Installez les dépendances :

```bash
npm install
```

### Port 3306 déjà utilisé

Si MySQL utilise un autre port, modifiez `DB_PORT` dans `.env`.

### Impossible de se connecter à MySQL

Vérifiez que MySQL est démarré :

**Windows :**
```cmd
net start MySQL80
```

**Linux/Mac :**
```bash
sudo systemctl start mysql
# ou
sudo service mysql start
```

## 🔄 Réinitialiser la base de données

Pour recommencer à zéro :

```sql
DROP DATABASE smart_ekele_db;
```

Puis relancez le script d'installation.

## 📊 Sauvegarder la base de données

### Créer un backup manuel

```bash
mysqldump -u root -p smart_ekele_db > database/backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurer depuis un backup

```bash
mysql -u root -p smart_ekele_db < database/backups/backup_YYYYMMDD_HHMMSS.sql
```

## 📞 Besoin d'aide ?

- 📖 Consultez la [documentation complète](./database/README.md)
- 🔍 Voir le [diagramme ER](./database/DIAGRAM.md)
- 🐛 Ouvrez une [issue sur GitHub](https://github.com/Abrahambaraka/smart_ekele_demo/issues)

## ✅ Prochaines étapes

Après l'installation réussie :

1. ✅ Personnalisez les paramètres de l'école dans la page Settings
2. ✅ Créez vos propres utilisateurs (Directeurs, Enseignants)
3. ✅ Ajoutez les classes et matières
4. ✅ Enregistrez les élèves
5. ✅ Commencez à utiliser Smart Ekele !

---

**Smart Ekele** - Système de gestion scolaire moderne pour la RDC 🇨🇩
