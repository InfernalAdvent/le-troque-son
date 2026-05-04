SET NAMES utf8mb4;

DROP DATABASE IF EXISTS le_troque_son;
CREATE DATABASE le_troque_son
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE le_troque_son;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------
-- DEPARTEMENTS
-- ----------------------------------------------

CREATE TABLE departements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    numero VARCHAR(3) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ----------------------------------------------
-- CATEGORIES
-- ----------------------------------------------

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    parent_id INT DEFAULT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_categories_parent
        FOREIGN KEY (parent_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------
-- USERS
-- ----------------------------------------------

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(25) NOT NULL,
    prenom VARCHAR(20),
    email VARCHAR(255) NOT NULL UNIQUE,
    pseudo VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    departement_numero VARCHAR(3) DEFAULT NULL,
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion DATETIME DEFAULT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,

    INDEX idx_users_departement (departement_numero),

    CONSTRAINT fk_users_departement
        FOREIGN KEY (departement_numero)
        REFERENCES departements(numero)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------
-- ANNONCES
-- ----------------------------------------------

CREATE TABLE annonces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorie_id INT NOT NULL,
    titre VARCHAR(25) NOT NULL,
    description TEXT,
    prix DECIMAL(10,2) DEFAULT NULL,
    etat VARCHAR(255) NOT NULL,
    echange_souhaite_texte VARCHAR(50) DEFAULT NULL,
    date_publication DATETIME DEFAULT CURRENT_TIMESTAMP,
    ville VARCHAR(45) NOT NULL,
    code_postal VARCHAR(5) NOT NULL,
    user_id INT DEFAULT NULL,
    departement_numero VARCHAR(3) NOT NULL,
    deleted_at DATETIME DEFAULT NULL,

    INDEX idx_annonces_categorie (categorie_id),
    INDEX idx_annonces_user (user_id),
    INDEX idx_annonces_departement (departement_numero),

    CONSTRAINT fk_annonces_categorie
        FOREIGN KEY (categorie_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_annonces_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_annonces_departement
        FOREIGN KEY (departement_numero)
        REFERENCES departements(numero)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------
-- WISHLIST
-- ----------------------------------------------

CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    souhait_texte VARCHAR(255) DEFAULT NULL,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_wishlist_user (user_id),

    CONSTRAINT fk_wishlist_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------
-- CONVERSATIONS
-- ----------------------------------------------

CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    annonce_id INT NOT NULL,
    utilisateur_initiateur_id INT NOT NULL,
    utilisateur_receveur_id INT NOT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_derniere_activite DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    masquee_par_initiateur BOOLEAN DEFAULT FALSE,
    masquee_par_receveur BOOLEAN DEFAULT FALSE,

    UNIQUE KEY unique_conversation (
        annonce_id,
        utilisateur_initiateur_id,
        utilisateur_receveur_id
    ),

    INDEX idx_conversations_annonce (annonce_id),
    INDEX idx_conversations_initiateur (utilisateur_initiateur_id),
    INDEX idx_conversations_receveur (utilisateur_receveur_id),

    CONSTRAINT fk_conversations_annonce
        FOREIGN KEY (annonce_id)
        REFERENCES annonces(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_conversations_initiateur
        FOREIGN KEY (utilisateur_initiateur_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_conversations_receveur
        FOREIGN KEY (utilisateur_receveur_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------
-- MESSAGES
-- ----------------------------------------------

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    expediteur_id INT NOT NULL,
    contenu TEXT NOT NULL,
    date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
    lu_par_destinataire BOOLEAN DEFAULT FALSE,

    INDEX idx_messages_conversation (conversation_id),
    INDEX idx_messages_expediteur (expediteur_id),

    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_messages_expediteur
        FOREIGN KEY (expediteur_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------
-- PHOTOS
-- ----------------------------------------------

CREATE TABLE photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    annonce_id INT DEFAULT NULL,
    user_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    ordre INT DEFAULT 0,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_photos_annonce (annonce_id),
    INDEX idx_photos_user (user_id),

    CONSTRAINT fk_photos_annonce
        FOREIGN KEY (annonce_id)
        REFERENCES annonces(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_photos_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;