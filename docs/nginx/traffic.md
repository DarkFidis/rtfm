---
sidebar_position: 10
---

# Gérer le traffic

## Localisation

Il peut être intéressant de connaître la localisation du client qui requête notre serveur pour les raisons suivantes : 

- Personnaliser le contenu en fonction de cette localisation, par exemple le catalogue de Netflix
- Restreindre l'accès à certaines pages de notre site web
- Load balancing géographique, pour rediriger les requêtes des clients vers les serveurs les plus proches de chez eux
- Statistiques : par exemple analyser le trafic venant d'un pays ou d'un continent.

### Le module GeoIP2

Le module GeoIP2 sert à identifier l'emplacement géographique des clients en fonction de leur adresse IP. Il se base sur des bases de données d'IP à download et maintenir.

#### Installation

```shell
# Si unzip pas installé :
sudo apt install unzip
# DL l'archive de GeoIP2 : 
wget https://github.com/leev/ngx_http_geoip2_module/archive/refs/heads/master.zip
unzip master.zip
# Installation d'un compilateur de C + Dépendances du build de NGINX : 
sudo apt-get install build-essential libpcre3-dev zlib1g-dev libssl-dev
# Build de NGINX : 
cd nginx-<VERSION>/
./configure --with-compat --add-dynamic-module=/root/ngx_http_geoip2_module-master
make
cp objs/ngx_http_geoip2_module.so /etc/nginx/modules
```

Ensuite, il faut download les bases de données d'IP. La plus connue étant celle de [GeoLite2](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data/) qui nécessite la création d'un compte sur leur plateforme.
Une fois les données acquises, il faut les unzip et les copier dans le dossier `etc/nginx/geoip2`. Ensuite il faut DL les dependances de MaxMind : 

```shell
sudo apt-get install software-properties-common && \
sudo add-apt-repository ppa:maxmind/ppa && \
sudo apt update && \
sudo apt install libmaxminddb0 libmaxminddb-dev mmdb-bin
```

#### Utilisation

Exemple de configuration avec GeoIP2 : 

```shell
load_module modules/ngx_http_geoip2_module.so;
user nginx;
worker_processes auto;

error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;


events {
    worker_connections 1024;
}


http {
    include /etc/nginx/mime.types;
    default_type text/plain;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
    '$status $body_bytes_sent "$http_referer" '
    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    geoip2 /etc/nginx/geoip2/GeoLite2-Country.mmdb {
        $geoip2_metadata_country_build metadata build_epoch;
        $geoip2_data_country_code default=US source=$remote_addr country iso_code;
        $geoip2_data_country_name country names fr;
    }
    geoip2 /etc/nginx/geoip2/GeoLite2-City.mmdb {
        $geoip2_metadata_city_build metadata build_epoch;
        $geoip2_data_city_name default=London city names fr;
    }

    server {
        listen 80;
        listen [::]:80;
        server_name nginx-dyma.site;

        return 200 "
            City DB timestamp : $geoip2_metadata_city_build
            Country DB timestamp : $geoip2_metadata_country_build
            City : $geoip2_data_city_name
            Country code : $geoip2_data_country_code
            Country : $geoip2_data_country_name
        ";
    }
}
```

Le module GeoIP2 met à disposition des variables : 

- `$geoip2_metadata_city_build` : date du dernier build de la base des villes
- `$geoip2_metadata_country_build` : date du dernier build de la base des pays
- `$geoip2_data_city_name` : nom de la ville associée à l'IP du client
- `$geoip2_data_country_code` : code pays associé à l'IP du client
- `$geoip2_data_country_name` : nom du pays associé à l'IP du client
- `$geoip2_data_latitude`
- `$geoip2_data_longitude`
- `$geoip2_data_state_name` : nom de l'état ou région associé à l'IP du client

## La directive `map`

La directive `map` permet de créer une variable nouvelle en fonction du contenu d'une variable existante, le plus souvent native. Elle s'utilise comme suit, dans le contexte `http` : 

```shell
map $CURRENT_VAR $NEW_VAR {
    CURRENT_VALUE_1 NEW_VALUE_1;
    CURRENT_VALUE_2 NEW_VALUE_3;
    # ...
}
```

> Les `CURRENT_VALUE` peuvent être des strings (insensibles à la casse) ou des regexps

> Les regexps doivent débuter par `~` ou `~*`

Un exemple concret de son utilisation est pour l'I18N de notre site : 

```shell
http {
    map $http_accept_language $language {
        default fr;
        ~*en en;
        ~*es es;
        ~*de de;
    }

    server {
        # ...
        location / {
            try_files /$language$request_uri /fr$request_uri =404;
        }
        # ...
    }
}
```

## La directive `if`

La directive `if` permet d'appliquer d'autres directives en fonction d'une condition spécifiée dans le bloc : 

```shell
if (<CONDITION>) {
    # ...
}
```

## Le code statut 444

Le code statut 444 est propre à NGINX, son usage signifie "No Response". Il est utilisé pour bloquer des requêtes ou des adresses IP

```shell
map $geoip2_data_country_code $allowed_country {
  default 0;
  FR 1;
  US 1;
  UK 1;
}

if($allowed_country = 0) {
  return 444;
}
```

## La notation CIDR

La notation CIDR est une notation combinant une adresse IP et un préfixe indiquant le nombre de bits que comporte le masque de sous-réseau utilisé pour répresenter la partie réseau de cette même adresse.
Exemple de CIDR : `192.168.0.1/24`. Dans cet exemple, la longueur du préfixe réseau est de 24, les 8 bits restants sont pour la partie host. Le sous-réseau contient donc 2^8 IPs allant de 
`192.168.0.1` à `192.168.0.255`

## Directives `allow` et `deny`

Les directives `allow` et `deny` sont utilisées pour autoriser (`allow`) ou bien blacklister (`deny`) une IP. Ces directives sont utilisables dans les contextes `http`, `server`, `location` ou encore `limit_except`

```shell
allow <IP> | <CIDR> | <UNIX> | all;
deny <IP> | <CIDR> | <UNIX> | all;
```

On peut spécifier au choix : 

- `<IP>` : Une adresse IP fixe
- `<CIDR>` : Une plage d'IPs avec la notation CIDR
- `<UNIX>` : un path de socket Unix, prefixé par `unix:`
- `all` : autorise ou blackliste tout le monde

> On peut tout à fait utiliser plusieurs fois ces directives dans le même bloc pour par exemple combiner une IP fixe et une plage d'IPs

## Quota-limiters

On peut limiter le nombre de requêtes que peut effectuer un client dans un délai spécifié.

### La directive `limit_req_zone`

La directive `limit_req_zone` permet de définir un quota-limiter pour une requête en particulier. Pour se faire, elle accepte plusieurs paramètres : 

- `key` : clé de la requête sur lequel appliquer le QL
- `zone=<NAME>:<SIZE>` : nom et taille de la mémoire allouée pour stocker l'état de la requête.
- `rate` : nombre maximum de requêtes autorisé

### La directive `limit_req`

La directive `limit_req` permet d'activer le QL dans le contexte ou elle est définie. Elle agit de concert avec la directive `limit_req_zone` vue précédemment. Elle a pour paramètres : 

- `zone` : nom de la mémoire définie dans `limit_req_zone`
- `burst` (optionnel) : spécifie le nombre de requêtes max qui seront mises en attente au déla de la limite. Si non défini, 503 quand la limite est dépassée.
- `nodelay` (idem) : Si spécifié, les requêtes en attente seront traitées sans délai jusqu'à la limite du `burst`
- `delay` (idem) : Les requêtes seront traitées en respectant le délai spécifié (en ms)

### La directive `limit_req_status`

La directive `limit_req_status` permet de changer le code statut par défaut renvoyé en cas de dépassement du QL.

```shell
limit_req_status 429;
```

### Exemple de configuration

```shell
user nginx;
worker_processes auto;

error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;


events {
    worker_connections 1024;
}


http {
    include /etc/nginx/mime.types;
    default_type text/plain;
    charset utf-8;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
    '$status $body_bytes_sent "$http_referer" '
    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    limit_req_zone $binary_remote_addr zone=limite_api:10m rate=5r/s;

    server {
        listen 80;
        listen [::]:80;
        server_name <MY_DOMAIN>;


        location /api/ {
            limit_req zone=limite_api;

            proxy_pass http://localhost:3000;
        }

    }

    server {
        listen 3000;
        listen [::]:3000;
        server_name <MY_DOMAIN>;

        location / {
            return 200 "OK !";
        }

    }
}
```

## Limiter les connexions

Si on veut limiter le nombre de connexions simultanées pour un IP donné, il existe les directives `limit_conn` et `limit_conn_zone`

### `limit_conn_zone`

Les paramètres sont similaires à ceux de `limit_req_zone` : 

```shell
limit_conn_zone <KEY> zone=<NAME>:<SIZE>;
```

### `limit_conn`

```shell
limit_conn <NAME> <RATE>;
```

### `limit_conn_status`

```shell
limit_conn_status 429;
```

### Exemple d'utilisation

```shell
user nginx;
worker_processes auto;

error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;


events {
    worker_connections 1024;
}


http {
    include /etc/nginx/mime.types;
    default_type text/plain;
    charset utf-8;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
    '$status $body_bytes_sent "$http_referer" '
    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
    limit_conn conn_limit 10;

    server {
        listen 80;
        listen [::]:80;
        server_name <MY_DOMAIN>;


        location /api/ {

            proxy_pass http://localhost:3000;
        }

    }

    server {
        listen 3000;
        listen [::]:3000;
        server_name <MY_DOMAIN>;

        location / {
            return 200 "OK !";
        }

    }
}
```

## Limiter la bande passante

Il est possible de limiter la vitesse de downloading ou d'uploading pour les clients avec les directives `proxy_download_rate` et `proxy_upload_rate` : 

```shell
server {
    proxy_download_rate 200k ;
    proxy_upload_rate 100k ;
}
```

Dans cet exemple, le client peut download jusqu'à 200Ko par seconde. Exemple d'implémentation : 

```shell
stream {
    #...
    limit_conn_zone $binary_remote_addr zone=limit_dl:10m ;

    server {
        #...
        limit_conn limit_dl 1 ;
        proxy_download_rate 200k ;
        proxy_upload_rate 100k ;
    }
}
```

### `limit_rate_after`

La directive `limit_rate_after` permet d'appliquer une limite au delà d'un certain volume de données transmis : 

```shell
location /download/ {
  limit_rate_after 10m;
  limit_rate 1m;
}
```

Ici le client sera limité à 1Mo/sec au-delà de 10Mo de download.