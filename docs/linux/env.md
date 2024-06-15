---
sidebar_position: 8
---

# L'environnement

## Variables d'environnement

Choses à savoir : 

- Les variables d'environnement permettent de configurer le fonctionnement des programmes sur le système. Leur valeur est locale, donc spécifique
au process pour lequel elles ont été définies.

> Si on lance un shell pour modifier une variable d'environnement, cette dernière ne sera modifiée que pour notre shell

- Lorsqu'un process parent créé un process enfant, ce dernier hérite des valeurs des variables du process parent.

- Par convention, une variable d'environnement sont en majscules, précédées d'un `_`

- Les variables d'environnement sont sensibles à la casse

## Gestion des variables

### Création

```shell
export MYVAR=valeur
```

### Lecture

Pour afficher une variable d'environnement : 

```shell
printenv PATH
```

ou

```shell
echo $PATH
```

### Suppression

```shell
unset MYVAR
```

### Variables principales

- `PATH` contient le chemin des programmes correspondants à la commande entrée
- `LANG` : langue du système
- `PAGER` : application utilisée pour la pagination
- `EDITOR` permet de définir l'éditeur de texte par défaut
- `USERNAME` : nom de l'utilisateur connecté
- `HOME` : chemin vers le répertoire perso de l'utilisateur
- `PWD` : répertoire courant
- `SHELL` : Shell par défaut

## Fichiers d'environnement

### Fichier profile

Le fichier `~/.profile` permet de définir les variables propres à chaque utilisateur. Lorsqu'un utilisateur se connecte à un shell, il
est éxecuté après `/etc/profile`

### Fichier bash_profile

Le fichier `~/.bash_profile` est chargé à la place de `~/.profile` uniquement sur les login shell

### Fichier bashrc

Le fichier `~/.bashrc` permet de définir les variables pour le shell qu'on lance

### Fichier etc/profile

Le fichier `/etc/profile` est executé automatiquement au lancement du shell et ce, pour tous les utilisateurs et pour tout type de connexion
(Shell interactif, connexion SSH).