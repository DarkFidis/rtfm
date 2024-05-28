---
sidebar_position: 2
---

# Manipulation des flux

## Les sorties standard

Un process Linux dispose d'un flux d'entrée et de deux flux de sortie, chacune ayant son canal : 

- Canal `0` : L'entrée standard (__standard input__) `stdin` permet au process d'accéder et de lire des données

- Canal `1` : La sortie standard -__standard output__) `stdout` permet au process d'écrire des résultats

- Canal `2` : La sortie d'erreur standard (__standard error__) `stderr` permet au process d'écrire les erreurs

### Redirection de sortie

On peut rediriger une sortie vers un fichier de notre choix : 

```shell
<COMMANDE> <CANAL>> <FICHIER>
```

Exemple : 

```shell
ls -a 1> liste.txt
```

> Il existe un raccourci pour la sortie standard : 

```shell
ls -a > liste.txt
```

### Concaténation de sortie

La concaténation permet de mettre à jour un fichier existant avec la sortie d'un process ou, s'il n'existe pas, le créér avec le contenu de la sortie

```shell
<COMMANDE> <CANAL>>> <FICHIER>
```

Exemple

```shell
ls -a >> liste.txt
```

### Redirection de l'entrée à partir d'un fichier

```shell
<COMMANDE> < <FICHIER>
```

Exemple

```shell
cat < liste.txt
```

### Redirection de l'entrée à partir de données

```shell
<COMMANDE> << <DATA>
```

Exemple

```shell
sort -n NAME
```

En lançant cette comamnde, on indique au shell qu'on va entrer des données dans le terminal et qu'il devra les trier avec `sort` une fois qu'on
tape `NAME`

### Fusion des flux

Il est possible de fusionner le flux standard et le flux d'erreur : 

```shell
<COMMANDE> > <FICHIER> 2>&1
```

ou en raccourci :

```shell
<COMMANDE> &> <FICHIER>
```

On peut également rediriger la sortie d'erreur dans la standard : 

```shell
<COMMANDE> 2> <FICHIER> 1>&2
```

qui peut s'écrire avec le même raccourci

## La commande `cat`

La commande `cat` permer de concaténer deux fichiers puis d'afficher le résultat dans la sortie standard

```shell
cat <FICHIER_A> <FICHIER_B>
```

## La commande `wc`

La commande `wc` permet d'afficher le nombre de lignes, de mots et d'octets du fichier passé en paramètres

```shell
wc <FICHIER>
```

Options : 

- `-c` pour afficher le nombre d'octets

- `-l` pour afficher le nombre de lignes

- `-m` pour afficher le nombre de caractères

- `-w` pour afficher le nombre de mots

## Le pipe

Le pipe permet de rediriger la sortie standard d'une commande vers l'entrée d'une autre commande

```shell
<COMMANDE_A> | <COMMANDE_B>
```

## La commande `tee`

La commande `tee` permet de lire depuis l'entrée standard et d'écrire dans un fichier et dans la sortie standard

```shell
ls | tee liste.txt
```

> Le fichier `liste.txt` sera écrasé par défaut

## La commande `xargs`

La commande `xargs` permet de construire des commandes à partir de l'entrée standard

```shell
cat fichier.txt | xargs echo
```

## Enchaînement de commandes

### &&

L'opérateur `&&` exécute la seconde commande si et seulement si la première retourne un code 0

```shell
<CMD_A> && <CMD_B>
```

### ||

L'opérateur `||` exécute la seconde commande si et seulement si la première retourne un code différent de 0