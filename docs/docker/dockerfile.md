# Dockerfile

## Instructions de base

### `FROM`

L'instruction `FROM` permet de spécifier l'image de base sur lequel on va travailler : 

```shell
FROM <NOM_IMAGE>:<IMAGE_VERSION>
```

### `RUN`

L'instruction `RUN` permet d'éxecuter une commande dans un nouveau layer puis de sauvegarder le résultat. L'image qui en résulte sera utilisée
pour les instructions suivantes

```shell
RUN ["executable", "param1", "param2"]
```

On peut utiliser `RUN` dans sa forme shell, ce qui permet d'éxecuter la commande spécifiée par le shell (`sh`)

```shell
RUN echo "Hello !"
```

> Le résultat d'une instruction `RUN` est mis en cache par Docker, de façon à optimiser les builds.

### `WORKDIR`

L'instruction `WORKDIR` permet de spécifier le repertoire de travail dans l'image pour les commandes `RUN`, `CMD`, `ENTRYPOINT`, `COPY` et `ADD` : 

```shell
WORKDIR /src/app
```

### `COPY`

L'instruction `COPY` permet de copier des fichiers depuis le système dans celui de l'image : 

```shell
COPY <SOURCE> <DESTINATION>
```

## Instructions avancées

### `CMD`

L'instruction `CMD` permet de spécifier la commande par défaut qui sera lancée par le ou les conteneurs lancés avec l'image

```shell
CMD ["exécutable","param1","param2"]
```

> Il ne peut y avoir qu'un seul `CMD` dans un Dockerfile

### `ENTRYPOINT`

L'instruction `ENTRYPOINT` permet de spécifier le point d'entrée du conteneur lancé par l'image. Par défaut, le point d'entrée d'un conteneur
est `/bin/sh -c`

> C'est le point d'entrée qu conteneur qui lancera la commande spécifiée dans l'instruction `CMD`, donc `CMD` servira, dans ce cas, à spécifier les
> arguments du point d'entrée

```shell
ENTRYPOINT ["executable"]
```

## Paramètres et métadonnées

### `ARG`

L'instruction `ARG` permet de spécifier des variables pour le build de l'image : 

```shell
ARG <ARG_NAME>
```

Il est possible de spécifier une valeur par défaut : 

```shell
ARG <ARG_NAME>=<DEFAULT_VALUE>
```

### `ENV`

L'instruction `ENV` permet de spécifier des variables d'environnement : 

```shell
ENV <KEY>=<VALUE>
```

### `LABEL`

L'instruction `LABEL` permet d'ajouter des métadonnées à l'image : 

```shell
LABEL version="3.6.12"
```