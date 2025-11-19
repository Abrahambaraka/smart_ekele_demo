# Script de migration multi-écoles pour Smart Ekele
# Usage: .\migrate-multi-ecoles.ps1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Smart Ekele - Migration Multi-Écoles" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$DB_USER = "root"
$DB_PASSWORD = "root"
$DB_NAME = "smart_ekele_db"
$MIGRATION_FILE = "database\migration_multi_ecoles.sql"

# Vérifier que MySQL est accessible
Write-Host "[1/5] Vérification de MySQL..." -ForegroundColor Yellow
try {
    $mysqlVersion = mysql --version
    Write-Host "✓ MySQL trouvé: $mysqlVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ MySQL non trouvé. Veuillez installer MySQL." -ForegroundColor Red
    exit 1
}

# Vérifier que le fichier de migration existe
Write-Host "[2/5] Vérification du fichier de migration..." -ForegroundColor Yellow
if (Test-Path $MIGRATION_FILE) {
    Write-Host "✓ Fichier de migration trouvé" -ForegroundColor Green
} else {
    Write-Host "✗ Fichier de migration non trouvé: $MIGRATION_FILE" -ForegroundColor Red
    exit 1
}

# Backup de la base de données
Write-Host "[3/5] Backup de la base de données..." -ForegroundColor Yellow
$backupFile = "database\backups\backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
New-Item -ItemType Directory -Force -Path "database\backups" | Out-Null

try {
    mysqldump -u $DB_USER -p"$DB_PASSWORD" $DB_NAME > $backupFile 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Backup créé: $backupFile" -ForegroundColor Green
    } else {
        Write-Host "! Attention: Impossible de créer le backup" -ForegroundColor Yellow
    }
} catch {
    Write-Host "! Attention: Impossible de créer le backup" -ForegroundColor Yellow
}

# Exécution de la migration
Write-Host "[4/5] Exécution de la migration..." -ForegroundColor Yellow
try {
    Get-Content $MIGRATION_FILE | mysql -u $DB_USER -p"$DB_PASSWORD" $DB_NAME 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Migration exécutée avec succès" -ForegroundColor Green
    } else {
        throw "Erreur lors de la migration"
    }
} catch {
    Write-Host "✗ Erreur lors de la migration" -ForegroundColor Red
    Write-Host "Restaurer le backup avec: Get-Content $backupFile | mysql -u $DB_USER -p`"$DB_PASSWORD`" $DB_NAME" -ForegroundColor Yellow
    exit 1
}

# Vérification de la migration
Write-Host "[5/5] Vérification de la migration..." -ForegroundColor Yellow

Write-Host ""
Write-Host "Vérification des rôles..." -ForegroundColor Cyan
mysql -u $DB_USER -p"$DB_PASSWORD" $DB_NAME -e "SELECT role, COUNT(*) as count FROM users GROUP BY role;" 2>$null

Write-Host ""
Write-Host "Vérification des écoles..." -ForegroundColor Cyan
mysql -u $DB_USER -p"$DB_PASSWORD" $DB_NAME -e "SELECT * FROM v_school_stats;" 2>$null

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Migration terminée avec succès! 🎉" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Comptes de test créés:" -ForegroundColor Yellow
Write-Host ""
Write-Host "École 1 - Complexe Scolaire Ekele:" -ForegroundColor Cyan
Write-Host "  Directeur: directeur@demo.com / password123" -ForegroundColor White
Write-Host "  Professeur: professeur@demo.com / password123" -ForegroundColor White
Write-Host ""
Write-Host "École 2 - Lycée Moderne de Kinshasa:" -ForegroundColor Cyan
Write-Host "  Directeur: directeur.lycee@smartekele.com / admin123" -ForegroundColor White
Write-Host "  Professeur: prof.lycee@smartekele.com / admin123" -ForegroundColor White
Write-Host ""

Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Démarrer le backend: npm run server:dev" -ForegroundColor White
Write-Host "2. Démarrer le frontend: npm run dev" -ForegroundColor White
Write-Host "3. Tester l'isolation multi-écoles" -ForegroundColor White
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "- Guide complet: MULTI_ECOLES_README.md" -ForegroundColor White
Write-Host "- Architecture: ARCHITECTURE_DATABASE.txt" -ForegroundColor White
Write-Host "- Migration: database/MIGRATION_GUIDE.md" -ForegroundColor White
Write-Host ""
