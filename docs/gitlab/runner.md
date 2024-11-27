---
sidebar_position: 4
---

# Runners

Les runners GitLab sont chargés d'éxecuter les jobs des pipelines. 

## Intro

Il existe trois types de runners : 

- *Shared runners* : Runners fournis par GitLab. Selon le plan que l'on aura choisi, on aura un temps limité d'utilisation.
- *Specific runners* : Runners enregistrés pour un projet en particulier, souvent parce qu'il y a des contraintes d'OS ou de matériel.
- *Group runners* : Runners enregistrés pour un groupe de projets.

### Caractéristiques

- *Langage* : On peut éxecuter des scripts dans quasi tous les langages.
- *OS* : Un runner peut tourner sur Windows ou MacOS, mais Linux est recommandé.
- *Virtualisation* : Les runners peuvent tourner sur un conteneur Docker, des VMs ou directement sur la machine hôte (peu recommandé)
- *Scalabilité* : On peut enregistrer autant de runners que l'on veut et les organiser avec Kubernetes par exemple.
- *Tags* : Les tags permettent d'orienter le choix du runner pour un job aux caractéristiques spécifiques.
- *Gestion des ressources* : On peut très bien limiter les ressources allouées au runners pour éviter des surcharges.

### Enregistrement

Après avoir installé un runner, il faut l'enregistrer, c-à-d faire le lien entre ce dernier et l'instance GitLab dans lequel les jobs sont définis.

Un *__exécuteur__* détermine l'environnement dans lequel chaque job tourne. Si par exemple le script du job utilise du shell, on utilisera un
runner avec un exécuteur de type `shell`. Les types d'exécuteurs disponibles sont : 

- *Custom* : permet de définir sa propre logique d'exécution.
- *Docker* : exécute le job dans un conteneur isolé
- *Docker Autoscaler* : comme le type Docker avec en plus la capacité de scaling en fonction de la charge de travail.
- *Docker Machine*
- *Instance* : exécuteur en beta utilisant les instances de Cloud.
- *Kubernetes* : exécuteur pouvant tourner dans un cluster Kubernetes
- *Parallels* : exécuteur qui créé des VMs dédiées pour chaque job avec le logiciel Parallels
- *Shell*
- *SSH* : exécuteur pouvant se connecter en SSH à une machine distante.
- *VirtualBox* : similaire à Parallels mais utilise VirtualBox à la place.

## Installation

### Debian

```shell
curl -LJO "https://gitlab-runner-downloads.s3.amazonaws.com/latest/deb/gitlab-runner_amd64.deb"
```

puis

```shell
dpkg -i gitlab-runner_amd64.deb
```

### Enregistrement

Pour enregistrer un runner, il faut aller dans la section CI/CD d'un de nos projets : `<My_project>` > `Settings` > `CI/CD` > `Runners`

## Tags

Pour s'assurer que le bon runner exécute un job aux contraintes spécifiques, on utilise des tags. On les ajoute au runner et ce dernier sera éligible
à l'exécution de jobs ayant ce même tag dans sa clé `tags`

> Par défaut, un runner ne lancera que les jobs ayant des tags, ce comportement peut être modifié si on coche `Run untagged jobs` à la
> création du runner dans l'interface GitLab

Exemple : 

```yaml
my_job:
  tags:
    - backend
    - docker
  script:
    - echo "Running job"
```

Pour que ce job se lance, il faut qu'un runner avec les tags `backend` et `docker` soit disponible.