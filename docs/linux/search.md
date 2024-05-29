---
sidebar_position: 4
---

# Recherche, tri et filtrage de fichiers

## Localisation avec locate

La commande `locate` permet de localiser un fichier n'importe-ou dans le système :

```shell
locate <FICHIER>
```

Options :

- `-c` permet de compter le nombre de fichiers trouvés

- `-e` permet d'afficher seulement les fichiers qui existent

- `-i` permet d'ignorer la casse

- `-l` permet de préciser un nombre limite de résultats

- `-r` permet d'utiliser des regexp pour la recherche

## Recherche avec find

La commande `find` permet de rechercher des fichiers à l'emplacement qu'on lui indique

```shell
find <PATH> <TEST>
```

> Par défaut, `find` effectue sa recherche dans le répertoire courant

### Tests

#### Recherche numérique

Les opérateurs : 

- `+n` : supérieur à `n`
- `-n` : inférieur à `n`
- `n` : égal à `n`

#### Opérateurs logiques

- `-not`
- `-a` ou `-and`
- `-o` ou `-or`

#### Types de recherche

- `-maxpdeth` pour indiquer la profondeur de recherche
- `-type` pour indiquer le type de fichier à rechercher : `f` pour un fichier, `d` pour un dossier, `l` pour un lien.
- `-name` pour indiquer le nom à rechercher
- `-size` pour rechercher selon la taille du fichier

> Les paramètres de taille : 
> - `b` pour un bloc de 512o
> - `c` pour indiquer les octets
> - `k` pour des Ko
> - `M` pour des Mo
> - `G` pour des Go
>
> Exemple : 

```shell
find -type f -size +100M
```

> recherche des fichiers de plus de 100Mo

- `-atime` : moment du dernier accès au fichier en jours
- `-amin` : moment du dernier accès au fichier en minutes
- `-ctime` : moment de la dernière modif du fichier en jours
- `-cmin` : moment de la dernière modif du fichier en minutes
- `-mmin` : moment de la dernière modif du contenu en minutes
- `-mtime` : moment de la dernière modif du contenu en jours

```shell
find -type f -amin -10
```

cherche les fichiers accédés il y a moins de 10 min

- `-inum` pour indiquer l'inum du fichier à chercher

### Actions

Il est possible d'effectuer des actions sur les résultats de la recherche : 

- `-delete` pour effacer les éléments trouvés
- `-exec` pour éxecuter une commande sur les élements trouvés. Exemple : 

```shell
find -type f -name '*.txt' -exec cp '{}' ~/Bureau \;
```

> Ici, `{}` est remplacé par le fichier en cours de traitement

- `-fls` permet d'écrire le résultat dans le fichier spécifié
- `-printf` permet d'afficher les résultats dans la sortie standard

> On peut spécifier un pattern au print avec les options suivantes : 
> - `\b` : Effacement arrière (Backspace).
> - `\c` : Arrêter immédiatement l'impression du format et vider le flux de sortie.
> - `\f` : Saut de page.
> - `\n` : Saut de ligne.
> - `\r` : Retour chariot.
> - `\t` : Tabulation horizontale.
> - `\v` : Tabulation verticale.
> - `\\` : Un caractère « \ » littéral.
> - `%%` : Un caractère pourcentage littéral (%).
> - `%a` : Date du dernier accès au fichier ( atime ).
> - `%Ak` : Date du dernier accès au fichier, dans le format spécifié par `k`
> - `%b` : Taille de l'espace disque consommé par le fichier, en nombre de blocs de 512 octets.
> - `%c` : Date de dernière modification du statut du fichier ( ctime ).
> - `%Ck` : Date de dernière modification du statut du fichier, dans le format spécifié par `k`.
> - `%d` : Profondeur du fichier dans l'arborescence des répertoires.
> - `%D` : Numéro du périphérique sur lequel le fichier est rangé.
> - `%f` : Nom du fichier, sans aucun nom de répertoire (dernier élément uniquement).
> - `%g` : Nom du groupe propriétaire du fichier, ou identifiant de groupe numérique si le groupe n'a pas de nom.
> - `%G` : Identifiant de groupe numérique du fichier.
> - `%h` : Répertoires en tête du nom de fichier (tout sauf la dernière partie).
> - `%H` : Paramètre de la ligne de commande à partir duquel le fichier a été trouvé.
> - `%i` : Numéro d'inode du fichier (en décimal).
> - `%k` : Taille du fichier, en nombre de blocs de 1 kilo-octet.
> - `%l` : Destination du lien symbolique (vide si le fichier n'est pas un lien symbolique).
> - `%M` : Permissions du fichier
> - `%n` : Nombre de liens physiques sur le fichier.
> - `%p` : Nom du fichier.
> - `%P` : Nom du fichier, en retirant le nom du paramètre de ligne de commande à partir duquel le fichier a été trouvé.
> - `%s` : Taille du fichier en octets.
> - `%t` : Date de dernière modification du fichier ( ctime ).
> - `%Tk` : Date de dernière modification du fichier, dans le format spécifié par k.
> - `%u` : Nom du owner du fichier
> - `%U` : Owner du fichier.
> - `%y` : Type du fichier (comme dans `ls -l`)

## Tri avec sort

La commande `sort` permer de trier les lignes du fichier spécifié ou du résultat d'une autre commande

```shell
sort <FICHIER>
```

### Options

- `-n` pour trier des nombres
- `-r` pour inverser l'ordre du tri
- `-u` permet d'obtenir que des uniques
- `-o` permet d'écrire le résultat du tri dans un fichier spécifié
- `-M` permet de trier par mois
- `-k` permet de trier selon la colonne spécifiée par son numéro

> Exemple de tri par colonne : 
```shell
ls -la | sort -nk 5
```

- `-t` permet de préciser le séparateur entre les colonnes

```shell
sort -t:
```

## Filtrage avec grep

La commande `grep` permet de rechercher les lignes qui matchent le motif spécifié

```shell
grep <MOTIF> <FICHIER>
```

### Options

- `-i` pour être insensible à la casse
- `-n` pour afficher le numéro des lignes matchées
- `-c` pour obtenir le nombre d'occurences
- `-v` pour obtenir les lignes qui ne matchent pas le motif
- `-r` pour effectuer une recherche recursive

### Regexp

Pour utiliser des regexp avec grep : 

```shell
grep -E <REGEXP> <FICHIER>
```

Parmi les pattern disponibles : 

- `[:alnum:]` : tous les caractères alphanumériques
- `[:alpha:]` : toutes les lettres
- `[:digit:]` : tous les chiffres (0 à 9)
- `[:graph:]` : tous les caractères imprimables
- `[:upper:]` : toutes les majuscules
- `[:lower:]` : toutes les minuscules
- `[:space:]` : tous les caractères d'espacement
- `[:punct:]` : tous les caractères de ponctuation
- `[:xdigit:]` : tous les caractères hexadecimaux
- `^` : debut d'une ligne
- `$` : fin d'une ligne
- `\<` : début d'un mot
- `\>` : fin d'un mot
- `A{*}` : 0 ou plusieurs fois le caractère `A`
- `A{+}` : 1 ou plusieurs fois le caractère `A`
- `A{?}` : 0 ou une fois le caractère `A`
- `A{n}` : `n` fois le caractère `A`
- `A{n, m}` : Entre `n` et `m` fois le caractère `A`
- `A{n,}` : Au moins `n` fois le caractère `A`
- `A{,n}` : Au max `n` fois le caractère `A`

Le pipe `|` permet d'indiquer des alternatives
