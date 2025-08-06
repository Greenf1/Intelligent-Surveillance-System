# Système de Surveillance Intelligent - Version 2

## Aperçu

La **Version 2** du Système de Surveillance Intelligent est une évolution majeure qui introduit des fonctionnalités avancées de gestion des utilisateurs, d'historique des alertes, de notifications et d'optimisations de performance. Cette version maintient la philosophie cloud-first tout en ajoutant des capacités de sécurité et de gestion renforcées.

## Nouvelles Fonctionnalités de la Version 2

### 🔐 Gestion Avancée des Utilisateurs et des Rôles
- **Système de rôles granulaire** : Administrateur, Superviseur, Opérateur
- **Permissions personnalisables** par rôle
- **Interface de gestion des utilisateurs** complète
- **Authentification renforcée** avec hachage bcrypt

### 📊 Historique et Rapports d'Alertes
- **Historique complet** des alertes avec filtres avancés
- **Génération de rapports** en PDF et CSV
- **Statistiques détaillées** par type d'alerte et zone
- **Analyse des tendances** sur 7 et 30 jours

### 📧 Notifications Avancées
- **Notifications par email** automatiques pour les nouvelles alertes
- **Support SMS** (infrastructure prête)
- **Templates d'email** personnalisés avec design responsive
- **Configuration par utilisateur** des préférences de notification

### 🛡️ Sécurité Renforcée
- **Validation stricte** des entrées avec Zod
- **Middleware d'autorisation** basé sur les permissions
- **Gestion sécurisée** des mots de passe
- **Protection contre** les vulnérabilités communes

### ⚡ Optimisations de Performance
- **Requêtes optimisées** avec indexation appropriée
- **Mise en cache** intelligente des données fréquentes
- **Pagination** efficace pour les grandes listes
- **Compression** et optimisation des réponses API

## Architecture Technique

### Backend Amélioré
- **Services modulaires** : UserService, NotificationService
- **Routes organisées** : userRoutes, alertRoutes
- **Middleware personnalisé** pour l'authentification et l'autorisation
- **Scripts d'initialisation** pour les rôles par défaut

### Base de Données Étendue
- **Nouvelles tables** : `roles` pour la gestion des permissions
- **Table users enrichie** : rôles, préférences de notification, statut
- **Table alerts améliorée** : informations de résolution, notes
- **Relations optimisées** avec clés étrangères appropriées

### API RESTful Complète
- **Endpoints CRUD** pour la gestion des utilisateurs
- **API d'historique** avec filtres et pagination
- **Génération de rapports** à la demande
- **Validation automatique** des données d'entrée

## Installation et Configuration

### Prérequis
- Node.js 18+ et npm
- Base de données PostgreSQL (Neon Database recommandée)
- Clés API Google et OpenAI
- Service SMTP pour les notifications email (optionnel)

### Installation

1. **Cloner le dépôt Version 2**
   ```bash
   git clone https://github.com/Greenf1/Intelligent-Surveillance-System.git
   cd Intelligent-Surveillance-System-V2
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   Créez un fichier `.env` avec les variables suivantes :
   ```env
   # Base de données
   DATABASE_URL=your_neon_database_url
   
   # APIs externes
   GOOGLE_API_KEY=your_google_api_key
   OPENAI_API_KEY=your_openai_api_key
   
   # Configuration SMTP (optionnel)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM=your_email@gmail.com
   ```

4. **Initialiser la base de données**
   ```bash
   npm run db:push
   npm run db:init-roles
   ```

5. **Démarrer l'application**
   ```bash
   # Développement
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## Utilisation

### Gestion des Utilisateurs
- **Accès Administrateur** : Créer, modifier, supprimer des comptes utilisateurs
- **Attribution de rôles** : Assigner des permissions spécifiques
- **Notifications de bienvenue** : Envoi automatique d'emails aux nouveaux utilisateurs

### Historique des Alertes
- **Consultation complète** : Toutes les alertes passées avec détails
- **Filtres avancés** : Par date, type, zone, statut de résolution
- **Exportation** : Rapports PDF et CSV personnalisables

### Notifications
- **Configuration personnelle** : Activer/désactiver par canal
- **Alertes temps réel** : Notifications immédiates pour les événements critiques
- **Templates riches** : Emails avec design professionnel et informations détaillées

## Permissions et Rôles

### Administrateur
- Gestion complète des utilisateurs et rôles
- Accès à toutes les fonctionnalités
- Configuration système
- Génération de tous types de rapports

### Superviseur
- Gestion des zones de surveillance
- Résolution des alertes
- Accès aux rapports et statistiques
- Visualisation des analyses

### Opérateur
- Visualisation des alertes
- Résolution des alertes assignées
- Accès limité aux fonctionnalités de base

## API Documentation

### Endpoints Principaux

#### Gestion des Utilisateurs
- `GET /api/users` - Liste des utilisateurs (Admin/Superviseur)
- `POST /api/users` - Créer un utilisateur (Admin)
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur (Admin)

#### Historique des Alertes
- `GET /api/alerts/history` - Historique avec filtres
- `GET /api/alerts/statistics` - Statistiques des alertes
- `GET /api/alerts/report` - Génération de rapports
- `PUT /api/alerts/:id/resolve` - Résoudre une alerte

#### Gestion des Rôles
- `GET /api/users/roles/all` - Liste des rôles
- `POST /api/users/roles` - Créer un rôle (Admin)
- `PUT /api/users/roles/:id` - Modifier un rôle (Admin)

## Sécurité

### Mesures Implémentées
- **Hachage bcrypt** pour les mots de passe
- **Validation Zod** pour toutes les entrées
- **Middleware d'autorisation** basé sur les permissions
- **Sessions sécurisées** avec express-session
- **Protection CORS** configurée

### Bonnes Pratiques
- Mots de passe temporaires pour les nouveaux comptes
- Journalisation des actions sensibles
- Validation côté client et serveur
- Gestion d'erreurs sécurisée

## Déploiement

### Environnement de Production
1. **Variables d'environnement** sécurisées
2. **Base de données** avec sauvegardes automatiques
3. **Service SMTP** configuré pour les notifications
4. **Monitoring** et journalisation activés

### Recommandations
- Utiliser HTTPS en production
- Configurer des sauvegardes régulières
- Mettre en place un monitoring des performances
- Implémenter une rotation des logs

## Migration depuis la Version 1

### Étapes de Migration
1. **Sauvegarde** de la base de données existante
2. **Mise à jour** du schéma avec les nouvelles tables
3. **Initialisation** des rôles par défaut
4. **Migration** des utilisateurs existants vers le nouveau système
5. **Test** complet des fonctionnalités

### Compatibilité
- **API rétrocompatible** pour les endpoints existants
- **Interface utilisateur** mise à jour avec nouvelles fonctionnalités
- **Données existantes** préservées et enrichies

## Support et Contribution

### Signalement de Bugs
Utilisez le système de tickets GitHub pour signaler les problèmes.

### Contribution
1. Fork du dépôt
2. Création d'une branche feature
3. Tests et documentation
4. Pull Request avec description détaillée

### Contact
- **Développeur** : [GreenFad](https://github.com/Greenf1)
- **Email** : contact@greenfad.tech
- **Documentation** : Wiki du projet

## Licence

Ce projet est sous licence [MIT](LICENSE).

---

**Version 2.0.0** - Système de Surveillance Intelligent  
*Une solution complète pour la surveillance moderne avec gestion avancée des utilisateurs et reporting intelligent.*

