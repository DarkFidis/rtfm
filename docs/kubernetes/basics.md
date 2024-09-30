---
sidebar_position: 1
---

# Basics

## Architecture

Lorque l'on déploie une application avec Kubernetes, on obtient un cluster, c'est-à-dire un ensemble de noeuds (_nodes_) qui exécutent des 
applications conteneurisées gérées par Kube.

Un node est une machine physique sur lequel sont installés tous les logiciels dont Kube a besoin pour fonctionner. Dans un cluster, il en existe de
deux sortes : 

- Le noeud de contrôle (_control node_) est le node qui gère l'ensemble du cluster 

- Les noeuds de travail (_worker nodes_) sont les noeuds ou les différentes parties de l'application sont déployées. Dans chacun de ces noeuds tourne
au moins un *_Pod_*, à savoir un process qui contient un ou plusieurs conteneurs.

## Composants de contrôle

Kubernetes dispose de bon nombre de composants de contrôle du cluster : 

- `kube-apiserver` : Le serveur API de Kube qui permet à l'administrateur du cluster d'intéragir avec Kube
- `etcd` : base de données interne de Kube dans lequel sont stockées les infos du cluster.
- `kube-scheduler` : composant qui s'occupe de séléctionner les nodes pour les Pods nouvellement crées selon des paramètres de configuration.
- `kube-controller-manager` : composant qui regroupe les process distincts des autres composants de contrôle pour n'en faire qu'un seul.
- `cloud-controller-manager` : composant qui permet de faire le lien entre le cluster et l'API du fournisseur cloud (OVH, DigitalOcean, ...) et de séparer les composants du cloud des composants du cluster

## Composants de travail

Les composants de travail s'exécutent sur chaque worker node en maintenant l'exécution des Pods et l'accès à l'environnement Kube.

- `kubelet` : permet de s'assurer que les Pods sont en cours d'exécution et en bonne santé (healthcheck)
- `kube-proxy` : permet de maintenir des règles réseau dans le cluster pour communiquer avec ces derniers
- Container runtime : s'occupe de l'exécution des conteneurs.

## Minikube

Minikube est un outil permettant de tester le cluster Kube en local

### Installation Linux

```shell
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

Ensuite, définir Docker comme pilote par défaut : 

```shell
minikube config set driver docker
```

Une fois la config faite, lancer minikube : 

```shell
minikube start
```

### Dashboard

Pour avoir accès au dashboard de Minikube, il faut active l'add-on pour les métriques

```shell
minikube addons enable metrics-server
```

Pour lancer le dashboard : 

```shell
minikube dashboard
```