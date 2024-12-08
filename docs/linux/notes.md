---
sidebar_position: 11
---

# Notes

## Réseau

### IP

#### Avoir son IP

Pour avoir son IP, lancer la commande : 

```shell
hostname -I
```

## Logs

Accès aux logs de Linux : 

```shell
dmesg
```

ou bien

```shell
journalctl
```

## Environnement

Lister ses variables d'environnement : 

```shell
env | sort | less
```

## Recherche de port

```shell
netstat -nl | grep <PORT> 
```

## Remplacement du binaire pour une commande

```shell
sudo update-alternatives --install <OLD_BIN_PATH> <CMD> <NEW_BIN_PATH> 1 
```

Exemple : Utiliser Python 3.6 dans la commande `python` : 

```shell
sudo update-alternatives --install /usr/bin/python python /usr/bin/python3.6 1
```

## Application d'un script sur un serveur distant

```shell
ssh -T <HOSTNAME> bash < monscript.sh
```

## Recherche des process Node

```shell
ps ef | grep node
```

Ensuite pour les kill : 

```shell
kill -9 <PID>
```