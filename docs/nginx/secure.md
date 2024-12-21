---
sidebar_position: 13
---

# NGINX et sécurité

## Attaques courantes

### Man in the Middle

L'attaque __Man in the Middle__ consiste à intercepter la communication entre le client et le serveur. Pour y remédier, quelques recommandations : 

- Utiliser HTTPS partout ou c'est possible
- Utiliser le protocole HSTS et d'être sur la liste de preload du navigateur client
- Utiliser une version de TLS > 1.2 de manière systématique, sans laisser la possibilité d'une attaque par downgrade.

### DDOS

L'attaque de déni de service consiste à saturer le serveur cible de requêtes de façon à le rendre indisponible pour les clients. Pour éviter ce cas : 

- Limiter le nombre de requêtes entrantes
- Limiter le nombre de connexions
- Mettre en place des timeouts
- Bloquer les pays dans lequel on n'opère pas

### Buffer overflow

L'attque __buffer overflow__ consiste à envoyer des requêtes volumineuses de façon à saturer la mémoire du serveur cible. Pour contrer : 

- Limiter la taille du body des requêtes entrantes (`client_body_buffer_size`  et `client_max_body_size`)

### Clickjacking

Le clickjacking consiste à faire cliquer la victime sur qqch sans qu'il s'en aperçoive. Le plus souvent, on recouvre des liens ou des boutons avec des iframe transparentes. Pour
contrer cette attaque, il faut utilise le header CSP :

```shell
add_header Content-Security-Policy "frame-ancestors 'self'";
```

Pour interdire toute utilisation de contenu : 

```shell
add_header Content-Security-Policy "frame-ancestors 'none'";
```

### Cross-Site-Tracing

L'attaque __Cross-Site Tracing__ utilise le verbe HTTP `TRACE`. Par défaut, ce verbe est refusé par NGINX qui renverra une erreur 405.

## Maîtriser les infos communiquées

### Version de NGINX

Par défaut, NGINX renvoie sa version de build dans les headers de la réponse envoyée au client. Pour désactiver ce comportement, on set la directive `server_tokens` à `off` : 

```shell
http {
	server_tokens off;

	server {
		listen 80;
		listen [::]:80;
		location / {
			return 200 'OK';
		}
	}
}
```

### Headers des services

Dans le cas d'un RP et pour masquer les headers des services utilisés, on utilise `proxy_hide_header` avec le nom du header à retirer de la réponse au client : 

```shell
location /api {
    # ...
    proxy_hide_header X-Powered-By;
}
```

### Envoyer de fausses informations

On peut tout aussi bien envoyer de fausses informations aux potentiels attaquants. Le module `more_set_headers` non natif. 

```shell
server {
    listen 80;
    listen [::]:80;

    root /usr/share/nginx/html;
    index index.html;

    more_set_headers 'Server: apache';
}
```

## HotLinking

Le HotLinking consiste à utiliser des images herbergées sur notre serveur sur un autre site, ce qui consomme de la bande passante. Pour l'éviter : 

```shell
location ~ \.(jpe?g|png|gif)$ {
    valid_referers none blocked ~.google. ~.bing. ~.yahoo domaine.fr *.domaine.fr;
    if ($invalid_referer) {
        return 403;
    }
}
```

La directive `valid_referers` accepte des paramètres spéciaux tels que : 

- `none` : requêtes sans le header `Referer`
- `blocked` : requêtes avec header masqué par le client
- `server_names` : toutes les noms de nos serveurs

## Authentification serveur

On peut mettre en place un mécanisme d'authentification sur notre serveur avec un outil de gestion des mots de passe, par exemple `apache2-utils`.

### Installation

```shell
sudo apt install apache2-utils
```

### Création d'un user

```shell
sudo htpasswd -c /etc/nginx/.htpasswd <USERNAME>
```

### Configuration

```shell
user nginx;
worker_processes auto;

error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;


events {
    worker_connections 2048;
}


http {
    include /etc/nginx/mime.types;
    default_type text/plain;
    charset utf-8;


    server {
        listen 80;
        listen [::]:80;

        root /usr/share/nginx/html;
        index index.html;

        auth_basic "Admin";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }
}
```

## Auth par sous-requête

L'authentification par sous-requête consiste, pour NGINX, à faire authentifier une requête entrante par un service externe, donc à effectuer une "sous-requête" vers ce service. C'est
très courant pour mettre en place des OAuths.

### La directive `auth_request`

La directive `auth_request` permet de configurer le comportement de NGINX à la recéption de la réponse de la sous-requête. Exemple d'usage : 

```shell
location /protected/ {
    auth_request /auth;
    auth_request_set $auth_status $upstream_status;
    # ...
}

location = /auth {
    proxy_pass http://my_auth_server;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
}
```

Dans cet exemple, une requête sur la route `/protected` va déclencher une sous-requête vers la route `/auth`. Si la sous-requête renvoie une 200, NGINX continue le traitement. En cas
d'erreur d'authentification (401 ou 403), NGINX forwarde l'erreur renvoyée par `/auth`, sinon une 500.

Autres remarques : 

- Les directives `proxy_pass_request_body off;` et `proxy_set_header Content-Length "";` permettent de s'assurer qu'on ne transmet que les headers de la requête entrante au service 

## fail2ban

fail2ban est un utilitaire conçu pour empêcher les intrusions et les attaques par force brute. Il bloque automatiquement les IPs incriminées. fail2ban effectue les tâches suivantes : 

- Surveillance des logs spécifiés dans sa config
- Utilise des filtres à configurer pour repérer les activités suspectes
- Comptage des tentatives sur une période spécifiée
- Ban, si la limite des tentatives est dépassée

### Installation

```shell
sudo apt-get update && sudo apt-get install fail2ban
# Vérifier l'installation
sudo systemctl status fail2ban
```

### Fichiers de configuration

Les fichiers de config de fail2ban sont généralement situés dans le dossier `/etc/fail2ban`, il y a : 

- `fail2ban.conf` pour la config générale
- `jail.conf` pour la config des prisons. C'est dans ce fichier qu'on configure la surveillance, les filtres, les actions à effectuer en cas de suspicion.
- `jail.local` fichier dans lequel faire ses modifications pour le fichier `jail.conf`
- `filter.d/` : dossier pour les filtres
- `action.d/` : dossier pour les actions
- `/var/log/fail2ban.log` : fichier de logs de fail2ban

### Config NGINX

Config par défaut de NGINX : 

```shell
[nginx-http-auth]

port    = http,https
logpath = %(nginx_error_log)s

# To use 'nginx-limit-req' jail you should have `ngx_http_limit_req_module`
# and define `limit_req` and `limit_req_zone` as described in nginx documentation
# http://nginx.org/en/docs/http/ngx_http_limit_req_module.html
# or for example see in 'config/filter.d/nginx-limit-req.conf'
[nginx-limit-req]
port    = http,https
logpath = %(nginx_error_log)s

[nginx-botsearch]

port     = http,https
logpath  = %(nginx_error_log)s
maxretry = 2
```

Remarques : 

- La section `nginx-http-auth` configure la prison pour les auth ratées
- La section `nginx-limit_req` configure pour les dépassements de limites du nombre de requêtes
- La section `nginx-botsearch` configure pour les tentatives de recherche effectuées par des bots
- `port` permet de spécifier les ports qui seront surveillés : `http` -> 80 et `https` -> 443.
- `logpath` permet de spécifier le path du journal NGINX utilisé pour les tentatives d'authentification.
- `maxretry` permet de spécifier le nombre de tentatives maximum.
- `bantime` permet de spécifier la durée du bannissement d'une IP
- `findtime` permet de spécifier la période sur laquelle fail2ban recherche des tentatives échouées.
- Pour activer la prison, on utilise `enabled = true`

### Activation

```shell
sudo systemctl enable fail2ban
```

### Démarrage

```shell
sudo systemctl start fail2ban
```

### Listing des prisons

```shell
sudo fail2ban-client status
```

Pour avoir le détail d'une prison en particulier : 

```shell
sudo fail2ban-client status <PRISON_NAME>
```

### Unban d'une IP

```shell
sudo fail2ban-client set <PRISON_NAME> unbanip <IP>
```