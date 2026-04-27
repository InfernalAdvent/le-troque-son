# 🎸 Le Troque Son

**Le Troque Son** est une marketplace dédiée à la musique et aux instruments d'occasion. Elle permet aux utilisateurs d'acheter, vendre et échanger des guitares, basses, claviers, vinyles et bien plus encore.

---

## Stack technique

| Côté | Technologie |
|------|-------------|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Base de données | MySQL (via Sequelize) |
| Authentification | JWT (cookie httpOnly) |
| Stockage des images | Cloudinary |

---

## Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [XAMPP](https://www.apachefriends.org/) (pour MySQL et phpMyAdmin)
- Un compte [Cloudinary](https://cloudinary.com/) (gratuit) pour la gestion des uploads

---

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/InfernalAdvent/le-troque-son.git
cd le-troque-son
```

### 2. Installer les dépendances

**Backend :**
```bash
cd backend/api
npm install
```

**Frontend :**
```bash
cd frontend
npm install
```

---

## Base de données

### Démarrer MySQL via XAMPP

1. Ouvrir le panneau de contrôle XAMPP
2. Démarrer les services **Apache** et **MySQL**
3. Accéder à [phpMyAdmin](http://localhost/phpmyadmin)

### Importer la structure et les données

1. Créer une nouvelle base de données (ex: `le_troque_son`)
2. Importer le fichier de structure : `database/structure.sql`
3. Importer le fichier de données essentielles : `database/data.sql`

> Ces deux fichiers se trouvent dans le dossier backend/database à la racine du projet.

---

##  Variables d'environnement

### Backend

Créer un fichier `.env` dans `backend/api/` en vous basant sur le fichier `.env.example` présent à la racine

>  Les clés Cloudinary sont **obligatoires** pour que les uploads de photos d'annonces et d'avatars fonctionnent. Sans elles, toute tentative d'upload échouera.
>
> Pour les obtenir : connectez-vous sur [cloudinary.com](https://cloudinary.com) → **Settings** → **API Keys**

### Frontend

Créer un fichier `.env` dans `frontend/` en vous basant sur `.env.example` présent à la racine du dossier

---

##  Lancer le projet

### Backend

```bash
cd backend/api
npm run dev
```

Le serveur démarre sur [http://localhost:5000](http://localhost:5000)

### Frontend

```bash
cd frontend
npm run dev
```

L'application est accessible sur [http://localhost:5173](http://localhost:5173)

---

## Build de production (frontend)

```bash
cd frontend
npm run build
```

Les fichiers compilés seront générés dans le dossier `dist/`.

---

## Déploiement

Le projet est conçu pour être déployé sur des services cloud. Voici quelques options possibles :

**Backend + Base de données**
- [Railway](https://railway.app/) — simple et rapide, idéal pour des projets Node.js/MySQL
- [Render](https://render.com/) — alternative gratuite à Railway
- [OVH](https://www.ovhcloud.com/) — hébergeur français, plus adapté pour une mise en production professionnelle avec un VPS

**Frontend**
- [Vercel](https://vercel.com/) — optimisé pour les apps React/Vite
- [Netlify](https://www.netlify.com/) — alternative populaire à Vercel
- [OVH](https://www.ovhcloud.com/) — possible via un hébergement web statique

**Stockage images**
- [Cloudinary](https://cloudinary.com/) — déjà intégré dans le projet

En production, penser à mettre à jour :
- `NODE_ENV=production` dans le `.env` backend
- `ALLOWED_ORIGINS` avec les URLs de production
- `VITE_API_URL` avec l'URL du backend en production

---

## Fonctionnalités principales

-  Dépôt et gestion d'annonces (photos, description, état, localisation)
-  Recherche et filtrage par département et catégorie
-  Messagerie entre utilisateurs
-  Wishlist personnalisée
-  Profil utilisateur avec avatar
-  Authentification sécurisée (JWT, CSRF, rate limiting)
