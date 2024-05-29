---
sidebar_position: 3
---

# Manipulation des fichiers

## Lecture

### less

Le programme `less` est un lecteur de fichier avec pagination ainsi que de nombreuses options et raccourcis

```shell
less <FICHIER>
```

**Les options**

- `-n` permet d'enlever le numéro des lignes

- `-N` permet d'afficher le numéro des lignes

- `-S` permet d'afficher chaque ligne d'un fichier sur une ligne à l'écran

**Les raccourcis**

- `h` : Aide de less

- `Espace` : permet d'aller à la page suivante

- `d` : Avance d'une demi-page

- `Entrée /Flèche bas` : Avance d'une ligne

- `b` : Recule d'une page

- `u` : Recule d'une demi-page

- `y / Flèche haut` : Recule d'une ligne

- `G` : Va directement à la fin du fichier

- `g` : Va directement au début du fichier

- `/<MOTIF>` : surligne toutes les occurences de `<MOTIF>` de la position courante à la fin du fichier

- `?<MOTIF>` : surligne la première occurence de `<MOTIF>` depuis la position courante

- `n` permet d'aller au résultat suivant d'une recherche par motif

- `N` : permet d'aller au précédent résultat

- `q` : permet de quitter le lecteur

- `=` indique notre position exacte dans le lecteur

### head

La commande `head` permet d'afficher le début d'un ou des fichiers passés en paramètres

```shell
head <FICHIER_A> <FICHIER_B>
```

### tail

La commande `tail` permet d'afficher la fin d'un ou des fichiers passés en paramètres

```shell
tail <FICHIER_A> <FICHIER_B>
```

Options : 

- `-n` : permet de spécifier le nombre de lignes à afficher

- `-f` : permet d'afficher dynamiquement le contenu (si le fichier est mis à jour régulièrement)

## Archives

### Créer une archive

```shell
tar -cvf mon_archive.tar <FICHIER_A> <FICHIER_B>
```

> Les options en détail : 
> - `-c` pour indiquer la création
> - `-f` pour spécifier le nom du fichier à créer
> - `-v` pour verbose

### Afficher le contenu d'une archive

```shell
tar -tvf mon_archive.tar
```

> L'option `-t` permet d'afficher le contenu sous forme de liste

### Extraction

```shell
tar -xf mon_archive.tar
```

> L'option `-x` permet d'indiquer une extraction

### Modification

```shell
tar -rvf mon_archive.tar <FICHIER>
```

> L'option `-r` permet d'ajouter des fichiers à la fin de l'archive indiquée

On peut aussi supprimer un fichier d'une archive : 

```shell
tar -rvf mon_archive.tar --delete <FICHIER>
```

### Compression

```shell
tar -czf mon_archive.tar <FICHIER>
```

Parmi les options : 

- `-z` permet d'utiliser l'algo `gzip`

- `-j` pour l'algo `bzip2`

- `J` pour l'algo `xz`

> Il est possible de préciser manuellement l'algo à utiliser avec le flag `--use-compress-program=<ALGO>`