---
sidebar_position: 7
---

# Load-Balancing

## La directive `upstream`

La directive `upstream` permet de spécifier des serveurs sur lesquels répartir la charge. Elle n'est disponible que pour le contexte `http`. 

```shell
upstream <SERVER_GROUP_NAME> {
    # ...
}
```

### Sous-directive `server`

La sous-directive `server` de `upstream` permet de renseigner les caractéristiques des serveurs du groupe : 

```shell
upstream servers {
    server <MY_DOMAIN>;
    server 127.0.0.1:8080;
    server 127.0.0.1;
    server unix:/tmp/backend3;
}
```

### Exemple basique

```shell
user nginx;
worker_processes auto;
pid /var/run/nginx.pid;


events {
    worker_connections 1024;
}


http {
    default_type text/html;

    upstream serveurs {
        # On répartit la charge sur les serveurs définis plus bas.
        server localhost:3000;
        server localhost:3001;
        server localhost:3002;
    }

    server {
        location / {
            proxy_pass http://serveurs;
        }
    }

    server {
        listen 3000;
        return 200 "<p>Welcome to server 3001</p>";
    }

    server {
        listen 3001;
        return 200 "<p>Welcome to server 3002</p>";
    }

    server {
        listen 3002;
        return 200 "<p>Welcome to server 3003</p>";
    }
}
```

## Méthodes de répartition

### Round Robin

C'est la méthode par défaut employée, les requêtes sont réparties uniformément entre les serveurs suivant le poids de ces derniers.

### Least Connections

Dans ce cas de figure, la requête sera forwardée au serveur ayant le moins de connexions actives. Pour activer cette méthode, il faut utiliser la directive `least_conn` : 

```shell
upstream servers {
    least_conn;
    server localhost:3100;
    server localhost:3101;
    server localhost:3102;
}
```

### IP-Hash

Le serveur qui traitera la requête sera determiné en fonction de l'IP du client, à moins que le dit serveur soit down.

```shell
upstream servers {
    ip_hash;
    server localhost:3100;
    server localhost:3101;
    server localhost:3102;
}
```

Pour retirer un serveur de la liste, on peut utiliser la directive `down` sur celui-ci : 

```shell
upstream servers {
    ip_hash;
    server localhost:3100;
    server localhost:3101 down;
    server localhost:3102;
}
```

### Generic Hash

Le serveur qui traitera la requête sera determiné à partir d'une clé spécifiée en paramètres de la directive `hash`.

```shell
upstream servers {
    hash $request_uri;
    server localhost:3100;
    server localhost:3101 down;
    server localhost:3102;
}
```

### Laquelle choisir ?

- Si vous avez des serveurs ayant des capacités similaires -> Round Robin
- Si vous avez des serveurs ayant des capacités différentes -> Least Connections
- Si on veut que des requêtes provenant d'une même IP soient traitées par un serveur en particulier -> IP Hash

### Poids des serveurs

Le poids des serveurs est un indicateur qui permet d'indiquer quel pourcentage du trafic entrant sera traité par tel ou tel serveur. On spécifie un chiffre de 1 à 10 : 

```shell
upstream servers {
    server localhost:3100 weight=7;
    server localhost:3101 backup;
    server localhost:3102;
}
```

Dans cet exemple : 

- Le serveur `localhost:3100` traitera 8 requêtes sur 10.
- Le serveur `localhost:3101` a été désigné comme serveur de backup si les autres sont down.

> Utilisable uniquement avec les méthodes Round Robin et Least Connection

### Healthchecks

Les healthchecks permettent de contrôler le bon fonctionnement de chacun des serveurs du groupe. Un healthcheck se configure en combinant deux directives : 

- `fail_timeout` : définit la durée pendant laquelle les tentatives sont effectuées. Passé ce délai, le serveur est considéré comme down.
- `max_fails` : définit le nombre de tentatives effectuées pendant la période.

```shell
upstream servers {
    server localhost:3100 max_fails=10 fail_timeout=30s;
    server localhost:3101 ;
    server localhost:3102;
}
```

### Terminaison TLS

Dans le cas d'une application en HTTPS, il est plus pratique que le répartiteur s'occupe des actions de déchiffrage des requêtes entrantes ainsi que du chiffrage des réponses.

Exemple : 

```shell
http {
    upstream api {
        server <SERVER_1_IP>:8080;
        server <SERVER_2_IP>:8080;
        server <SERVER_3_IP>:8080;
    }

    server {
        listen 443 ssl;
        proxy_pass http://api;

        ssl_certificate /etc/ssl/certs/server.crt;
        ssl_certificate_key /etc/ssl/certs/server.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_session_cache shared:SSL:20m;
        ssl_session_timeout 4h;
    }
}
```

### Encryption E2E

Si totuefois le load-balancer n'est pas sur le même réseau que les serveurs de service, il est recommandé d'utiliser une encryption E2E : 

```shell
user nginx;
worker_processes auto;
pid /var/run/nginx.pid;


events {
    worker_connections 1024;
}


http {
    ssl_protocols TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_certificate /etc/letsencrypt/live/<MY_DOMAIN>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<MY_DOMAIN>/privkey.pem;

    default_type text/html;

    upstream serveurs {
        server localhost:3000;
        server localhost:3001;
        server localhost:3002;
    }

    server {
        listen 443 ssl;
        location / {
            proxy_ssl_protocols TLSv1.3;
            proxy_ssl_session_reuse on;
            proxy_pass https://serveurs;
        }
    }

    server {
        listen 3000 ssl;
        return 200 "<p>Welcome to server 3001</p>";
    }

    server {
        listen 3001 ssl;
        return 200 "<p>Welcome to server 3002</p>";
    }

    server {
        listen 3002 ssl;
        return 200 "<p>Welcome to server 3003</p>";
    }
}
```

Remarques : 

- La directive `proxy_ssl_protocols` spécifie le protocole utilisé entre NGINX et les serveurs de service
- La ligne `proxy_ssl_session_reuse on;` active la réutilisation des sessions TLS pour les connexions avec les services

A noter également les directives suivantes : 

- `proxy_ssl_verify` : NGINX vérifie le certificat du service lorsqu'une connexion TLS s'établit.
- `proxy_ssl_verify_depth 2` spécifie la profondeur maximale de la chaîne de certification lors du check du certificat du service.