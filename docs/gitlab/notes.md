---
sidebar_position: 6
---

# Notes

## Ajout d'une clé SSH

1. Génération de la clé

```shell
ssh-keygen -t rsa
```

2. Copie de la clé

```shell
cat ~/.ssh/<MY_KEY>.pub
```

Aller sur le compte GitHub puis dans `Settings` > `SSH and GPG keys` > `Ajouter une clé` puis coller le contenu affiché par le terminal

3. Vérification

```shell
ssh -T git@gitlab.com
```

## Ajout d'un alias Git

1. Ouvrir le fichier gitconfig en mode édition :

```shell
nano ~/.gitconfig
```

2. Dans le fichier, insérer la commande souhaitée dans le namespace `alias` : 

```shell
[alias]
    alias = git_cmd
```

## Unfollow un fichier

```shell
git reset HEAD -- <FILE_PATH>
```

## Récupération de l'historique

```shell
git log --all --source --shortstat --pretty=format:{"hash": "%H", "auteur": "%cn", "branche": "%d", "date": "%cd", "timestamp": "%ct", "message": "%s"}
```