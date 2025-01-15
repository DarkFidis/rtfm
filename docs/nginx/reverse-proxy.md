---
sidebar_position: 5
---

# Reverse-proxy

## La directive `proxy_pass`

La directive `proxy_pass` sert à définir le service sur lequel la requête doit être renvoyée

```shell
proxy_pass <SERVICE_URI>
```

Cela marche comme suit : 

1. Quand NGINX reçoit la requête, il voit qu'il y a un `proxy_pass` dans la config qui matche la requête
2. NGINX transfère la requête au service à l'adresse `<SERVICE_URI>`
3. Le service traite la requête et répond à NGINX
4. NGINX transfère cette réponse au client

Exemple d'utilisation : 

```shell
http {
	server {
		location /api {
			proxy_pass http://localhost:3000;
		}
	}
	server {
		listen 3000;

		location / {
			return 200 "URI : $request_uri";
		}
	}
}
```

Dans cet exemple, toutes les requêtes avec pour argument `/api` seront transmises au service disponible sur `http://localhost:3000`

> Attention à ne pas mettre de `/` à la fin de `<SERVICE_URI>` car l'URI finale est concaténée par NGINX sans plus de verifications.

## Transmission des headers

### La directive `proxy_set_header`

La directive `proxy_set_header` sert à rajouter des headers custom dans la requête qui sera forwardée au service. Elle est utilisable dans les contextes `http` et `location`

```shell
proxy_set_header <HEADER> <VALUE>
```

### Les `X-Headers`

Il existe une convention de nommage pour les headers custom qui consiste à les préfixer par `X-`. Par exemple `X-Okapi-Key` pour la clé d'application Okapi ou encore `X-Forwarded-For`.

### Le header `Forwarded`

Le header `Forwarded` permet au service utilisé d'avoir certaines infos comme l'IP du client, le host d'origine, même si la requête a été modifiée entre-temps. Le header ressemble à ça : 

```shell
Forwarded: for=<CLIENT_IP>;proto=http;host=<ORIGIN_HOST>, for=<INTERMEDIATE_IP>
```

Dans l'exemple : 
- `<CLIENT_IP` est l'IP du client
- `<ORIGIN_HOST>` est le host d'origine
- `<INTERMEDIATE_IP>` est l'adresse IP du serveur intermédiaire.

Dans la config de NGINX, on peut définir ce header avec `proxy_set_header` : 

```shell
proxy_set_header Forwarded "for=$remote_addr;proto=$scheme;host=$host";
```

### Autres headers courants

Soit la config suivante : 

```shell
server {
    listen 80;
    listen [::]:80;

    server_name mydomain.site www.mydomain.site;

    location /api {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://localhost:3000;
    }
}

server {
    listen 3000;
    server_name mydomain.site www.mydomain.site;

    location / {
        add_header Content-Type text/plain;
        return 200 "
				IP client : $http_x_real_ip,
				IP proxy : $http_x_forwarded_for,
				Host : $http_x_forwarded_host,
				Proto : $http_x_forwarded_proto
			";
    }
}
```

Dans cet exemple : 

- `X-Real-IP` : IP du client d'origine
- `X-Forwarded-For` : IP du client + celles des intermédiaires
- `X-Forwarded-Host` : Host d'origine

## Mise en mémoire tampon des réponses

NGINX met à disposition une feature permettant de stocker la réponse du service dans la RAM ou sur le disque avant de l'envoyer au client. Ce mécanisme permet d'économiser des requêtes
sur le service en ayant une réponse déja à disposition, ce qui peut être pratique également en cas de fort traffic sur NGINX, ce dernier pourra effectuer ses traitement avant de répondre au client.

### La directive `proxy_buffering`

La directive `proxy_buffering` permet d'activer/désactiver le mécanisme de mémoire tampon

```shell
proxy_buffering on;
```

### La directive `proxy_buffer_size` et `proxy_buffer`

La directive `proxy_buffer_size` permet de fixer une taille pour la mémoire tampon. Son usage est déconseillé à moins de savoir ce qu'on fait.

La directive `proxy_buffer` permet de fixer le nombre et la taille des mémoires tampon

> Si on ne dispose pas de l'espace nécessaire pour stocker la réponse sur la RAM, elle le sera sur le disque

### Autres directives

Parmi les autres directives à noter

- `proxy_busy_buffers_size` : spécifie la taille maximale des mémoires occupées
- `proxy_temp_file_write_size` : taille maximale des données qui peuvent être écrites simultanément dans la mémoire
- `proxy_temp_path` : précise le path du repertoire ou sont stockées les mémoires
- `proxy_max_temp_file_size` : taille maximale des fichiers temp utilisés pour la mémoire.

## Timeouts de proxy

### La directive `proxy_connect_timeout`

La directive `proxy_connect_timeout` définit un délai pour se connecter au service. Si ce délai est dépassé, la connexion est considérée comme échouée et une erreur 504 est renvoyée.

```shell
proxy_connect_timeout 30s;
```

### La directive `proxy_send_timeout`

La directive `proxy_send_timeout` définit un délai à attendre avant d'envoyer la requête au service. Si NGINX ne peut pas envoyer la requête à la fin de ce délai -> 504.

### La directive `proxy_read_timeout`

La directive `proxy_read_timeout` définit un délai maximum pour la réception de la réponse du service. Si le service ne répond pas dans le délai -> 504.

## Cas pratiques

### RP local

Exemple de conf pour une app MERN avec RP pour le backend : 

```shell
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
}

http {
    default_type application/octet-stream;
    include /etc/nginx/mime.types;

    server {
        listen 80;
        server_name localhost;

        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri /index.html;
        }

        location /api {
            proxy_set_header Forwarded "for=$remote_addr;proto=$scheme"; # pour l'exemple uniquement
            proxy_pass http://api:3001;
        }
    }
}
```

`Dockerfile` pour le backend : 

```dockerfile
FROM node:lts-alpine

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "run", "start" ]

EXPOSE 3001
```

`Dockerfile` pour le serveur NGINX : 

```dockerfile
FROM nginx:stable-alpine
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY client/build /usr/share/nginx/html
EXPOSE 80
```

Enfin, le fichier `docker-compose.yml` pour run le tout : 

```yaml
version: "3.9"
services:
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
  nginx:
    build:
      context: ./
      dockerfile: nginx/Dockerfile
    ports:
      - 80:80
```