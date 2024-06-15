---
sidebar_position: 7
---

# Les scripts shell

## Basics

### Shebang

Le shebang est une ligne au début du fichier commençant par `#!`. Elle permet d'indiquer au système qu'il s'agit d'un script à éxécuter ainsi que
le shell à utiliser

```shell
#!/bin/bash

echo "Hello World"
```

### Rendre éxecutable

Par défaut, un fichier n'est pas éxecutable, même avec l'extension `.sh`. Il faut le rendre éxécutable avec la commande `chmod` : 

```shell
chmod +x <FICHIER>
```

### Exécution

```shell
./mon_script.sh
```

> Il faut indiquer le chemin vers le fichier (en relatif ou absolu) pour pouvoir l'éxecuter, car il n'est pas présent dans la variable système `$PATH`

### Commentaires

```shell
# Commentaire
```

## Paramètres et variables

### Paramètres positionnels

Pour obtenir les paramètres en fonction de leur ordre dans le script : 

```shell
#!/bin/bash

echo $1 $2 $3 $4 $5 $6 $7 $8 $9 ${10}
```

affichera les 10 paramètres spécifiés dans le script

### Paramètres spéciaux

Les paramètres spéciaux permettent d'afficher les infos suivantes : 

- `$#` : nombre d'arguments passés
- `$@` : liste des arguments passés
- `$0` : nom du script
- `$?` : code de retour de la dernière commande
- `$$` : PID de l'interpreteur
- `$!` : PID de la dernière tâche en background

## Variables

### Définition

```shell
VARIABLE=valeur
```

### Lecture

```shell
$VARIABLE
```

Dans le cas ou c'est suivi de caractères : 

```shell
${VARIABLE}texte
```

### Variables d'environnement

Linux met à disposition des variables d'environnement : 

- `$USER` : accède à l'utilisateur qui lance le script
- `$HOSTNAME` : nom de la machine
- `$SHELL` : nom du shell
- `$PWD` : répertoire courant

### Portée des variables

Par défaut, un script n'a accès qu'uax variables définies dans le fichier. Si on souhaite utiliser des variables définies dans un autre fichier,
on utilise `source` : 

```shell
source ./autre_script.sh
```

Pour utiliser des variables dans les prochains process, on exporte celle-ci : 

```shell
#!/bin/bash

export VARIABLE=valeur
```

## Développements

### Accolades

Le développement en accolades permet de factoriser des chaînes de caractères : 

```shell
mkdir /usr/local/src/{new,dist,old,test}
```

### Remplacement de paramètres et variables

Remplacements utiles : 

- `${PARAMETRE:-valeur}` attribue la valeur par défaut `valeur` au paramètre `PARAMETRE`
- `${PARAMETRE:?message}` permet de rendre le paramètre `PARAMETRE` obligatoire. S'il n'est pas présent, le message d'erreur `message` sera affiché dans la sortie d'erreur
- `${#VARIABLE}` substitue par la longueur de la variable `VARIABLE`
- `${PARAMETRE^motif}` convertit la première lettre minuscule dans `PARAMETRE` qui matche `motif` en majuscules. Si `motif` n'est pas spécifié, tous les caractères seront convertis.
- `${PARAMETRE^motif}` convertit la première lettre majuscule dans `PARAMETRE` qui matche `motif` en minuscules. Si `motif` n'est pas spécifié, tous les caractères seront convertis.
- `${PARAMETRE^motif}` convertit toutes les lettres majuscules dans `PARAMETRE` qui matche `motif` en minuscules. Si `motif` n'est pas spécifié, tous les caractères seront convertis.
- `${PARAMETRE^motif}` convertit toutes les lettres minuscules dans `PARAMETRE` qui matche `motif` en majuscules. Si `motif` n'est pas spécifié, tous les caractères seront convertis.

### Substitution de commande

```shell
$(<COMMANDE>)
```

## Débogage d'un script

```shell
bash -x mon_script.sh
```

## Utiliser un prompt

La commande `read` permet de mettre à disposition une interface pour rentrer des données : 

```shell
read <VARIABLE_A> <VARIABLE_B> ...
```

### Options

La commande `read` propose les options suivantes : 

- `-p` permet d'afficher à l'utilisateur une string lui indiquant ce qu'il faut entrer
- `-n` permet de fixer une limite dans le nombre de caractères à entrer
- `-s` permet de ne pas afficher ce que l'utilsateur rentre

## Opérations arithmétiques

### La commande expr

La commande `expr` permet d'évaluer une expression et de retourner le résultat sur la sortie standard : 

```shell
expr 2 + 2
# Affichera 4
```

### Substitution arithmétique

On peut également évaluer une expression avec une substitution : 

```shell
echo $((2+2))
```

## Conditions

### Tests

Les tests permettent de vérifier des conditions. La commande `test` sert à vérifier la condition spécifiée en paramètres. Elle affichera 0 si true
et 1 si false : 

```shell
test 2 -gt 1
# 0
```

ou bien 
```shell
[ 2 -gt 1 ]
```

### Opérateurs arithmétiques

- `-eq` : equal (`=`)
- `-ne` : not equal (`!=`)
- `-gt` : greater than (`>`)
- `-lt` : lower than (`<`)
- `-ge` : greater or equal (`>=`)
- `-le` : lower or equal (`<=`)

### Opérateurs pour strings

- `-n` : vrai si la chaîne est non-vide
- `-z` : vrai si la châine est vide
- `=` ou `==` : les châines sont identiques
- `!=` : les chaînes sont différentes

### Opérateurs pour fichiers

- `-e` : vrai si le fichier existe
- `-s` : vrai si le fichier n'est pas vide
- `-f` : vrai si le fichier existe et est un fichier
- `-d` : vrai si le fichier existe et est un répertoire
- `-L` : vrai si le fichier existe et est un lien
- `-r` : vrai si le fichier existe et est en lecture
- `-w` : vrai si le fichier existe et est en écriture
- `-x` : vrai si le fichier existe et est éxecutable

Pour la comparaison de deux fichiers : 

- `-nt` : newer than
- `-ot` : older than

### Opérateurs logiques

- `!` : non logique
- `-a` : ET logique
- `-o` : OU logique

## If/Elif/Else

Exemple d'une structure de contrôle simple (If/Else) : 

```shell
if [[ <CONDITION> ]]
then
  # commandes à exécuter si vrai
else
  # commandes à exécuter si faux
fi
```

Exemple d'utilisation d'une structure de contrôle complète : 

```shell
if [[ CONDITION_A ]]
then
  # commandes à exécuter si CONDITION_A retourne vrai
elif [[ CONDITION_B ]]
then
  # commandes à exécuter si CONDITION_B retourne vrai
else
  # commandes à exécuter si faux
fi
```

## Case

Exemple :

```shell
#!/bin/bash

case <FICHIER> in
  *.txt)
    echo "Il s'agit d'un fichier texte";;
  *.jpeg|*.jpg|*.png|*.gif)
    echo "Il s'agit d'une image";;
  *.sh)
    echo "Il s'agit d'un script shell";;
  *)
    echo "Le type de fichier n'est pas reconnu";;
  esac
```

## Structures itératives

### while

```shell
#!/bin/bash

read -p "Entrez un nombre : " nombre

while [ $nombre -gt 0 ] ; do
  echo $nombre
  (( nombre-- ))
done
```

### until

```shell
#!/bin/bash

read -p "Entrez un nombre : " nombre

until [ $nombre -eq 0 ] ; do
  echo $nombre
  (( nombre-- ))
done
```

### continue

```shell
#!/bin/bash

read -p "Entrez un nombre : " nombre

while [[ $nombre -gt 0 ]] ; do
  ((nombre--))
  if [[ $nombre%2 -eq 0 ]]
  then
    continue
  else
    echo $nombre
  fi
done
```

### break

```shell
#!/bin/bash

nombre=$RANDOM
while [[ $nombre%2 -eq 0 ]] ; do
  nombre=$RANDOM
done

while [[ $nombre ]] ; do
  if [[ $nombre%2 -eq 0 ]]
  then
    break
  else
    echo $nombre
    ((nombre=nombre+$RANDOM))
  fi
done
```

### for

Syntaxe basique : 

```shell
for i in liste ; do
  <COMMANDE>
done
```

Exemple basique : 

```shell
#!/bin/bash

for i in Jean Paul Pierre ; do
  echo $i
done
```

On peut définir une liste avec les accolades : 

```shell
#!/bin/bash

for i in {1..10} ; do
  echo $i
done
```

ou une syntaxe proche d'autres langages : 

```shell
for ((i=1; i<=10; i++)); do
  echo $i
done
```

## Les fonctions

### Déclaration et utilisation

```shell
maFonction() {
  <COMMANDE>
}
```

Pour éxécuter la fonction déclarée : 

```shell
maFonction
```

avec des arguments : 

```shell
maFonction <ARG_A> <ARG_B> ...
```

> Pour accéder aux arguments : `$1`, `$2`, etc.

Comme pour une commande, le code retour d'une fonction doit être de 0 en cas de succès et de 1 à 255 en cas d'erreur.

> Par défaut, le code retour d'une fonction est celui de la dernière commande éxecutée dans celle-ci

### Surcharge de commande

Pour surcharger une commande existante, on utilise le mot clé `command` : 

```shell
#!/bin/bash

ls () {
  command ls -la
}
```