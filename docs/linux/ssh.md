---
sidebar_position: 10
---

# Le protocole SSH

## Connexion

Pour se connecter à un serveur : 

```shell
ssh <USER>@<HOST>
```

on peut préciser sur quel port on se connecte : 

```shell
ssh <USER>@<HOST> -p <PORT>
```

## Gestion des keys

### Notions

Le dossier `.ssh` sur notre machine contient les paires de clés qui servent à s'authentifier sur les différents serveurs. Dans ce dossier se trouve le fichier
`known_hosts` qui contient les clés d'identification de chaque serveur sur lequel on a autorisé la connexion

Sur un serveur distant, le dossier `.ssh` contient les clés publiques des utilisateurs autorisés à s'y connecter, dans le fichier `authorized_keys`.

### Création

```shell
ssh-keygen
```

On peut spécifier l'algo :

```shell
ssh-keygen -t ed25519
```

### Copie sur le serveur

```shell
ssh-copy-id <USER>@<HOST>
```

## Configuration sécu du serveur