---
sidebar_position: 11
---

# Logging & Monitoring

## Path pour les logs

Pour configurer le path dans lequel les logs d'accès de NGINX seront stockés, on utilise la directive `access_log`

```shell
access_log <LOGS_PATH>;
```

### Paramètres

La directive `access_log` accepte de nombreux paramètres : 

- `<PATH>` : path du fichier dans lequel les logs seront écrits
- `<FORMAT>` : format des logs
- `buffer=<SIZE>` : taille du tampon pour l'écriture des logs
- `gzip[=<LEVEL>]` : permet d'utiliser la compression pour les logs
- `flush=<TTL>` : spécifie le temps que les logs peuvent rester dans le tampon avant d'être écrits dans le fichier
- `if=<CONDITION>` : spécifie une condition pour logger ou non

Syntaxe générique de la directive : 

```shell
access_log <PATH> [<FORMAT> [buffer=<SIZE>] [gzip[=<LEVEL>]] [flush=<TIME>] [if=<CONDITION>]];
```

## Personnaliser le contenu des logs

Pour customiser le contenu des logs, on utilise la directive `log_format`. Exemple d'usage : 

```shell
http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
    '$status $body_bytes_sent "$http_referer" '
    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
}
```

### Logs en JSON

```shell
http {
    log_format json_combined escape=json '{'
        '"time_local":"$time_local",'
        '"remote_addr":"$remote_addr",'
        '"remote_user":"$remote_user",'
        '"request":"$request",'
        '"status":$status,'
        '"body_bytes_sent":$body_bytes_sent,'
        '"request_time":$request_time,'
        '"http_referer":"$http_referer",'
        '"http_user_agent":"$http_user_agent",'
        '"http_x_forwarded_for":"$http_x_forwarded_for"'
        '}';
}
```

## Logs d'erreurs

### Stockage

POur configurer le stockage des logs, on utilise `error_log` : 

```shell
error_log <FILE_PATH> <LOG_LEVEL>
```

## Rotation des logs

Pour éviter que notre fichier de logs devienne trop gros, il y a ce qu'on appelle la rotation des logs. A partir d'un moment, le fichier de logs courant est archivé et un nouveau fichier
de logs est créé. Ce mécanisme n'est pas géré nativement par NGINX, il utilise `logrotate`.

### Config `logrotate`

On peut accéder aux fichiers de config de logrotate sur `/etc/logrotate.d/`. La config par défaut installée par NGINX est la suivante : 

```shell
/var/log/nginx/*.log {
        daily
        missingok
        rotate 60
        compress
        delaycompress
        notifempty
        create 640 nginx adm
        sharedscripts
        postrotate
                if [ -f /var/run/nginx.pid ]; then
                        kill -USR1 `cat /var/run/nginx.pid`
                fi
        endscript
}
```

Il se traduit comme suit : 

- La première ligne avec `daily` précise que la rotation des logs se fait tous les jours
- La deuxième ligne avec `missingok` précise qu'il faut ignorer les fichiers de logs manquants
- La troisième ligne `rotate 60` précise que les logs sont archivés 60 jours.
- `compress` précise qu'il faut compresser les logs
- `delaycompress` permet de retarder la compression à la rotation suivante
- `notifempty` permet de ne pas effectuer de rotation si le fichier courant est vide
- La ligne `create` précise qu'il faut créer le fichier de log avec les permissions `640` et les owners `nginx` et `admin`
- `postrotate` permet d'exécuter un script juste après chaque rotation

## Monitoring

### Le module `sub_status`

Le module `sub_status` permet de recueuillir des infos sur le nombre de connexions actives, le nombre de connexions acceptées, gerées et traitées.

```shell
sub_status;
```

### Amplify

Amplify est un outil de monitoring avancé qui collecte de nombreuses infos sur NGINX, à partir de `sub_status` vu précedemment, des logs et du process NGINX.

#### Configuration

```shell
user nginx;
worker_processes auto;

pid /var/run/nginx.pid;


events {
    worker_connections 1024;
}


http {
    include /etc/nginx/mime.types;
    default_type text/plain;
    charset utf-8;

    access_log /var/log/nginx/access.log combined;
    error_log /var/log/nginx/error.log warn;

    server {
        listen 80;
        listen [::]:80;
        server_name <MY_DOMAIN>;
        root /usr/share/nginx/html;

    }

    server {
        listen 127.0.0.1:80;
        server_name 127.0.0.1;
        location /nginx_status {
            stub_status on;
            allow 127.0.0.1;
            deny all;
        }
    }
}
```

#### Page Overview

La page Overview fournit une vue globale de l'état de l'infrastructure NGINX. Parmi les métriques affichées, on trouve : 

- Le nombre de requêtes
- Le nombre de requêtes en erreur 5xx
- Durée de la requête
- Trafic
- Utilisation des CPUs

Dans le bloc supérieur gauche, on affiche un indicateur, l'AHS (__Application Health Score__), calculé en multipliant 3 indicateurs : le % de demandes réussies, le % de demandes dites "opportunes"
et la disponibilité de l'agent

#### La page Graph

La page Graph affiche les métriques de performance en temps réel du serveur NGINX et du système.

#### La page Inventory

La page Inventory affiche : 

- Nom du serveur
- Etat
- Métriques clés comme par exemple le nombre de requêtes reçues par seconde, l'utilisation du CPU, etc.
- Tags : Tags des serveurs en fonction des environnements ou autres critères

#### La page Analyzer

La page Analyzer permet d'analyser la configuration de NGINX et de repérer des problèmes de sécurité, de faire des recommandations. Quand un rapport est produit à partir d'une config,
on y trouve les infos suivantes : 

- `BUILD` : Infos sur la version de NGINX utilisée
- `Static analysis` : C'est là que se trouve le rapport sur les erreurs de config, les recommandations et à quel endroit dans le code.
- `Virtual servers` : recense les serveurs virtuels et leur détail (nom, port, endroit dans le code et autres)
- `Security advisories` : Recommandations de sécurité pour la version de NGINX utilisée
- `SSL` : tout ce qui est en rapport avec SSL : version d'OpenSSL, serveurs configurés, certificats...

#### La page Alerts

La page Alerts donne la configuration des règles d'alertes utilisées pour remonter toutes les anomalies du système
