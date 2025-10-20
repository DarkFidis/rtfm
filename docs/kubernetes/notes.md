---
sidebar_position: 10
---


# Notes

## Installation

### Linux

1. Download du package

```shell
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
```

2. Validation du package

```shell
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"
echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check
# kubectl: OK
```

3. Installation du package

```shell
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

## OpenLens

### Installation

> TODO

### Extension pour les logs

Pour accéder aux logs des Pods, installer l'extension suivante : 

```shell
@alebcay/openlens-node-pod-menu
```