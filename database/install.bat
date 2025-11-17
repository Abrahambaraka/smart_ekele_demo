@echo off
REM Smart Ekele Database Installation Script for Windows
REM Ce script initialise la base de données MySQL

echo Installation de la base de donnees Smart Ekele...
echo.

REM Vérifier si .env existe
if not exist .env (
    echo Fichier .env introuvable. Veuillez le creer a partir de .env.example
    pause
    exit /b 1
)

REM Charger les variables depuis .env
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if not "%%a"=="" if not "%%b"=="" set %%a=%%b
)

REM Vérifier les variables requises
if "%DB_HOST%"=="" (
    echo Variable DB_HOST manquante dans .env
    pause
    exit /b 1
)

if "%DB_USER%"=="" (
    echo Variable DB_USER manquante dans .env
    pause
    exit /b 1
)

if "%DB_NAME%"=="" (
    echo Variable DB_NAME manquante dans .env
    pause
    exit /b 1
)

REM Créer la base de données
echo Creation de la base de donnees '%DB_NAME%'...
mysql -h%DB_HOST% -u%DB_USER% -p -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %errorlevel% neq 0 (
    echo Erreur lors de la creation de la base de donnees
    pause
    exit /b 1
)

echo Base de donnees creee avec succes
echo.

REM Exécuter le schéma
echo Installation du schema...
mysql -h%DB_HOST% -u%DB_USER% -p %DB_NAME% < database\schema.sql

if %errorlevel% neq 0 (
    echo Erreur lors de l'installation du schema
    pause
    exit /b 1
)

echo Schema installe avec succes
echo.

REM Demander pour les données de test
set /p load_seed="Voulez-vous charger les donnees de test? (o/n): "

if /i "%load_seed%"=="o" (
    echo Chargement des donnees de test...
    mysql -h%DB_HOST% -u%DB_USER% -p %DB_NAME% < database\seed_data.sql
    
    if %errorlevel% neq 0 (
        echo Erreur lors du chargement des donnees de test
    ) else (
        echo Donnees de test chargees avec succes
        echo.
        echo Utilisateurs de test crees:
        echo    - Super Admin: admin@smartekele.cd (mot de passe: password)
        echo    - Directeur: director@ecole1.cd (mot de passe: password)
        echo    - Enseignant: prof1@ecole1.cd (mot de passe: password)
    )
)

echo.
echo Installation de la base de donnees terminee!
echo Vous pouvez maintenant demarrer l'application
pause
