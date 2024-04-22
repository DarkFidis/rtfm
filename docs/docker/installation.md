---
sidebar_position: 1
---

# Installation

## Ubuntu

### Avec Docker Desktop

Si vous souhaitez installer Docker avec l'application Desktop, suivre [ce lien](https://docs.docker.com/desktop/install/linux-install/)

### Sans Docker Desktop

Suivre les étapes suivantes : 

1) Mettre à jour la liste de paquets disponibles (`sudo apt-get update`)

> Assurez vous d'avoir les packages `ca-certificates`, `curl` et `gnupg` sur votre distribution.

2) Ajouter la clé GPG de Docker : 

```shell
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

> La clé GPG permet de sécuriser l'installation en garantissant l'authenticité, l'integralité et la confidentialité des packages lors de leur
> installation. Cela permet également de chiffrer la transmission de ces derniers.

3) Ajouter le repertoire officiel de Docker dans la liste des sources de packages : 

```shell
echo "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu   "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" |   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

4) Installer les dernières versions : 

```shell
sudo apt-get update && sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

5) Vérifier l'installation de Docker

Pour vérifier l'installation de Docker, on va lancer un Hello world : 

```shell
sudo docker run hello-world
```