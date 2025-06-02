# GameMasterArtefact# GameMasterArtefact - Bot Discord

**GameMasterArtefact** est un bot Discord conçu pour gérer des personnages de jeu de rôle. Il permet aux utilisateurs de se connecter à leur compte, de consulter leur fiche de personnage, et de lancer des jets de compétences. Il utilise un système de sessions et de fichiers JSON pour stocker les comptes.

## Fonctionnalités principales

- Création et gestion de comptes utilisateurs
- Connexion sécurisée avec mot de passe hashé (`bcrypt`)
- Système de session utilisateur par ID Discord
- Commandes Slash (`/gma`) pour :
  - Connexion (`/gma login`)
  - Affichage de la fiche (`/gma sheet`)
  - Jets de compétence (`/gma roll`)
- Fiches de personnages personnalisées
- Lecture des sous-compétences insensible à la casse

---

---

## Démarrage

```bash
npm install
npm start
```
