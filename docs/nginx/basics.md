---
sidebar_position: 3
---

# Basics

## Commandes de base

### Arrêt

Pour un arrêt brutal :

```shell
sudo nginx -s stop
```

Pour un graceful shutdown

```shell
sudo nginx -s quit
```

### Reload

Pour recharger la config

```shell
sudo nginx -s reload
```

### Affichage de la config

```shell
sudo nginx -T
```

### Tester la config

Pour tester la validité de la config : 

```shell
sudo nginx -t
```

## Directives

### Directives simples

Les directives simples sont des directives qui n'utilisent pas d'accolades, elles définissent des valeurs de config spécifiques. Les
directives simples acceptent un ou plusieurs paramètres : 

```shell
key value1 value2;
```

Par exemple

```shell
listen 80 http2;
```

### Directives de bloc

Les directives de bloc utilisent des accolades et servent à regrouper des directives simples de façon à les appliquer à un contexte précis.

```shell
server {
  listen 80;
  server_name example.com;
  location / {
    root /var/www/example.com;
    index index.html;
  }
}
```

Ici, les directives simples s'appliquent uniquement dans un contexte de serveur (`server`)

## Contextes

### `main`

Le contexte `main` désigne le contexte global de NGINX. Toutes les directives implémentées doivent être dans le contexte `main`.

### `events`

Le contexte `events` sert à définir une configuration pour la gestion des connexions réseau par le serveur. Cela permet d'indiquer à NGINX
comment gérer les connexions, les requêtes et les réponses.

```shell
events {
  worker_connections 1024;
}
```

Dans cet exemple, on indique la limite de connexions simultanées que NGINX peut accepter (`worker_connections`) qui est de 1 024.

### `http`

Le contexte `http` sert à définir une configuration pour NGINX en tant que serveur web HTTP.

### `server`

Le contexte `server` permet de définir un serveur virtuel pour des domaines ou des IPs. Il permet d'associer domaines et IPs à l'instance de 
NGINX. On peut très bien définir plusieurs serveurs virtuels : 

```shell
http {
    # Configuration pour le serveur HTTP
    server {
        # Configuration pour un serveur virtuel
    }
    server {
        # Configuration pour un autre serveur virtuel
    }
}
```

### `location`

Le contexte `lcoation` permet de définir une configuration pour une URI en particulier. Il doit être inclus dans un contexte `server` pour pouvoir
fonctionner.

### Héritage 

Un contexte enfant hérite des directives de son contexte parent

## Configuration de base

### Le fichier `nginx.conf`

Le fichier `nginx.conf` doit ressemble à ça : 

```shell
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
	worker_connections 768;
}

http {

	sendfile on;
	tcp_nopush on;
	types_hash_max_size 2048;

	include /etc/nginx/mime.types;
	default_type application/octet-stream;

	ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
	ssl_prefer_server_ciphers on;

	access_log /var/log/nginx/access.log;
	error_log /var/log/nginx/error.log;

	gzip on;

	include /etc/nginx/conf.d/*.conf;
	include /etc/nginx/sites-enabled/*;
}
```

En détail : 

- `user www-data;` définit le user et le groupe sous lequel NGINX doit tourner. Cela permet de limiter les permissions de NGINX au strict nécessaire.
- `worker-processes auto;` : définit le nombre de workers que NGINX doit utiliser. La valeur `auto` indique à NGINX qu'il doit utiliser le nombre de threads disponibles.
- `pid /run/nginx.pid;` : définit le path du fichier dans lequel le PID du process de NGINX sera stocké.
- `include /etc/nginx/modules-enabled/*.conf;` : charge tous les fichiers ayant pour extension `.conf` contenus dans le dossier `modules-enabled`. C'est ici que sont chargés les fameux modules additionnels.
- Les directives `access_log` et `error_log` dans le contexte `http` définissent les path des fichiers de logs d'accès et d'erreurs
- `gzip: on;` : active la compression pour les réponses HTTP.

### Le fichier `sites-enabled/default`

```shell
server {
	listen 80 default_server;
	listen [::]:80 default_server;

	root /var/www/html;

	index index.html index.htm index.nginx-debian.html;

	server_name _;

	location / {
		try_files $uri $uri/ =404;
	}
}
```

En détail : 

- `listen 80 default_server;` : indique le port d'écoute du serveur virtuel
- `listen [::]:80 default_server;` : indique le port d'écoute pour les connexion IPv6.
- `root /var/www/html;` : précise le dossier racine du serveur dans lequel se trouve le point d'entrée (le fichier `index.html`)
- `index index.html index.htm index.nginx-debian.html;` : précise le fichier à chercher 
- `server_name _;` : fait en sorte que ce serveur réponde à toute demande pour lequel aucun autre serveur virtuel n'a été configuré, cela revient à l'indiquer comme serveur par défaut.
- `location /` : définit l'URI à matcher pour le bloc. Ici `/` signifie toutes les requêtes.
- `try_files` : directive qui traite les demandes de fichier. Si elle ne trouve pas de fichier correspondant à l'URI, elle renvoie une 404.