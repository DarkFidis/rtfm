---
sidebar_position: 9
---

# Mise en cache

Il existe trois façons d'utiliser le cache : 

- *Cache navigateur* : Les informations sont stockées dans le navigateur du client
- *CDN* : pour __Content Delivery Network__, cela consiste à stocker les informations sur des serveurs tiers comme Cloudfare, Amazon CloudFront, Google Cloud CDN, etc.)
- *Cache serveur* : Les informations sont stockées sur notre serveur.

## Headers de cache

### `Cache-Control`

Le header `Cache-Control` contrôle la mise en cache dans le navigateur client. Les valeurs possibles : 

- `no-cache`: le navigateur doit revalider le contenu du cache avec le serveur
- `no-store` : interdit la mise en cache
- `max-age` : spécifie la durée de validité du cache avant revalidation
- `private` : précise que le contenu est spécifique à un utilisateur et ne doit pas être mis en cache CDN
- `public` : autorise la mise en cache + CDN du contenu
- `must-revalidate` : si le contenu est perimé, il doit être revalidé avant d'être servi au client
- `proxy-revalidate` : Similaire à `must-revalidate`, mais pour les serveurs proxy.

### `Last-Modified`

Le header `Last-Modified` indique la date de la dernière modification du cache.

### `Etag`

Le header `Etag` sert à renseigner la version d'un cache

### Fonctionnement

Quand on envoie une requête avec cache, cela marche comme suit : 

1. Le client envoie une première requête, NGINX répond avec les headers `Cache-Control`, `Expires`, `Last-Modified` et `Etag`
2. Le client ré-interroge la même ressource, son navigateur vérifie la validité du cache avec les headers `Cache-Control` et `Expires`. Si le cache est toujours valide, le navigateur ne sollicite pas le serveur
3. Si le cache est expiré, le navigateur envoie une requête au serveur pour valider la version du cache
4. Si la version est toujours valide, le serveur renvoie une 304
5. Si la version n'est plus valide, le serveur renvoie une nouvelle version du cache au client.

## La directive `expires`

La directive `expires` sert à définir les règles de mise en cache. Syntaxe : 

```shell
expires [<MODIFIED?>] <EXPIRES_IN>;
```

- `<MODIFIED>` : Si l'option est présente, la durée de validité du cache est recalculée par rapport à la date de dernière modification (header `Last-Modified`)
- `<EXPIRES_IN>` : durée de validité du cache. Exemple : `30d`

Valeurs spéciales pour `<EXPIRES_IN>` : 

- `max` : la valeur doit être mise en cache le plus longtemps possible (par défaut 10 ans)
- `epoch` : pas de mise en cache du tout
- `-1` : la valeur ne doit pas être mise en cache

Exemple de config : 

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


	server {
		listen 443 ssl http2;
		listen [::]:443 ssl http2;
		ssl_certificate /etc/letsencrypt/live/<MY_DOMAIN>/fullchain.pem;
		ssl_certificate_key /etc/letsencrypt/live/<MY_DOMAIN>/privkey.pem;

		server_name <MY_DOMAIN>;

		root /var/www/<MY_DOMAIN>/html;

		location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
			expires 30d;
			add_header Cache-Control "public";
		}
	}

}
```

## Config du cache serveur

### `proxy_cache_path`

La directive `proxy_cache_path` permet de configurer l'utilisation du cache directement sur notre serveur. Elle accepte plusieurs paramètres : 

- `path` spécifie le path du dossier ou le cache sera stocké
- `levels` spécifie une hiérarchie pour les dossiers du cache
- `keys_zone` définit une zone de mémoire partagée pour stocker les keys et d'autres infos des caches
- `max_size` spécifie la taille maximale que le cache peut occuper sur le disque
- `inactive` spécifie un délai d'inactivité pour un cache. Ce dernier sera supprimé s'il n'a pas été utilisé dans ce délai
- `use_temp_path` détermine si oui ou non les valeurs doivent être stockées dans un dossier temp avant de l'être dans le cache
- `manager_files` spécifie le nombre maximal de fichiers méta que NGINX peut créer pour le cache

Exemple : 

```shell
proxy_cache_path /var/cache/nginx keys_zone=<CACHE_NAME>:60m levels=1:2 inactive=1h max_size=1g;
```

Remarques : 

- `max_size=1g` définit la taille maximale du cache à 1Go

Exemple de configuration : 

```shell
http {
    # ...
    proxy_cache_path /var/cache/nginx keys_zone=<CACHE_NAME>:10m;
    server {
        proxy_cache <CACHE_NAME>;
        location / {
            proxy_pass http://localhost:8000;
        }
    }
}
```

### Directives de fonctionnement

NGINX met en cache toutes les réponses de requêtes `GET` et `HEAD` par défaut lors de leur première utilisation. Il utilise comme identifiant de requête la chaîne de celle-ci.
Pour modifier la façon de créer cet identifiant, on utilise la directive `proxy_cache_key` : 

```shell
proxy_cache_key $scheme$proxy_host$request_uri; # comportement par défaut de NGINX
```

On peut également changer les verbes HTTP pour lesquels NGINX doit utiliser le cache : 

```shell
proxy_cache_methods GET HEAD POST;
```

### Limitation du cache

Pour configurer une durée de cache spécifique à chaque code statut de réponse, on utilise la directive `proxy_cache_valid` : 

```shell
proxy_cache_valid 200 201 302 5m;
proxy_cache_valid 404 1m;
```

Si on souhaite que dans certains cas, NGINX n'utilise pas son cache pour répondre au client et forward la requête au service, on utilise la directive `proxy_cache_bypass` : 

```shell
proxy_cache_bypass $cookie_nocache $arg_nocache;
```

Dans cet exemple : 

- `$cookie_nocache` permet de bypasser le cache si un cookie `nocache` est présent dans la requête entrante.
- `$arg_nocache` : si un argument `nocache` est présent dans l'URL de la requête entrante, le cache est bypassé.

Pour définir les conditions dans lesquelles NGINX n'utilise pas le cache, on utilise la directive `proxy_no_cache` : 

```shell
proxy_no_cache $http_authorization;
```

Le paramètre `$http_authorization` signifie ici que dans le cas ou un header `Authorization` est présent dans la requête entrante, la réponse ne sera pas stockée dans le cache.

## Exemple complet

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
	default_type text/plain;
	charset utf-8;

	proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=mon_cache:50m max_size=1g inactive=6h;


	server {
		listen 443 ssl http2;
		listen [::]:443 ssl http2;
		ssl_certificate /etc/letsencrypt/live/<MY_DOMAIN>/fullchain.pem;
		ssl_certificate_key /etc/letsencrypt/live/<MY_DOMAIN>/privkey.pem;

		server_name <MY_DOMAIN>;

		root /var/www/<MY_DOMAIN>/html;

		location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
			expires 30d;
			add_header Cache-Control "public";
		}

		location /api {
			proxy_cache mon_cache;
			proxy_cache_valid 200 302 1h;
			proxy_cache_valid 404 10m;
			proxy_cache_bypass $http_cache_control $cookie_nocache;
			proxy_no_cache $http_authorization;

			proxy_pass http://localhost:3000/;
		}
	}

	server {
		listen 3000;
		listen [::]:3000;

		return 200 "Response content";
	}

}
```


