#!/bin/bash

# Smart Ekele Database Installation Script
# Ce script initialise la base de données MySQL

echo "🚀 Installation de la base de données Smart Ekele..."

# Charger les variables d'environnement
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Fichier .env introuvable. Veuillez le créer à partir de .env.example"
    exit 1
fi

# Vérifier les variables requises
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
    echo "❌ Variables d'environnement manquantes (DB_HOST, DB_USER, DB_NAME)"
    exit 1
fi

# Demander le mot de passe si non défini
if [ -z "$DB_PASSWORD" ]; then
    read -sp "Mot de passe MySQL: " DB_PASSWORD
    echo
fi

# Fonction pour exécuter des commandes SQL
run_sql() {
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$1" < "$2"
}

# Créer la base de données si elle n'existe pas
echo "📦 Création de la base de données '$DB_NAME'..."
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if [ $? -eq 0 ]; then
    echo "✅ Base de données créée ou déjà existante"
else
    echo "❌ Erreur lors de la création de la base de données"
    exit 1
fi

# Exécuter le schéma
echo "📋 Installation du schéma..."
run_sql "$DB_NAME" "database/schema.sql"

if [ $? -eq 0 ]; then
    echo "✅ Schéma installé avec succès"
else
    echo "❌ Erreur lors de l'installation du schéma"
    exit 1
fi

# Demander si on veut charger les données de test
read -p "Voulez-vous charger les données de test? (o/n): " load_seed
if [ "$load_seed" = "o" ] || [ "$load_seed" = "O" ]; then
    echo "📊 Chargement des données de test..."
    run_sql "$DB_NAME" "database/seed_data.sql"
    
    if [ $? -eq 0 ]; then
        echo "✅ Données de test chargées avec succès"
        echo ""
        echo "📝 Utilisateurs de test créés:"
        echo "   - Super Admin: admin@smartekele.cd (mot de passe: password)"
        echo "   - Directeur: director@ecole1.cd (mot de passe: password)"
        echo "   - Enseignant: prof1@ecole1.cd (mot de passe: password)"
    else
        echo "❌ Erreur lors du chargement des données de test"
    fi
fi

echo ""
echo "✅ Installation de la base de données terminée!"
echo "🎉 Vous pouvez maintenant démarrer l'application"
