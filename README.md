# GameMasterArtefact - Bot Discord

**GameMasterArtefact** est un bot Discord conçu pour gérer des personnages de jeu de rôle. Il permet aux utilisateurs de se connecter à leur compte, de consulter leur fiche de personnage, et de lancer des jets de compétences. Il utilise un système de sessions et de fichiers JSON pour stocker les comptes.

---

## Fonctionnalités principales

- Création et gestion de comptes utilisateurs
- Connexion sécurisée avec mot de passe hashé (`bcrypt`)
- Système de session utilisateur par ID Discord
- Fiches de personnages personnalisées (stats et sous-compétences)
- Lecture des sous-compétences insensible à la casse
- Support MJ pour consulter les fiches d’autres joueurs

---

## Commande de démarrage

```bash
npm install       # Installe les dépendances nécessaires
npm install bcrypt # Installe les dépendances nécessaires pour encrypter les mots de passes
npm install discord.js # Installe les dépendances nécessaires pour Discord
npm run deploy    # Déploie les commandes slash sur le serveur Discord
npm start         # Lance le bot
```

---

## Commandes

### `/gma login <username>`

Se connecter à un compte utilisateur (le mot de passe est fourni en privé).

### `/gma logout`

Déconnexion du compte actuel et nettoyage de la session.

### `/gma register`

Créer un nouveau compte utilisateur, un personnage et ça fiche.

### `/gma sheet`

Affiche la fiche complète de l’utilisateur connecté.

### `/gma sheet stat:<nom>`

Affiche une statistique ou une sous-compétence :

```
/gma sheet stat:intellect
/gma sheet stat:combatDistance
```

### `/gma sheet stats:<valeurs>`

Affiche plusieurs statistiques séparées par des virgules :

```
/gma sheet stats:intellect, agilité, combatadistance
```

### `/gma sheet user:<username>`

(MJ uniquement) Affiche la fiche complète d’un autre joueur :

```
/gma sheet user:akira
```

### `/gma sheet query:<valeur>`

Accès abrégé à une statistique ou fiche partielle :

```
/gma sheet query:combatDistance
/gma sheet query:akira:combatDistance
```

### `/gma roll <compétence>`

Lance un jet de compétence ou de caractéristique :

```
/gma roll corps
/gma roll corps-combatdistance
```

### `/gma update <clé> <valeur>`

Met à jour une stat ou une valeur du personnage.

### `/gma clear`

Supprime la session de l’utilisateur connecté.

---

Développé dans le cadre du projet **GameMasterArtefact**.
