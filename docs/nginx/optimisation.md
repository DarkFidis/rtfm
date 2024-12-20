---
sidebar_position: 12
---

# Optimisation

## Fichiers descripteurs

Les fichiers descripteurs (__file descriptors__) sont des ressources de l'OS qui servent à representer les fichiers/connexions ouvert(e)s.

> NGINX peut utiliser jusqu'à 2 descriptors par connexion. Dans le cas d'un usage en tant que RP, NGINX utilise un descriptor pour la requête entrante  et une autre pour la requête au service.

> Par défaut, les ressources sont limitées par le système.

### La commande `ulimit`

La commande `ulimit` sert à afficher les limites des ressources système pour chaque process en cours d'exécution : 

```shell
ulimit -a
```

### Afficher les descripteurs

Pour afficher les descripteurs utilisés par un process `<PROCESS_NAME>` : 

```shell
sudo lsof -c <PROCESS_NAME> | ws -l
```

Remarques : 

- `lsof -c` affiche tous les fichiers ouverts par le process
- `ws -l` permet de compter le nombre de lignes affichées par la sortie

### Configurer la limite de descripteurs

POur configurer cette limite, on utilise `worker_rlimit_nofile` pour les limitations par worker : 

```shell
worker_rlimit_nofile 4096;
```

> Il est d'usage d'associer cette limite à une limite de connexions sur ce même worker. Il est recommandé d'avoir une limite de descripteurs 4 fois plus elevée que la limite de connexions pour un worker.

### Configurations des timeouts

#### Lecture du body de la requête entrante

```shell
client_body_timeout <NB>;
```

#### Lecture des headers de la requête entrante

```shell
client_header_timeout <NB>;
```

#### Réponse au client

```shell
send_timeout <NB>;
```

#### Délai pour les connexions Keep-Alive

```shell
keepalive_timeout <NB>
```

#### Reset de connexion

```shell
reset_timedout_connection on;
```

## Optimisation d'un RP

### Directive `keepalive`

Utilisée dans un contexte `upstream`, la directive `keepalive` permet d'avoir un cache de connexions. Elle prend en paramètres le nombre maximum de connexions à garder ouvertes par worker : 

Exemple : 

```shell
proxy_http_version 1.1;
proxy_set_header Connection "";

upstream api {
  server 10.0.0.42;
  server 10.0.2.56;
  keepalive 32;
}
```

Remarques : 

- `proxy_set_header Connection "";` permet de supprimer le header `Connection` dont la valeur par défaut est `close`, c'est qui permet de garder la connexion ouverte.

### Timeouts pour RP

Exemple de configuration de tiemouts : 

```shell
proxy_read_timeout 10s;
proxy_connect_timeout 3s;
proxy_send_timeout 5s;
```

Remarques : 

- `proxy_read_timeout` définit le délai pour lire la réponse du service
- `proxy_connect_timeout` définit le délai pour se connecter au service
- `proxy_send_timeout` définit le délai pour envoyer une requête au service

## Optimisation du TLS

Exemple de config optimisée

```shell
http {
    # ...

    server {
        listen 443 ssl http2 deferred reuseport;
        listen [::]:443 ssl http2 deferred reuseport;

        # ...
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:60m;
        ssl_session_tickets off;
        ssl_protocols TLSv1.3;
        ssl_prefer_server_ciphers off;
        add_header Strict-Transport-Security "max-age=63072000" always;
        ssl_stapling on;
        ssl_stapling_verify on;
        ssl_trusted_certificate /etc/letsencrypt/live/<MY_DOMAIN>/fullchain.pem;
        resolver 1.1.1.1 208.67.222.222 8.8.8.8 valid=300s;
        resolver_timeout 1s;

    }
}
```

### La directive `resolver`

La directive `resolver` permet de configurer les serveurs DNS pour résoudre les noms des serveurs

### Le paramètre `deferred`

Le paramètre `deferred` de `listen` sert à mettre en place le retardement de l'acceptation des connexions jusqu-au moment ou le serveur NGINX reçoive les données. Par défaut, l'acceptation d'une
requête entrante par NGINX se fait avant la reception des données. Avec un paramètre `deferred` défini, NGINX attend la reception des données d'abord et accepte la connexion ensuite.

### Le paramètre `reuseport`

Le paramètre `reuseport` permet à un groupe de sockets d'écouter sur la même combinaison IP/port. Dans ce cas, le noyau Linux s'occupe de répartir la charge entre ces sockets.

## Optimisations TCP

### La directive `sendfile`

La directive `sendfile` permet d'améliorer les performances de service de fichiers statiques : chargement des fichiers et temps de réponse du serveur.

```shell
sendfile on;
```

## Mise en mémoire tampon des logs

Exemple de configuration de logs pour les serveurs à fort traffic : 

```shell
http {
  map $status $loggable_status {
      ~^[23]  0;
      default 1;
  }

  map $request_uri $loggable {
      ~signup 1;
      ~signin 1;
      ~contact 1;
      default $loggable_status;
  }

  access_log /var/log/nginx/access.log main buffer=64k flush=10m if=$loggable;
}
```

Pour écrire uniquement des logs d'erreurs critiques (`crit`) : 

```shell
error_log /var/log/nginx/error.log crit;
```