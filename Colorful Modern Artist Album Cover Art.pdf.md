# Guide de Déploiement - Système de Surveillance Intelligent V2

## Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration de l'Environnement](#configuration-de-lenvironnement)
3. [Installation](#installation)
4. [Configuration de la Base de Données](#configuration-de-la-base-de-données)
5. [Configuration des Services Externes](#configuration-des-services-externes)
6. [Déploiement en Production](#déploiement-en-production)
7. [Monitoring et Maintenance](#monitoring-et-maintenance)
8. [Dépannage](#dépannage)

## Prérequis

### Environnement Système
- **Serveur** : Linux Ubuntu 20.04+ ou CentOS 8+
- **RAM** : Minimum 2GB, recommandé 4GB+
- **Stockage** : Minimum 10GB d'espace libre
- **Réseau** : Accès Internet pour les APIs externes

### Logiciels Requis
- **Node.js** : Version 18.x ou supérieure
- **npm** : Version 8.x ou supérieure
- **Git** : Pour le clonage du dépôt
- **PM2** : Pour la gestion des processus (optionnel mais recommandé)

### Services Externes
- **Base de données** : PostgreSQL 13+ (Neon Database recommandée)
- **Service SMTP** : Gmail, SendGrid, ou autre fournisseur
- **APIs** : Clés Google Maps API et OpenAI API

## Configuration de l'Environnement

### 1. Installation de Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Vérification
node --version
npm --version
```

### 2. Installation de PM2 (Recommandé)

```bash
npm install -g pm2
pm2 startup
```

### 3. Configuration du Firewall

```bash
# Ubuntu UFW
sudo ufw allow 5000/tcp
sudo ufw allow ssh
sudo ufw enable

# CentOS Firewalld
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload
```

## Installation

### 1. Clonage du Dépôt

```bash
cd /opt
sudo git clone https://github.com/Greenf1/Intelligent-Surveillance-System.git
sudo mv Intelligent-Surveillance-System Intelligent-Surveillance-System-V2
sudo chown -R $USER:$USER Intelligent-Surveillance-System-V2
cd Intelligent-Surveillance-System-V2
```

### 2. Installation des Dépendances

```bash
npm install --production
```

### 3. Build de l'Application

```bash
npm run build
```

## Configuration de la Base de Données

### Option 1 : Neon Database (Recommandée)

1. **Créer un compte** sur [Neon.tech](https://neon.tech)
2. **Créer une nouvelle base de données**
3. **Copier l'URL de connexion** fournie

### Option 2 : PostgreSQL Local

```bash
# Installation PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Configuration
sudo -u postgres createuser --interactive
sudo -u postgres createdb surveillance_system

# URL de connexion
postgresql://username:password@localhost:5432/surveillance_system
```

### Initialisation du Schéma

```bash
# Configuration de l'URL dans .env
echo "DATABASE_URL=your_database_url_here" > .env

# Application du schéma
npm run db:push

# Initialisation des rôles
npm run db:init-roles
```

## Configuration des Services Externes

### 1. Configuration des Variables d'Environnement

Créer le fichier `.env` :

```bash
cat > .env << EOF
# Base de données
DATABASE_URL=postgresql://username:password@host:port/database

# APIs externes
OPENAI_API_KEY=sk-your-openai-key-here
GOOGLE_API_KEY=your-google-api-key-here

# Configuration SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=alerts@yourdomain.com

# Configuration de session
SESSION_SECRET=your-very-long-random-secret-here

# Environnement
NODE_ENV=production
PORT=5000
EOF
```

### 2. Obtention des Clés API

#### OpenAI API
1. Créer un compte sur [OpenAI](https://platform.openai.com)
2. Générer une clé API dans les paramètres
3. Ajouter des crédits si nécessaire

#### Google Maps API
1. Créer un projet sur [Google Cloud Console](https://console.cloud.google.com)
2. Activer l'API Google Maps
3. Créer une clé API avec les restrictions appropriées

#### Configuration SMTP Gmail
1. Activer l'authentification à deux facteurs
2. Générer un mot de passe d'application
3. Utiliser ce mot de passe dans `SMTP_PASS`

## Déploiement en Production

### 1. Configuration avec PM2

Créer le fichier `ecosystem.config.js` :

```javascript
module.exports = {
  apps: [{
    name: 'surveillance-system-v2',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 2. Démarrage de l'Application

```bash
# Créer le dossier de logs
mkdir -p logs

# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Vérifier le statut
pm2 status
pm2 logs surveillance-system-v2
```

### 3. Configuration du Reverse Proxy (Nginx)

```bash
# Installation Nginx
sudo apt-get install nginx

# Configuration
sudo tee /etc/nginx/sites-available/surveillance-system << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Activation
sudo ln -s /etc/nginx/sites-available/surveillance-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Configuration SSL avec Let's Encrypt

```bash
# Installation Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtention du certificat
sudo certbot --nginx -d your-domain.com

# Vérification du renouvellement automatique
sudo certbot renew --dry-run
```

## Monitoring et Maintenance

### 1. Monitoring avec PM2

```bash
# Monitoring en temps réel
pm2 monit

# Logs
pm2 logs surveillance-system-v2 --lines 100

# Redémarrage
pm2 restart surveillance-system-v2

# Rechargement sans downtime
pm2 reload surveillance-system-v2
```

### 2. Sauvegarde de la Base de Données

```bash
# Script de sauvegarde
cat > backup.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p \$BACKUP_DIR

# Sauvegarde de la base de données
pg_dump \$DATABASE_URL > \$BACKUP_DIR/surveillance_\$DATE.sql

# Nettoyage des anciennes sauvegardes (garde 7 jours)
find \$BACKUP_DIR -name "surveillance_*.sql" -mtime +7 -delete

echo "Backup completed: surveillance_\$DATE.sql"
EOF

chmod +x backup.sh

# Cron pour sauvegarde quotidienne
echo "0 2 * * * /opt/Intelligent-Surveillance-System-V2/backup.sh" | crontab -
```

### 3. Rotation des Logs

```bash
# Configuration logrotate
sudo tee /etc/logrotate.d/surveillance-system << EOF
/opt/Intelligent-Surveillance-System-V2/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

### 4. Monitoring des Ressources

```bash
# Installation de htop pour monitoring
sudo apt-get install htop

# Monitoring de l'espace disque
df -h

# Monitoring de la mémoire
free -h

# Monitoring des processus Node.js
ps aux | grep node
```

## Dépannage

### Problèmes Courants

#### 1. Application ne démarre pas

```bash
# Vérifier les logs
pm2 logs surveillance-system-v2

# Vérifier la configuration
node -c dist/index.js

# Vérifier les variables d'environnement
cat .env
```

#### 2. Erreurs de base de données

```bash
# Tester la connexion
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? err : res.rows[0]);
  pool.end();
});
"
```

#### 3. Problèmes de permissions

```bash
# Vérifier les permissions des fichiers
ls -la /opt/Intelligent-Surveillance-System-V2

# Corriger les permissions si nécessaire
sudo chown -R $USER:$USER /opt/Intelligent-Surveillance-System-V2
```

#### 4. Problèmes de mémoire

```bash
# Augmenter la limite mémoire Node.js
pm2 delete surveillance-system-v2
pm2 start ecosystem.config.js --node-args="--max-old-space-size=2048"
```

### Commandes de Diagnostic

```bash
# Statut général du système
systemctl status nginx
pm2 status
df -h
free -h

# Logs détaillés
journalctl -u nginx -f
pm2 logs surveillance-system-v2 --lines 50

# Test de connectivité
curl -I http://localhost:5000
curl -I https://your-domain.com
```

### Support et Escalade

En cas de problème persistant :

1. **Collecter les informations** :
   - Logs de l'application (`pm2 logs`)
   - Logs système (`journalctl`)
   - Configuration (`.env` sans les secrets)
   - Version Node.js et npm

2. **Contacter le support** :
   - Email : contact@greenfad.tech
   - GitHub Issues : [Lien vers le dépôt]

## Mise à Jour

### Procédure de Mise à Jour

```bash
# Sauvegarde avant mise à jour
./backup.sh

# Arrêt de l'application
pm2 stop surveillance-system-v2

# Mise à jour du code
git pull origin main
npm install --production
npm run build

# Mise à jour de la base de données si nécessaire
npm run db:push

# Redémarrage
pm2 start surveillance-system-v2

# Vérification
pm2 logs surveillance-system-v2 --lines 20
```

## Sécurité en Production

### Recommandations de Sécurité

1. **Firewall** : Limiter l'accès aux ports nécessaires
2. **SSL/TLS** : Utiliser HTTPS obligatoirement
3. **Mots de passe** : Utiliser des mots de passe forts
4. **Mises à jour** : Maintenir le système à jour
5. **Monitoring** : Surveiller les tentatives d'intrusion

### Checklist de Sécurité

- [ ] Firewall configuré et actif
- [ ] SSL/TLS configuré avec certificats valides
- [ ] Variables d'environnement sécurisées
- [ ] Accès SSH sécurisé (clés, pas de root)
- [ ] Logs de sécurité activés
- [ ] Sauvegardes régulières testées
- [ ] Monitoring des ressources en place

---

Ce guide de déploiement assure une installation sécurisée et robuste du Système de Surveillance Intelligent V2 en environnement de production.

