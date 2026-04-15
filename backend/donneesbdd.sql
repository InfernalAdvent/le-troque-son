-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 09 mars 2026 à 18:39
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `le_troque_son`
--
--
-- Déchargement des données de la table `departements`
--

INSERT INTO `departements` (`id`, `nom`, `numero`) VALUES
(1, 'Ain', '01'),
(2, 'Aisne', '02'),
(3, 'Allier', '03'),
(4, 'Alpes-de-Haute-Provence', '04'),
(5, 'Hautes-Alpes', '05'),
(6, 'Alpes-Maritimes', '06'),
(7, 'Ardèche', '07'),
(8, 'Ardennes', '08'),
(9, 'Ariège', '09'),
(10, 'Aube', '10'),
(11, 'Aude', '11'),
(12, 'Aveyron', '12'),
(13, 'Bouches-du-Rhône', '13'),
(14, 'Calvados', '14'),
(15, 'Cantal', '15'),
(16, 'Charente', '16'),
(17, 'Charente-Maritime', '17'),
(18, 'Cher', '18'),
(19, 'Corrèze', '19'),
(20, 'Corse-du-Sud', '2A'),
(21, 'Haute-Corse', '2B'),
(22, 'Côte-d\'Or', '21'),
(23, 'Côtes-d\'Armor', '22'),
(24, 'Creuse', '23'),
(25, 'Dordogne', '24'),
(26, 'Doubs', '25'),
(27, 'Drôme', '26'),
(28, 'Eure', '27'),
(29, 'Eure-et-Loir', '28'),
(30, 'Finistère', '29'),
(31, 'Gard', '30'),
(32, 'Haute-Garonne', '31'),
(33, 'Gers', '32'),
(34, 'Gironde', '33'),
(35, 'Hérault', '34'),
(36, 'Ille-et-Vilaine', '35'),
(37, 'Indre', '36'),
(38, 'Indre-et-Loire', '37'),
(39, 'Isère', '38'),
(40, 'Jura', '39'),
(41, 'Landes', '40'),
(42, 'Loir-et-Cher', '41'),
(43, 'Loire', '42'),
(44, 'Haute-Loire', '43'),
(45, 'Loire-Atlantique', '44'),
(46, 'Loiret', '45'),
(47, 'Lot', '46'),
(48, 'Lot-et-Garonne', '47'),
(49, 'Lozère', '48'),
(50, 'Maine-et-Loire', '49'),
(51, 'Manche', '50'),
(52, 'Marne', '51'),
(53, 'Haute-Marne', '52'),
(54, 'Mayenne', '53'),
(55, 'Meurthe-et-Moselle', '54'),
(56, 'Meuse', '55'),
(57, 'Morbihan', '56'),
(58, 'Moselle', '57'),
(59, 'Nièvre', '58'),
(60, 'Nord', '59'),
(61, 'Oise', '60'),
(62, 'Orne', '61'),
(63, 'Pas-de-Calais', '62'),
(64, 'Puy-de-Dôme', '63'),
(65, 'Pyrénées-Atlantique', '64'),
(66, 'Hautes-Pyrénées', '65'),
(67, 'Pyrénées-Orientales', '66'),
(68, 'Bas-Rhin', '67'),
(69, 'Haut-Rhin', '68'),
(70, 'Rhône', '69'),
(71, 'Haute-Saône', '70'),
(72, 'Saône-et-Loire', '71'),
(73, 'Sarthe', '72'),
(74, 'Savoie', '73'),
(75, 'Haute-Savoie', '74'),
(76, 'Paris', '75'),
(77, 'Seine-Maritime', '76'),
(78, 'Seine-et-Marne', '77'),
(79, 'Yvelines', '78'),
(80, 'Deux-Sèvres', '79'),
(81, 'Somme', '80'),
(82, 'Tarn', '81'),
(83, 'Tarn-et-Garonne', '82'),
(84, 'Var', '83'),
(85, 'Vaucluse', '84'),
(86, 'Vendée', '85'),
(87, 'Vienne', '86'),
(88, 'Haute-Vienne', '87'),
(89, 'Vosges', '88'),
(90, 'Yonne', '89'),
(91, 'Territoire de Belfort', '90'),
(92, 'Essonne', '91'),
(93, 'Hauts-de-Seine', '92'),
(94, 'Seine-Saint-Denis', '93'),
(95, 'Val-de-Marne', '94'),
(96, 'Val-d\'Oise', '95'),
(97, 'Guadeloupe', '971'),
(98, 'Martinique', '972'),
(99, 'Guyane', '973'),
(100, 'La Réunion', '974'),
(101, 'Mayotte', '976'),
(102, 'A compléter', '');

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `nom`, `parent_id`, `date_creation`) VALUES
(1, 'Instruments', NULL, '2025-10-27 18:29:04'),
(2, 'Musique', NULL, '2025-10-27 18:29:04'),
(3, 'Guitares', 1, '2025-10-27 18:30:05'),
(4, 'Amplificateurs', 1, '2025-10-27 18:30:05'),
(5, 'Basses', 1, '2025-10-27 18:30:05'),
(6, 'Claviers', 1, '2025-10-27 18:30:05'),
(7, 'Batterie', 1, '2025-10-27 18:30:05'),
(8, 'CD', 2, '2025-10-27 18:30:05'),
(9, 'Vinyles', 2, '2025-10-27 18:30:05'),
(10, 'Cassettes', 2, '2025-10-27 18:30:05'),
(11, 'Guitares Électriques', 3, '2025-10-27 18:31:18'),
(12, 'Guitares Acoustiques', 3, '2025-10-27 18:31:18'),
(13, 'Ampli Guitares', 4, '2025-10-27 18:31:18'),
(14, 'Ampli Basses', 4, '2025-10-27 18:31:18');



/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
