---
sidebar_position: 6
---

# Mise en place HTTPS

## Fonctionnement

Chaque certificat est associé à un ou plusieurs domaines. On peut retrouver le domaine dans le certificat dans le champ `Common Name` (`CN`). Dans le cas de plusieurs domaines, ce sera
le champ `SAN` (pour `Subject Alternative Name`).

### Validation du domaine

Pour pouvoir obtenir un certificat, il faut valider le domaine concerné et prouver que l'on est bien propriétaire dudit domaine. Cette validation se fait en plusieurs étapes

1. Le serveur envoie une demande à l'autorité avec la clé publique d'une paire de clés
2. L'autorité va "challenger" le serveur pour que ce dernier prouve qu'il est bien le propriétaire du domaine en signant un token avec la clé privée.
3. L'autorité vérifie que le token signé l'a été avec la bonne clé avec celle reçue dans l'étape 1
4. L'autorité valide la paire de clés, ces dernières deviennent des clés autorisées (`authorized key pair`)

### Obtention du certificat

Une fois la paire de clés autorisées obtenue, on peut demander, renouveler ou révoquer un certificat. L'obtention se fait comme suit : 

1. Le serveur génère une nouvelle paire de clés
2. Le serveur construit une CSR pour un domaine inclus dans les domaines valides des clés autorisées. Il inclut la clé publique dans la CSR.
3. Le serveur signe la CSR avec la nouvelle clé privée. Il la resigne avec la clé privée autorisée
4. L'autorité vérifie les signatures avec la clé publique autorisée et la clé publique issue de la CSR.
5. L'autorité retourne le certificat.

## Mise en place (Certbot)

> Pré-requis : Installation de Certbot : 
> ```shell
> sudo apt update
> sudo apt install snapd
> sudo snap install --classic certbot
> ```


Demande de certificat : 

```shell
sudo certbot --nginx
```

En cas de succès, Certbot aura émis le certificat et mis à jour la conf NGINX : 

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

server {
	root /var/www/html;
	index index.html index.htm index.nginx-debian.html;
	server_name www.your_domain.fr your_domain.fr; # managed by Certbot

	location / {
		try_files $uri $uri/ =404;
	}
    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/your_domain.fr/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/your_domain.fr/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.your_domain.fr) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = your_domain.fr) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

	listen 80;
	listen [::]:80 ;
    server_name www.your_domain.fr your_domain.fr;
    return 404; # managed by Certbot

}
```

Remarques : 

- La conf d'écoute (`listen`) indiquent à NGINX d'écouter sur le port 443 (port dédié à HTTPS) avec le protocole TLS pour les IPv4 et les IPv6.
- `ssl_certificate` permet de spécifier le path du certificat
- `ssl_certificate_key` permet de spécifier le path de la clé privée du certificat.
- `include /etc/letsencrypt/options-ssl-nginx.conf;` permet d'inclure la conf de l'autorité pour le TLS.

### Check de la connexion

Pour vérifier une connexion avec TLS : 

```shell
openssl s_client -connect my_domain.fr:443
```

On peut également la tester sur ce [site](https://www.ssllabs.com/ssltest/)

## HSTS

HSTS, pour __HTTP Strict Transport Security__ permet de se prémunir davantage contre des attaques de type Man in the Middle ou downgrade. Il informe le navigateur que notre site ne doit être
accessible qu'en HTTPS.

Pour la configuration de HSTS, on va rajouter le header `Strict-Transport-Security` :

```shell
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

Remarques : 

- `includeSubDomains` indique qu'il faut inclure tous les sous-domaines
- `preload` permet d'inclure notre site dans la liste de pré-chargement du navigateur client
- `always` garantit que le header est toujours envoyé, même en cas d'erreur.

> WARNING : Bien s'assurer que notre site fonctionne bien en HTTPS avant de mettre le header, sinon il ne sera pas accessible pendant la période du `max-age`

> Il faut également enregistrer notre domaine [ici](https://hstspreload.org/)


## OCSP

Le protocole OCSP (pour __Online Certificate Status Protocol__) sert à valider les certificats X-509. Quand une requête est envoyée, le navigateur interroge le serveur OCSP de l'autorité
pour vérifier le statut du certificat

### Configuration

```shell
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/my_domain.fr/fullchain.pem;
```

## Cas pratiques

### Site statique avec Certbot

Demande de certificat : 

```shell
sudo certbot --nginx --agree-tos
```

> Si plusieurs domaines, les séparer par un espace.

Dans le dossier `etc/nginx/sites-available` du serveur distant, créer un fichier `<MY_DOMAIN>`. Y copier la config : 

```shell
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;

    root /var/www/<MY_DOMAIN>/html;

    index index.html;
    server_name www.<MY_DOMAIN> <MY_DOMAIN>;


    location / {
        try_files $uri $uri/ =404;
    }


    ssl_certificate /etc/letsencrypt/live/www.<MY_DOMAIN>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.<MY_DOMAIN>/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.3;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=63072000" always; 
    # ajouter preload ci-dessus une fois la config vérifiée et testée.

    ssl_stapling on;
    ssl_stapling_verify on;

    ssl_trusted_certificate /etc/letsencrypt/live/www.<MY_DOMAIN>/fullchain.pem;

    resolver 127.0.0.1;
}
```

Pour activer la config : 

```shell
sudo ln -s /etc/nginx/sites-available/<MY_DOMAIN> /etc/nginx/sites-enabled/
```

Supprimer `sites-enabled/default` puis recharger NGINX : 

```shell
nginx -t && nginx -s reload
```

> Certbot renouvelle automatiquement les certificats.


### Docker

Fichier `docker-compose.yml` : 

```yaml
version: "3.8"
services:
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    restart: always
    environment:
      - NODE_ENV=production

  nginx:
    build:
      context: ./
      dockerfile: nginx/Dockerfile
    ports:
      - 80:80
      - 443:443
    restart: always
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt
```

Fichier `nginx.conf` : 

```shell
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log crit;
pid /var/run/nginx.pid;

events {
}

http {
    default_type application/octet-stream;
    include /etc/nginx/mime.types;

    server {
        listen 80 default_server;
        listen [::]:80 default_server;

        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl;
        listen [::]:443 ssl;

        root /var/www/html;

        index index.html index.htm index.nginx-debian.html;
        server_name www.<MY_DOMAIN> <MY_DOMAIN>;

        ssl_certificate /etc/letsencrypt/live/<MY_DOMAIN>/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/<MY_DOMAIN>/privkey.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;
        ssl_protocols TLSv1.3;
        ssl_prefer_server_ciphers off;
        add_header Strict-Transport-Security "max-age=63072000" always;
        ssl_stapling on;
        ssl_stapling_verify on;
        ssl_trusted_certificate /etc/letsencrypt/live/<MY_DOMAIN>/fullchain.pem;
        resolver 127.0.0.1;


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