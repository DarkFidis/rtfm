---
sidebar_position: 2
---

# Basics

## Notions de base

### Nodes

Dans Ansible, on distingue deux types de nodes : 

- Le *__control node__* qui désigne la machine à partir duquel on lancera les taĉhes
- Les *__managed nodes__* qui désignent les serveurs sur lesquels les taĉhes seront exécutées

### Inventaire

Un inventaire est le fichier contenant tous les nodes managés que le control node devra gérer. Exemple : 


```shell
[web]
192.168.1.1
192.168.1.2

[db]
192.168.1.3
```

Dans un inventaire, on peut organiser les nodes managés en groupes (`groups`), ce qui nous permet de cibler des nodes en particulier quand on
lance le playbook.

### Modules

Les modules Ansible éxecutent les tâches sur les nodes managés. Ces derniers peuvent prendre des arguments et renvoient des infos en JSON au
node de contrôle. 

[Liste des modules](https://docs.ansible.com/ansible/2.9/modules/list_of_all_modules.html)

### Tasks

Les tasks sont des actions qu'Ansible va exécuter sur les nodes managés. Chaque task utilise un module et lui passe des arguments. Exemple : 

```yaml
- name: copier le fichier de configuration
  copy:
    src: /local/nginx.conf
    dest: /etc/nginx/nginx.conf
```

Une task dispose d'un nom (`name`), d'un module et de ses arguments.

### Les rôles

Les rôles permettent de regrouper et d'organiser des variables ou des tasks de façon à factoriser ces derniers si besoin. Par exemple, un role
`docker` qui permettrait de déployer un projet avec Docker et qu'on pourrait utiliser dans une task comme suit : 

```yaml
- name: docker deploy
  hosts: web
  roles:
    - docker
```

### Playbooks

Les playbooks sont des fichiers qui déterminent les tasks à lancer et dans quel ordre


## Ansible CLI

### Principales options

Le CLI d'Ansible propose les options suivantes : 

- `-i` permet de spécifier l'inventaire à utiliser dans la commande
- `-m` permet de spécifier le module à utiliser dans la commande
- `-a` permet de spécifier les arguments du module
- `-u` permet de spécifier le user pour la connexion SSH à la node managée
- `-b` donne les privilèges admin pour la commande sur la node managée

### Commandes utiles

#### Version

```shell
ansible --version
```

#### Test de connectivité

```shell
ansible all -i inventory.yaml -m ping
```

#### Lancer une commande shell

Pour lancer une commande shell sur les node managées : 

```shell
ansible all -i inventory.yaml -m shell -a "<CMD>"
```

#### Mise à jour des packages

```shell
ansible all -i inventory.yaml -m apt -a "update_cache=yes" --become
```

#### Restart un service

```shell
ansible all -i inventory.yaml -m service -a "name=<NOM_SERVICE> state=restarted" --become
```

#### Arrêter un service

```shell
ansible all -i inventory.yaml -m service -a "name=<NOM_SERVICE> state=stopped" --become
```

#### Afficher des faits sur les hôtes

```shell
ansible all -i inventory.yaml -m setup
```