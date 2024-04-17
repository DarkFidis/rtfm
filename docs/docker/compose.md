# Docker-Compose

## Structure générale

Exemple d'un service Mongo avec volumes et entrypoint : 

```yaml
version: '3'

networks:
  default:
    name: okapi-network

services:
  mongodb:
      image: mongo:6.0.6
      container_name: okapi-mongodb
      environment:
        - OKAPI_ROOT_USER=okapiapp
        - OKAPI_ROOT_PASSWORD=okapipassword
      ports:
        - 27017:27017
      volumes:
        - ./mongodb/data:/data/db
        - ./mongodb/entrypoint:/docker-entrypoint-initdb.d
      command: "--bind_ip_all --replSet rs0 --auth --keyFile /data/replica-auth.key"
      entrypoint:
        - bash
        - -c
        - |
          cp /docker-entrypoint-initdb.d/replica-auth.key /data/replica-auth.key
          chmod 400 /data/replica-auth.key
          chown mongodb:mongodb /data/replica-auth.key
          exec docker-entrypoint.sh $$@
      restart: unless-stopped
```

### L'image

Deux usecases possibles : soit l'image est déja construite et disponible sur un repository, soit l'image doit être construite à partir d'un Dockerfile.

**Cas 1 : Image existante**

Dans le cas d'une image existante, on précise son nom dans `image` : 

```yaml
version: "3.9"

services:
    myservice:
      image: alpine
```

**Cas 2 : Image à construire**

Si il faut build l'image depuis un Dockerfile, il faut préciser les infos dans `build` : 

```yaml
version: "3.9"

services:
    myservice:
      build: .
```

Dans cet exemple, l'image sera construite à partir du Dockerfile situé dans le même dossier. Si ce n'est pas le cas, il va falloir préciser
l'emplacement et le nom de ce dernier (si il a un autre nom) : 

```yaml
build:
 context: ./dossier
 dockerfile: Dockerfile.dev
```

> L'image peut être buildée avec la commande `docker compose build`

Si il y a besoin de passer les arguments (`ARG`) au Dockerfile : 

```yaml
build:
  context: ./directory
  dockerfile: Dockerfile
  args:
    - KEY=value
```

### Les volumes

**Bind mounts**

```yaml
version: '3.9'
services:
    myservice:
      image: alpine
      volumes:
        - type: bind
          source: ./data
          target: /app/data
```

**Volumes anonymes**

Pour déclarer un volume anonyme, il suffit de déclarer sans la propriété `source`, Docker va automatiquement créer un volume anonyme.

```yaml
volumes:
    - type: volume
      target: /app/data
```

**Volumes nommés**

Pour utiliser des volumes nommés, il faut les déclarer dans un namespace `volumes` situé au même niveau que `services` : 

```yaml
version: '3.9'

services:
    myservice:
      image: alpine
      volumes:
        - type: volume
          source: data3
          target: /app/data3
          
volumes:
  myvol:
```

Dans cet exemple, Docker va automatiquement créer le volume `myvol`. Si néammoins on souhaite utiliser un volume déja existant:

```yaml
volumes:
  myvol:
    external: true
```

### Variables d'environnement

Pour préciser des variables d'environnement, on utilise le namespace `environment` dans notre service : 

```yaml
my-service:
  environment:
    - KEY=value
```

Par défaut, Docker-compose va lire le contenu du fichier `.env` situé au même niveau que `docker-compose.yml`.Si toutefois on souhaite utiliser
un autre fichier pour l'environnement, il faut préciser son path dans le namespace `env_file` : 

```yaml
my-service:
  env_file:
    - config/env.dev
```

> Docker-compose résout les variables d'environnement dans l'ordre suivant : 
> - Le fichier `docker-compose.yml`
> - Variables d'environnement du shell
> - Fichiers de variables (`.env`)
> - Dockerfile

> Par défaut, Docker-compose utilise le nom du directory comme préfixe pour tout ce qu'il lance (réseaux, volumes, conteneurs). On peut
> modifier ce préfixe avec la variable d'environnement `COMPOSE_PROJECT_NAME`

### Réseaux

#### Création d'un réseau custom

```yaml
version: '3.9'

services:
  proxy:
    image: nginx
    networks:
      - frontend
  app:
    image: nginx
    networks:
      - frontend
      - backend
  api:
    image: node
    networks:
      - backend
  db:
    image: mongo:7
    networks:
      - backend
networks:
  frontend:
  backend:
```

#### Créer des aliases avec `link`

Les aliases servent à rendre disponibles les différents services avec un autre nom : 

```yaml
version: '3.9'
services:
  api:
    image: node
  db:
    image: mongo:7
    links:
      - 'db:database'
      - 'db:mongo'
```

Dans cet exmple, le service `db` sera également accessible dans le réseau avec les noms `database` et `mongo`

#### Changer le nom du réseau par défaut

```yaml
version: '3.9'

services:
  api:
    image: node
  db:
    image: mongo:7
networks:
  default:
    name: monreseau
```

## Divers

### `depends_on`

Le namespace `depends_on` permet de préciser une dépendance d'un service envers un autre, de façon à modifier l'ordre de lancement par Docker : 

```yaml
version: "3.9"

services:
  node:
    image: node
    depends_on:
      - db
      - redis
  redis:
    image: redis
  db:
    image: mongo:7
```

Ici, le service `node` est dépendant des services `db` et `redis`. Il sera par conséquent lancé après que `db` et `redis` aient été démarrés.

> ATTENTION : `depends_on` ne fait pas de healthecks avant de lancer le conteneur suivant, il ne garantit que les conteneurs soient en éxecution.

### `restart`

Le namespace permet de préciser les options de redémarrage du service parmi les options suivantes : 

- `none` (par défaut) : le conteneur ne sera pas redémarré, même en cas d'erreur

- `on-failure` : le conteneur redémarre en cas d'erreur

- `always` : le conteneur est systématiquement redémarré

- `unless-stopped` : le conteneur sera toujours redémarré à moins qu'il ne soit arrêté manuellement.

## Commandes

### Run

Pour lancer tous les services définis dans le `docker-compose.yml` : 

```shell
docker compose up -d
```

Pour lancer un service en particulier : 

```shell
docker compose up -d <NOM_SERVICE>
```

### Stop

```shell
docker compose down
```

### Logs

```shell
docker compose logs
```

### Suppression

Suppression de tous les conteneurs lancés avec docker compose : 

```shell
docker compose rm 
```

Cette commande accepte des flags : 

- `-f` pour ne pas avoir à confirmer

- `-s` pour stopper puis supprimer les conteneurs

- `-v` pour supprimer les volumes avec les conteneurs

### Config

Pour afficher la config de docker-compose

```shell
docker compose config
```

### Update

Pour mettre à jour avec les dernières versions

```shell
docker compose pull
```