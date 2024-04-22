---
sidebar_position: 2
---

# Basics

## Images

### Création 

Pour créer une image à partir d'un fichier Dockerfile présent à la racine d'un projet : 

```shell
docker build -t <NOM_IMAGE> .
```
Pour préciser des arguments nécessaires au build de l'image, on utilise le flag `--build-arg` : 

```shell
docker build -t <NOM_IMAGE> --build-arg ARGUMENT=value .
```

### Gestion d'un registre

Pour ajouter une image sur un registre, il faut : 

1) S'authentifier sur le registre : 

```shell
docker login -u <USERNAME> -p <PASSWORD> <NOM_REGISTRE>
```

2) Pusher l'image

```shell
docker push <NOM_IMAGE>:<VERSION>
```

### Listing

```shell
docker images
```

ou bien 

```shell
docker image ls
```

### Supression

- Suppression d'une ou plusieurs images : 

```shell
docker image rm <NOM_IMAGE> <NOM_IMAGE_2>
```

- Suppression des image sans version (dangling) et non-utilisées par un conteneur : 

```shell
docker image prune -a
```





## Conteneurs

### Création

- Création simple : 

```shell
docker container create --name <CONTAINER_NAME> <NOM_IMAGE>
```

- Création et lancement : 

```shell
docker run --name <CONTAINER_NAME> <NOM_IMAGE>
```

### Lifecyle

- Démarrage du conteneur : 

```shell
docker container start <NOM_CONTENEUR>
```

- Arrêt du conteneur : 

```shell
docker container stop <NOM_CONTENEUR>
```

> Arrêt de tous les conteneurs en cours d'éxecution : 

```shell
docker stop $(docker ps -aq)
```

- Kill du conteneur : 

```shell
docker container kill <NOM_CONTAINER>
```

### Listing

```shell
docker ps
```

### Accès au shell

```shell
docker exec -it <NOM_CONTAINER> sh
```

### Accès aux logs

```shell
docker container logs <CONTAINER_NAME>
```

### Copie de fichiers

Copie de fichiers depuis la machine hôte vers le conteneur : 

```shell
docker cp <SOURCE_PATH> <CONTAINER_NAME>:<CONTAINER_PATH>
```

### Suppression

Suppression d'un conteneur en cours d'éxecution : 

```shell
docker container rm -f <NOM_CONTAINER>
```

Suppression de tous les conteneurs stoppés : 

```shell
docker container prune
```

## Persistance

Docker propose deux façons de gérer la persistance de données : le *_bind nount_* et le *_volume_*. Avec un _bind mount_, n'importe quel 
processus peut modifier les fichiers de la machine hôte, tandis qu'avec un _volume_, Docker gère lui même les fichiers de la machine hôte.
Pour les manipuler, on devra utiliser le CLI Docker.

> Lorsque l'on créé un volume, ce dernier est stocké (pour Linux), dans le répertoire `/var/lib/docker/volumes`

### Bind-Mount

> L'utilisation de bind-mounts est plutôt déconseillée de manière générale, toutefois cela est utile dans les cas suivants : 
> 
> - Partage de fichiers de config entre l'hôte et le conteneur
> 
> - Partage de code source en mode dev pour du live-reload


Pour créer un bind-mount, on utilise le flag `--mount` qui prend comme paramètres les paires key/value suivantes, séparés par une virgule : 

- `type` permet de spécifier le type de montage : `bind`, `volume` ou `tmpfs`. Dans ce cas présent, ce sera `bind`

- `source` (ou `src`) permet de spécifier le chemin vers le dossier à monter dans l'hôte.

- `dst` (ou `target`) permet de spécifier le chemin dans le conteneur dans lequel les fichiers de l'hôte seront montés

- `readonly` (optionnel et rare) permet de mettre le montage en lecture seule. Le conteneur ne pourra pas écrire dans ce dernier.

Exemple : 

```shell
docker container run -it --name testBindMount --mount type=bind,source="$(pwd)",target=/data alpine sh
```

Exemple d'utilisation pour du live reload : 

```shell
docker run -p 3000:3000 --mount type=bind,source="$(pwd)/src",target=/app/src myapp
```

Dans cet exemple, chaque modification du code dans le fichier `src` entrainera un reload de l'app bindée dans le conteneur (avec nodemon) 


### Volumes

Les volumes sont la manière recommandée de persister des données avec Docker, ils permettent : 

- Le partage de données entre plusieurs containers

- L'utilisation d'un espace de stockage entièrement géré par Docker, indépendant du système de l'hôte. De ce fait, on n'a pas à gérer les paths.

- Plus performants 

**Création**

```shell
docker volume create <VOLUME_NAME>
```

**Listing**

```shell
docker volume ls
```

**Inspection**

```shell
docker volume inspect <VOLUME_NAME>
```

**Suppression**

```shell
docker volume rm <VOLUME_NAME>
```

Si on souhaite supprimer tous les volumes : 

```shell
docker volume prune
```

## Networks

Les networks permettent de connecter des conteneurs entre eux. Par défaut, Docker met à disposition plusieurs drivers : 

- Le **_bridge_** : Driver par défaut, il permet de faire communiquer les conteneurs d'une même machine.

> Quand on lance un conteneur, ce dernier se connecte par défaut au réseau `bridge`

- Le **_host_** : supprime la gestion du réseau par Docker

> Dans un network host, on ne peut pas publier les ports car on utilise ceux de l'hôte. Si on lance un conteneur NGinx sur un network host, celui-ci
> sera disponible sur localhost

> Ce network fonctionne uniquement sur un hôte Linux 

- Le **_overlay_** : permet de connecter entre eux plusieurs daemons Docker, cela permet de faire communiquer des conteneurs sur des machines distantes

### Listing

```shell
docker network ls
```

### Inspection

```shell
docker network inspect <NETWORK_NAME>
```

### Création

Pour créer un réseau custom : 

```shell
docker network create <NETWORK_NAME>
```

> Le network crée sera un bridge par défaut

### Connexion au network custom

Pour connecter un conteneur à un réseau custom, on utilise le flag `--network` au lancement : 

```shell
docker run --network <NETWORK_NAME> ...
```

### Suppression

```shell
docker network rm <NETWORK_NAME>
```

Pour supprimer tous les réseaux custom : 

```shell
docker network prune
```