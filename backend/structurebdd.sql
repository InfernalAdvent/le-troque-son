SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS le_troque_son;
USE le_troque_son;

-- ----------------------------------------------
-- DEPARTEMENTS
-- ----------------------------------------------

CREATE TABLE departements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    numero VARCHAR(3) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------
-- CATEGORIES
-- ----------------------------------------------

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    parent_id INT DEFAULT NULL,
    date_creation DATETIME DEFAULT NULL,

    FOREIGN KEY (parent_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------
-- USERS
-- ----------------------------------------------

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(25) NOT NULL,
    prenom VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    pseudo VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    departement_numero VARCHAR(3),
    date_inscription DATETIME,
    derniere_connexion DATETIME,
    avatar_url VARCHAR(255),

    INDEX(departement_numero),

    FOREIGN KEY (departement_numero)
        REFERENCES departements(numero)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------
-- ANNONCES
-- ----------------------------------------------

CREATE TABLE annonces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorie_id INT NOT NULL,
    titre VARCHAR(25) NOT NULL,
    description TEXT,
    prix DECIMAL(10,2),
    etat VARCHAR(255) NOT NULL,
    echange_souhaite_texte VARCHAR(50),
    date_publication DATETIME,
    ville VARCHAR(45) NOT NULL,
    code_postal VARCHAR(5) NOT NULL,
    user_id INT,
    departement_numero VARCHAR(3) NOT NULL,
    deleted_at DATETIME,

    INDEX(categorie_id),
    INDEX(user_id),
    INDEX(departement_numero),

    FOREIGN KEY (categorie_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE,

    FOREIGN KEY (departement_numero)
        REFERENCES departements(numero)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------
-- WISHLIST
-- ----------------------------------------------

CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    souhait_texte VARCHAR(255),
    date_ajout DATETIME,

    INDEX(user_id),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------
-- CONVERSATIONS
-- ----------------------------------------------

CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    annonce_id INT NOT NULL,
    utilisateur_initiateur_id INT NOT NULL,
    utilisateur_receveur_id INT NOT NULL,
    date_creation DATETIME,
    date_derniere_activite DATETIME NOT NULL,
    masquee_par_initiateur BOOLEAN DEFAULT FALSE,
    masquee_par_receveur BOOLEAN DEFAULT FALSE,

    UNIQUE KEY unique_conversation
        (annonce_id, utilisateur_initiateur_id, utilisateur_receveur_id),

    FOREIGN KEY (annonce_id)
        REFERENCES annonces(id)
        ON UPDATE CASCADE,

    FOREIGN KEY (utilisateur_initiateur_id)
        REFERENCES users(id)
        ON UPDATE CASCADE,

    FOREIGN KEY (utilisateur_receveur_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------
-- MESSAGES
-- ----------------------------------------------

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    expediteur_id INT NOT NULL,
    contenu TEXT NOT NULL,
    date_envoi DATETIME,
    lu_par_destinataire BOOLEAN DEFAULT FALSE,

    INDEX(conversation_id),
    INDEX(expediteur_id),

    FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (expediteur_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------
-- PHOTOS
-- ----------------------------------------------

CREATE TABLE photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    annonce_id INT,
    user_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    ordre INT DEFAULT 0,
    date_ajout DATETIME,

    INDEX(annonce_id),
    INDEX(user_id),

    FOREIGN KEY (annonce_id)
        REFERENCES annonces(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;