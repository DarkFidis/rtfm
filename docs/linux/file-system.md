---
sidebar_position: 1
---

# File-system

## Navigation avec `cd`

Pour naviguer sur un directory : 

```shell
cd <PATH_TO_DIR>
```

Pour retourner sur la valeur de `HOME` : 

```shell
cd
```

ou au dossier racine : 

```shell
cd /
```

## Listing avec `ls`

La commande `ls` sert à afficher le contenu d'un directory dans l'ordre alphabétique : 

```shell
ls
```

La commande met à disposition les flags suivants : 

- `-a` pour inclure les fichiers cachés

- `-l` pour obtenir toutes les infos sur les fichiers du directory. Ces infos s'affichent de la manière suivante : 

```shell
drwxr-xr-x  3 john john  4096 août  15 11:30  Bureau
```

Dans l'ordre : 

- Le type de fichier : `d` pour directory, `l` pour un lien et `-` pour un fichier
- Les permissions
- Compteur de liens physiques
- Propriétaire du fichier
- Groupe propriétaire du fichier
- Taille du fichier (en octets)
- Date de la dernière modification
- Nom de l'élément

- `-lh` : permet d'obtenir la taille lisible des fichiers (par exemple 4Mo)

- `-lt` : permet d'avoir le contenu trié selon leur dernière date de modification

- `-lS` : permet d'avoir le contenu trié selon leur taille

## Statistiques avec `stat`

Pour obtenir toutes les infos sur un directory : 

`stat <DIR>`

## Variables d'environnement

Pour afficher toutes les variables d'environnement : 

```shell
printenv
```

## Ouvrir un fichier avec `xdg-open`

La commande `xdg-open` permet d'ouvrir un fichier ou une URL avec l'application que l'on a définie par défaut pour le fichier concerné 

```shell
xdg-open ~/Bureau
```

```shell
xdg-open http://www.google.fr
```

## Gestion des dossiers

### Création d'un directory

La commande `mkdir` permet de créer un ou plusieurs directories

```shell
mkdir <NEW_DIR_NAME>
```

### Création d'un fichier

La commande `touch` sert à créer un fichier si ce dernier n'existe pas, ou dans le cas contraire à modifier sa dernière date de modification.

```shell
touch <FILE_NAME>
```

### Création d'un lien

La commande `ln` permet de créer un lien vers un fichier/directory

> Il existe deux types de liens : 
> - Les **liens physiques** permettent d'avoir plusieurs noms pour le même contenu de fichier avec le même _inode_, utilisable que pour des fichiers

```shell
ln <FILE_NAME> <OTHER_NAME>
```

> - Les **liens symboliques** sont des raccourcis vers des fichiers. Il pointe sur le nom du fichier et non pas son _inode_ contrairement aux liens physiques

```shell
ln -s <FILE_NAME> <OTHER_NAME>
```

### Suppression

Pour supprimer un fichier/directory, on utilise la commande `rm`

```shell
rm <FILE_NAME>
```

Cette commande dispose d'options : 

- `-i` (interactive) permet de demander une confirmation pour chaque fichier
-  `-r` (recursive) permet de supprimer un dossier et son contenu avec
- `-f` (force) permet d'ignorer tout warning
- `-v` (verbose) affiche tout ce que la commande fait

> Pour simplement déplacer un dossier dans la corbeille, utiliser la commande `gio`

```shell
gio trash <FICHIER>
```

> La commande `rmdir` supprime les dossiers vides


### Copie

```shell
cp <FILE> <DESTINATION>
```

Pour copier le directory et son contenu : 

```shell
cp -r <DIR> <DESTINATION>
```

### Déplacement

La commande `mv` permet de déplacer un fichier ou de le renommer

```shell
mv <FILE> <DESTINATION>
```

```shell
mv <FILE> <NEW_NAME>
```

## Motifs génériques

Les motifs génériques fonctionnent à la manière des expressions régulières : 

- `?` symbolise un seul caractère quelqu'il soit
- `*` symbolise 0 ou plus caractères
- `[]` symbolise au moins un des caractères spécifiés entre les crochets
- `[x-y]` symbolise une intervalle de caractères
- `^` ou `!` symbolise tous les caractères sauf ceux dans les crochets
- `{0..99}` symbolise une séquence de caractères (ici entre 0 et 99)

Exemple d'utilisation des séquences : Obtenir tous les fichiers en `.png` ou `.jpg`

```shell
ls {*.png,*.jpg,}
```