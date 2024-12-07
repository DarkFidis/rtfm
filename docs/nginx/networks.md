---
sidebar_position: 1
---

# Protocoles réseaux

## Internet

Internet est composé d'immenses réseaux appelés les *__Network Service Providers__* (NSP). Ce sont eux qui contrôlent les infrastructures physiques
comme les cables sous-marins, mieux connus sous le nom d'autoroutes du web. Les NSP sont connectés entre eux grâce à des points d'accès, les
*__Network Access Point__* (NAP) ou *__Metropolitan Area Exchange__* (MAE). Ces gros opérateurs vendent de la bande passante aux fournisseurs d'accès
à Internet comme Orange, Free ou Bouygues, qui ont la charge de réseaux à l'échelle nationale.

Par conséquent, lorqu'on envoie des informations sur Internet, ces dernières empruntent un chemin précis, que l'on peut consulter avec les
commandes suivantes : 

- Windows : 

```shell
tracert google.com
```

- Linux et Mac : 

```shell
traceroute google.com
```

Quand on fait une requête sur un site Internet, on ne connaît pas l'IP de la machine de destination. La requête remonte chaque routeur du réseau 
jusqu'à ce qu'un routeur connaisse l'IP de destination. En gros, si un routeur ne connaît pas l'IP de destination, il transfert la requête au
routeur situé au dessus de lui et ainsi de suite jusqu'au NSP. Ce dernier va savoir ou diriger la requête pour trouver la bonne IP de destination.

Les routeurs peuvent trouver l'IP associée à l'adresse du site en interrogeant le *__Domain Name System__* (DNS)

## Le protocole Internet (IP)

Le protocole Internet ou IP permet le routage et l'adressage des paquets. Son rôle est de transmettre des paquets le plus vite possible
d'un point A à un point B, sans se soucier des problématiques de sécurité, comme la perte ou la corruption des données. Aujourd'hui, les
versions les plus utilisées sont IPv4 et IPv6. La différence entre les deux réside dans leur encodage. En effet, on ne dispose plus de
suffisamment d'adresses IPv4, codées en 32bits, contrairement aux IPv6, codées en IPv6.

> Chaque paquet dispose d'un TTL de façon à être supprimé si il devait être perdu.

## Le protocole TCP

Le protocole TCP, pour *__Transmission Control Protocol__*, permet le transport de manière fiable de données découpées en paquets TCP.
Grâce à ce protocole, on s'assure que les données soient fiables et arrivent dans le bon ordre.

### Connexion

Une connexion TCP se fait en trois étapes, appelé *__three way handshake__* : 

1. *__Synchronize Sequence Numbers__*
2. *__Synchronize Acknowledge__*
3. *__Acknowledge__*

Cette connexion en trois temps permet aux deux parties (client et serveur) de se mettre d'accord sur les paramètres de connexion et qu'elles
sont prêtes à échanger des données. Une fois la connexion établie, les données peuvent être echangées de manière fiable et ordonnée.

### Structure d'un paquet TCP

Un paquet TCP porte en son sein les infos suivantes : 

- Port source et port destination : identifiants les ports de départ et d'arrivée du paquet

> Un port est un numéro codé sur 16 bits qui permet, sur une machine, de distinguer les différents services que cette dernière expose. Il
> permet d'envoyer l'information au bon service.

- Numéro de séquence
- Numéro d'acquittement
- Somme de contrôle : somme calculée sur l'ensemble des headers du paquet et de ses données, cela permet de tester l'intégrité du paquet.

### Communication TCP/IP

Une communication TCP/IP entre deux machines suit les étapes suivantes : 

1. Division des données en paquets
2. Résolution DNS
3. Ajout des headers TCP, importants pour la communication
4. Encapsulation des paquets : Les paquets TCP sont encapsulés dans des paquets IP par la couche réseau, qui lui rajoute des headers IP.
5. Encapsulation des paquets IP dans la couche de liaison : Les paquets IP sont encapsulés dans des trames de la couche de liaison pour être ensuite envoyées sur le réseau
6. Transmission des trames sur le réseau
7. Routage des paquets : Les routeurs acheminent les paquets vers la bonne destination grâce aux informations contenues dans les headers IP + Couche de liaison.
8. Ré-assemblage des paquets
9. Acquittement des paquets : La machine de destination envoie une sorte d'accusé de réception à la machine expéditrice.
10. Retransmission des paquets en cas d'erreur : Si la machine expéditrice ne reçoit pas l'accusé, alors les paquets sont considérés comme perdus et retransmis.
11. Transmission des données à l'app destinataire
12. Fermeture de la connexion.

## Le protocole UDP

Le protocole UDP, pour *__User Datagram Protocol__* permet de transmettre des données de manière plus simplifiée. Seule l'intégrité des messages
est garantie, donc pas de garantie pour l'ordre ni pour la bonne réception des paquets. Ce protocole ne nécessite pas de connexion.

## Les sockets

Un socket est un mécanisme de connexion bi-directionnel entre deux processus. C'est un point d'entrée qui permet au processus d'envoyer et
de recevoir des messages venants ou vers d'autres processus.

## Le protocole HTTP

Le protocole HTTP est un protocole client/serveur. Une requête HTTP se décompose comme suit : 

- La *__request line__* : contient trois informations principales : la méthode employée (`GET` ou `POST`), l'identifiant de la ressource requêtée et la version HTTP utilisée.
- Les *headers* : au format clé/valeur, cela permet de contrôler plusieurs choses comme par exemple l'authentification, les CORS, la mise en cache, le contenu...
- Le *body*

La réponse HTTP a une structure similaire à la requête à quelques détails près : 

- La ligne réponse : contient le code statut et le message correspondant, par exemple `200 OK`. Pour connaître leur signification, voir [liste](https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP#Codes_d'%C3%A9tat)
- Les headers : il existe des headers spécifiques à une réponse 

### Response headers

Parmi les response headers les plus répandus, on trouve : 

- `Access-Control-Allow-Origin` : permet au serveur de contrôler quel agent a accès à la ressource. Si `*` alors tous les agents ont accès 
à la ressource
- `Connection: Keep Alive` permet de garder la connexion TCP ouverte après la requête (HTTP1 et 2 uniquement)
- `Content-length` : précise le nombre d'octets de la réponse
- `Content-Encoding` : précise à l'utilisateur avec quel outil le corps a été compressé.
- `Content-type` : précise à l'utilisateur le type de réponse retourné (par ex `text/html` pour du HTML). Il existe 5 grand types : `application`, `text`, `image`, `audio` et `video` et beaucoup de sous-types associés.

## Le protocole HTTPS

Le protocole HTTPS (__HyperText Transfer Protocole Secure__) est la combinaison du protocole HTTP avec un protocole de chiffrement SSL
(__Secure Sockets Layer__) ou TLS (__Transport Layer Security__). Ce protocole permet au navigateur client de vérifier l'identité de la 
ressource auquel il accède grâce à un certificat d'authentification émis par un organisme réputé fiable. Les étapes : 

1. Le client demande une connexion sécurisée au serveur en utilisant le protocole HTTPS sur le port 443 dédié.
2. Le serveur confirme la gestion du protocole et renvoie le certificat. Ce certificat garantit l'identité du serveur par rapport à son domaine.
3. Le navigateur vérifie le certificat auprès de son autorité émettrice
4. Le navigateur génère une clé de session et la chiffre avec la clé publique contenue dans le certificat et l'envoie au serveur
5. Le serveur déchiffre la clé de session avec sa clé privée. La clé de session peut désormais être utilisée pour le chiffrement asymétrique
des données entre le client et le serveur

## Le protocole DNS

Le protocole DNS permet de faire correspondre un nom de domaine avec une adresse IP. Lorqu'on tape un URL dans le navigateur, ce dernier envoie
une requête DNS à un serveur de noms de domaine qui lui renvoie l'adresse IP correspondante. Ces informations sont stockées dans le cache DNS
dans le but d'accélérer les requêtes futures vers la même ressource. Une résolution DNS se passe comme suit : 

1. Requête initiale : Le client entre l'URL dans le navigateur
2. Cache du navigateur : Le navigateur vérifie si l'URL entrée n'a pas d'IP associée dans son cache
3. Cache de l'OS : Le navigateur demande ensuite au cache du système d'exploitation
4. Requête au serveur DNS : Si le cache ne contient pas l'IP recherchée, le navigateur envoie une requête au serveur DNS résolveur pour obtenir l'IP
5. Serveur DNS racine : Si le DNS résolveur ne contient pas l'IP, il forwarde la requête au serveur de niveau supérieur. Le serveur racine va par la suite indiquer quel serveur DNS contient l'IP en fonction du domaine ( par ex `.fr`)
6. Serveur DNS supérieur : Le résolveur interroge le serveur approprié, qui lui indique le serveur faisant autorité pour le domaine consulté.
7. Serveur faisant autorité : le résolveur requête le DNS faisant autorité et ce dernier lui renvoie la bonne adresse IP
8. Mise en cache de l'IP