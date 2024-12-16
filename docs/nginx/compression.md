---
sidebar_position: 8
---

# Compression

## GZIP

La compression GZIP compresse les fichiers en recherchant des redondances dans celles-ci. C'est un mode de compression idéal pour : 

- Les fichiers textes (`HTML`, `CSS`, `JavaScript` et autres)
- Les fichiers de données (`CSV` ou logs)

> A ne pas utiliser sur certains formats de fichiers déja compréssés : Images JPEG, PNG ou WEBP, vidéos (MP3 et 4)

### Configuration

```shell
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
	worker_connections 1024;
}

http {

	include /etc/nginx/mime.types;
	default_type application/octet-stream;
	gzip on;

	server {
		listen 80;
		listen [::]:80;
		server_name <MY_DOMAIN>;

		root /var/www/<MY_DOMAIN>/html;
	}
}
```

### Niveau de compression

Il est possible de paramétrer un niveau de compression particulier avec la directive `gzip_comp_level` prenant en paramètre un nombre de 0 à 9

```shell
gzip_comp_level 6; # Valeur recommandée
```

### Types MIME à compresser

On peut spécifier le type MIME de la réponse compressée avec la directive `gzip_types` : 

```shell
gzip_types
  application/atom+xml
  application/geo+json
  application/javascript
  application/x-javascript
  application/json
  application/ld+json
  application/manifest+json
  application/rdf+xml
  application/rss+xml
  application/vnd.ms-fontobject
  application/wasm
  application/x-web-app-manifest+json
  application/xhtml+xml
  application/xml
  font/eot
  font/otf
  font/ttf
  image/bmp
  image/svg+xml
  image/vnd.microsoft.icon
  image/x-icon
  text/cache-manifest
  text/calendar
  text/css
  text/javascript
  text/markdown
  text/plain
  text/xml
  text/vcard
  text/vnd.rim.location.xloc
  text/vtt
  text/x-component
  text/x-cross-domain-policy;
```

### Taille de la réponse

On peut spécifier la taille minimale de la réponse compressée  avec la directive `gzip_min_length` qui prend en paramètres la taille voulue en octets.

```shell
gzip_min_length 1000;
```

### Réponse de proxy

Pour compresser les réponses venant de proxies, on utilise la directive `gzip_proxied` en spécifiant en paramètres les options : 

```shell
# Config recommandée :
gzip_proxied no-cache no-store private expired auth;
```

### Config recommandée

Exemple de config pour un VSL Debian : 

```shell
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
	worker_connections 1024;
}

http {

	include /etc/nginx/mime.types;
	default_type application/octet-stream;
	gzip on;
	gzip_comp_level 6;
	gzip_min_length 1000;
	gzip_proxied no-cache no-store private expired auth;
	gzip_types
	application/javascript
	application/json
	font/eot
	font/otf
	font/ttf
	text/css
	text/javascript
	text/markdown
	text/plain;


	server {
		listen 443 ssl http2;
		listen [::]:443 ssl http2;
		ssl_certificate /etc/letsencrypt/live/<MY_DOMAIN>/fullchain.pem;
		ssl_certificate_key /etc/letsencrypt/live/<MY_DOMAIN>/privkey.pem;

		server_name <MY_DOMAIN>;

		root /var/www/<MY_DOMAIN>/html;
		index test.html;
	}

}
```