---
sidebar_position: 5
---

# Les process Linux

## Basics

Un processus est une instance de programme chargé en RAM qui s'éxécute sur la stack (Pile d'instructions exécutées par le CPU). Chaque processus est géré par le système d'exploitation. 
Quand on lance une commande, on lance un programme, ce qui créé un processus

Un programme est constitué d'instruction et de données, il est stocké sur le disque dur

Le système d'éxploitation enregistre un certain nombre de données sur chaque process : 

- Le _Process ID_ (`PID`) : ID du process en cours

- Le _Parent Process ID_ (`PPID`) : Le PID du process qui a créé le process en cours

- Le _User ID_ (`UID`) : ID de l'utilisateur qui a lancé le process

- Le `TTY` : Terminal à partir duquel le process en cours a été créé

- Le _Start Time_ (`STIME`) : Timestamp créé au démarrage du process en cours

- Le `TIME` : Temps depuis lequel le process utilise le CPU

- Le `CMD` : programme exécuté par le process

## La commande ps

La commande `ps` permet d'afficher tous les process en cours, plus précisément un snapshot de ces process, avec les informations suivantes : 

- Le PID
- Le TTY
- Le TIME
- Le CMD

### Options

La commande met à disposition beaucoup d'options : 

- `-a` permet d'afficher tous les process sauf les meneurs de session et ceux qui ne sont pas associés à un terminal
- `-e` permet d'afficher tous les process
- `-f` permet d'afficher les process dans le format complet.
- `-F` permet d'afficher dans le format étendu
- `-l` permet d'afficher dans le format long
- `-u` permet d'afficher tous les process liés à un user
- `-C` permet d'afficher tous les process liés à la commande spécifiée
- `-M` permet d'ajouter une colonne pour les infos de sécurité
- `-H` permet d'afficher les process triés par arborescence
- 

### Etats d'un process

- `D` ou `I` : process en sommeil non interruptible.

- `R` : process dans la file d'exécution.

- `S` : process en sommeil interruptible.

- `T` : process arrêté.

- `X` : process tué.

- `Z` : process zombie (terminé mais non détruit par son parent).

- `<` : process en haute priorité.

- `N` : process en basse priorité.

- `L` : pages verrouillées en mémoire.

- `s` : process meneur de session.

- `|` : process qui possède plusieurs autres process (multi-thread).

- `+` : process dans le groupe de processus au premier plan.

## Envoi de signal à un process

### La commande kill

La commande `kill` permet d'envoyer un signal `<SIGNAL>` au process spécifié via son PID `<PID>`

```shell
kill <SIGNAL> <PID>
```

> L'option `-l` permet d'afficher tous les signaux disponibles
> 
> ```shell
> kill -l
> ```

### La commande pidof

Pour trouver le PID du process à viser, on peut utiliser la commande `pidof` : 

```shell
pidof <PROCESS_NAME>
```

### La commande killall

La commande `killall` permet d'envoyer un signal à tous les process ayant été lancés avec la commande spécifiée

```shell
killall <CMD>
```

## Backgrounds tasks

### Utilisation

Pour lancer un process en arrière-plan, on utilise le caractère `&` : 

```shell
<CMD> &
```

### Listing

Pour lister les process en arrière-plan : 

```shell
jobs -l
```

## Les daemons

Un daemon (ou service) est une unité qui permet de faire tourner des programmes en arrière-plan

### Listing

Pour lister toutes les unités : 

```shell
systemctl list-units --all
```

Pour lister touts les services :

```shell
systemctl list-units --all --type=service
```

### Gestion

#### Status

```shell
sudo systemctl status <SERVICE_NAME>
```

#### Arrêt

```shell
sudo systemctl stop <SERVICE_NAME>
```

#### Redémarrage

```shell
sudo systemctl restart <SERVICE_NAME>
```

#### Recharger la config

```shell
sudo systemctl reload <SERVICE_NAME>
```

#### Activation

```shell
sudo systemctl enable <SERVICE_NAME>
```

#### Désactivation

```shell
sudo systemctl disable <SERVICE_NAME>
```

#### Logs

```shell
sudo journalctl -u <SERVICE_NAME>
```

### Configuration

#### Editer la config

Dans un premier temps, on va afficher la configuration du service

```shell
sudo systemctl cat <SERVICE_NAME>
```

Ensuite, pour modifier la config : 

```shell
sudo systemctl edit <SERVICE_NAME>
```

Une fois que le fichier est édité, il faut mettre à jour systemd : 

```shell
sudo systemctl daemon-reload
```

#### Partie unit de la config

La partie unit d'un fichier de config contient les informations suivantes : 

- `Description`
- `Documentation` : contient les liens vers la doc du service
- `Before` permet de spécifier que l'unité doit être démarrée avant les autres spécifiées 
- `After` permet de spécifier des pré-requis pour le service
- `Wants` permet de spécifier des dépendances vis-à-vis d'autres unités
- `Require` permet de spécifier des dépendances fortes
- `Requisite` permet de spécifier des dépendances encore plus fortes. Si une unité parmi les dépendances n'est pas démarrée, le service ne se lance pas
- `BindsTo` combine les effets de `Require` et `Requisite`

#### Partie service de la config

Parmi les infos de cette partie : 

- `simple` : le service lance un process principal
- `forking` signifie que le process lance un process parent qui va créer un fils au moment de son lancement
- `oneshot` signifie que systemd attend la fin de ce process avant de continuer ses traitements
- `ExecStart` : commande à lancer lors du démarrage du service
- `ExecStop` : commande à éxecuter lors de l'arrêt du service
- `Restart` : indique quand le service doit être redémarré