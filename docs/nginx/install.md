---
sidebar_position: 1
---

# Installation

## Linux

Installer les pré-requis

```shell
sudo apt install curl gnupg2 ca-certificates lsb-release ubuntu-keyring
```

Installer la clé officielle de NGINX

```shell
curl https://nginx.org/keys/nginx_signing.key | gpg --dearmor \
    | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null
```

Configuration du repertoire : 

```shell
echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] \
http://nginx.org/packages/ubuntu `lsb_release -cs` nginx" \
    | sudo tee /etc/apt/sources.list.d/nginx.list
```

Installation

```shell
sudo apt update && sudo apt install nginx
```

Vérification

```shell
sudo service nginx status
```

## MacOS

Installation

```shell
brew install nginx
```

Run

```shell
sudo nginx
```

## Docker

Lancement d'une image NGINX : 

```shell
docker run --name docker-nginx -p 80:80 nginx
```
