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

