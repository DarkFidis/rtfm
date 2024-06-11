---
sidebar_position: 6
---

# Les permissions

## Basics

### Utilisateurs

Pour afficher l'utilisateur connecté :

```shell
whoami
```

Pour lister tous les users du système :

```shell
cat /etc/passwd
```

cela affichera les users dans le format suivant :

```shell
jdoe:x:1000:2000:John Doe,,,:/home/jdoe:/bin/bash
```

> Les données sont séparées par `:`

De cette manière, chaque utilisateur a  :

- un identifiant unique (`jdoe`)
- un UID (`1000`)
- un GID ou identifiant de groupe (`2000`)

### Permissions

Chaque fichier a un utilisateur owner et un groupe owner ainsi qu'une liste de permissions. Ces permissions déterminent ce que le user owner, le groupe owner et les autres users
ont le droit de faire avec le fichier en question

Le super-utilsateur (`root`) dispose de tous les droits sur tous les fichiers du système. Pour éxécuter une commande en tant que super-utilisateur,
on utilise la commande `sudo` qui demande une authentification avant d'éxecuter la commande

> Si l'authentification réussit, elle ne sera pas demandée pendant 15 min

> L'UID de `root` est `0`, tout comme le GID du groupe `root`

### Changer de user

La commande `su` permet de changer d'utilisateur dans le système : 

```shell
su <USERNAME>
```

Il existe deux manières de lancer un shell root : 

```shell
sudo su -
```

ou 

```shell
sudo -i
```

## Organisation des permissions

Les droits d'accès sont organisés en fonction des personnes et des droits. Pour les personnes : owner, groupe et autres. Pour les droits : 
lecture (`read`), écriture (`write`) et execution (`execute`). Les permissions peuvent s'afficher sous deux formats différents : 

- La forme octale : utilise des nombres de 0 à 7
- La forme en lettres : `r`, `w` ou `x`

### La forme octale

La forme octale permet d'afficher les permissions sous forme de chiffres. Initialement

- `1` signifie que le fichier est éxécutable
- `2` signifie que le fichier est en écriture
- `4` signifie que le fichier est en lecture

La somme de ces trois nombres donnent les droits d'accès, ainsi : 

- `0` signifie aucun droit
- `1` signifie que le fichier est éxécutable
- `2` signifie que le fichier est en écriture
- `3` signifie que le fichier est en écriture et éxécutable
- `4` signifie que le fichier est en lecture
- `5` signifie que le fichier est en lecture et éxecutable
- `6` signifie que le fichier est en écriture et lecture
- `7` signifie que le fichier est en lecture, écriture et éxécution

### La forme en lettres

Les permissions, sous cette forme, apparaissent comme suit

```shell
-rw-rw-r
```

Le format se décompose en trois groupes de trois lettres chacun, dans l'ordre : le owner, le groupe et les autres

> Le premier tiret signifie qu'il s'agit d'un fichier. Dans le cas contraire, nous aurions `d` pour un dossier ou encore `l` pour un lien

Chaque lettre équivaut à un droit : 

- `r` pour la lecture (read)
- `w` pour l'écriture (write)
- `x` pour éxecutable (executable)

### Permissions par défaut

Quand on crée un fichier ou un dossier, Linux lui attribue des droits par défaut. Ainsi, pour un fichier, les permissions attribuées sont `644`
et `755` pour un dossier

## Gestion des groupes

### Création

```shell
sudo addgroup <GROUP_NAME>
```

> On peut spécifier le GID du groupe à créer : 
> ```shell
> sudo addgroup <GROUP_NAME> --gid <GID>
> ```

### Ajout d'utilisateurs

Pour ajouter un user à un groupe

```shell
sudo usermod -aG <GROUP_NAME> <USER>
```

Pour ajouter un user à plusieurs groupes

```shell
sudo usermod -aG <GROUP_A>,<GROUP_B> <USER>
```

> Pour ajouter un user dans le groupe admin, deux possiblités : 
> ```shell
> sudo usermod -aG sudo <USER>
> ```
> ou encore
> ```shell
> sudo usermod -aG admin <USER>
> ```

### Suppression

```shell
sudo delgroup <GROUP_NAME>
```

## Gestion des utlisateurs

### Création

```shell
sudo adduser <USERNAME>
```

> La définition d'un password est obligatoire : 
> ```shell
> sudo passwd -e <USERNAME>
> ```

### Suppression

```shell
sudo deluser <USERNAME>
```

### Changement du repertoire

Pour changer le répertoire d'un utilisateur : 

```shell
sudo usermod -md /home/new <USERNAME>
```

### Définir une date d'expiration

On peut définir une date d'expiration pour un compte : 

```shell
sudo usermod -e 2027-05-12 <USERNAME>
```

> On peut aussi faire expirer un compte dans `N` jours : 
> 
> ```shell
> sudo usermod -e `date -d "N days" +"%Y-%m-%d"` <USERNAME>
> ```

### Changer le nom de login

```shell
sudo usermod -l <USERNAME> <NEW_USERNAME>
```

### Bloquer l'utilisateur

```shell
sudo usermod -L <USERNAME>
```

### Débloquer l'utilisateur

```shell
sudo usermod -U <USERNAME>
```

## Gestion des mots de passe

### Modification

```shell
sudo passwd <USERNAME>
```

### Suppression

```shell
sudo passwd -d <USERNAME>
```

### Redéfinition

```shell
sudo passwd -e <USERNAME>
```

### Désactivation

Si le mot de passe d'un compte est expiré depuis un nombre `J` de jours, on peut désactiver ce dernier avec la commande

```shell
sudo passwd -i J <USERNAME>
```

### Verrouiller un compte

On peut bloquer l'accès avec le mot de passe : 

```shell
sudo passwd -l <USERNAME>
```

### Déverrouiller un compte

On peut bloquer l'accès avec le mot de passe :

```shell
sudo passwd -u <USERNAME>
```

### Durée de validité

On peut définir une durée de validité pour le mot de passe d'un compte : 

```shell
sudo passwd -x 30 <USERNAME>
```

Ici, on a défini une durée de 30 jours. Au delà, l'utilisateur devra rechanger son mot de passe.

> Il est également possible d'avertir l'utilisateur `N` jours avant l'expiration avec la commande
>
> ```shell
> sudo passwd -w N <USERNAME>
> ```

## Changement des propriétaires

Pour changer les propriétaires d'un fichier, on utilise la commande `chown`, la syntaxe est la suivante

```shell
sudo chown <OPTION?> <USER?>:<GROUPE?> <FICHIER>
```

### Changer le propriétaire

Pour changer le owner d'un fichier : 

```shell
sudo chown <USER> <FICHIER>
```

### Changer le user et le groupe propriétaire

```shell
sudo chown <USER>:<GROUPE> <FICHIER>
```

### Changer uniquement le groupe propriétaire

```shell
sudo chown :<GROUPE> <FICHIER>
```

### Changer le propriétaire d'un fichier et de son contenu

```shell
sudo chown -R <USER?>:<GROUPE?> <FICHIER>
```

## Changement des permissions

Pour changer les permissions d'un fichier, on utilise la commande `chmod`

### Attribution de manière absolue

La méthode absolue permet de définir tous les droits d'un seul trait en utilsant la forme octale, par exemple : 

```shell
sudo chmod 644 <FICHIER>
```

### Attribution de manière relative

La méthode relative permet d'ajouter ou de retirer des droits sur un fichier. Elle s'appuie sur plusieurs opérateurs : 

- Les lettres `u`, `g` et `o` pour désigner la cible (user, groupe ou autres)
- `+` et `-` pour respectivement ajouter ou retirer un droit

Par exemple, pour retirer le droit de lecture aux autres utilisateurs (hors owner et groupe) : 

```shell
sudo chmod o-r <FICHIER>
```

### Récursivité

Il est possible de définir les droits pour le contenu du dossier spécifié : 

```shell
sudo chmod -R 700 <FICHIER> 
```

### Le sticky-bit

Le sticky bit est un drapeau qui, attribué à un fichier, empêche toute modification dudit fichier par un utilisateur qui n'en est pas
propriétaire.

```shell
chmod +t <FICHIER>
```

ou sous forme octale

```shell
chmod 1777 <FICHIER>   
```