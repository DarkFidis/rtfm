---
sidebar_position: 4
---

# Playbooks

## Structure de base

Un playbook se compose d'un ou plusieurs plays qui seront exécutés dans l'ordre.

```yaml
---
- name: <PLAYBOOK_1_NAME>
  hosts: <HOST_1>
  tasks:
    - name: <TASK_1_NAME>
      <MODULE_TASK_1_NAME>:
        param1: arg1

    - name: <TASK_2_NAME>
      <MODULE_TASK_2_NAME>:
        param2: arg2

- name: <PLAYBOOK_2_NAME>
  hosts: <HOST_2>
  tasks:
    - name: <TASK_3_NAME>
      <MODULE_TASK_3_NAME>:
        param3: arg3

    - name: <TASK_4_NAME>
      <MODULE_TASK_4_NAME>:
        param4: arg4
```

## Lancement

```shell
ansible-playbook my_playbook.yml
```

avec un inventaire : 

```shell
ansible-playbook -i my_inventory/{my_env} my_playbook.yml 
```

## Options de configuration

### Gestion des users et privilèges

- `remote_user` : spécifie le user avec lequel on se connecte
- `become` : active les privilèges sudo
- `become_method` : spécifie la méthode pour l'escalade de privilèges (`sudo`, `su`)
- `become_user` : spécifie le user cible lors de l'escalade
- `become_password` : spécifie le password pour l'escalade

### Connexion et exécution

- `connection` spécifie le type de connection utilisé (ssh ou autre)
- `gather_facts` contrôle la collecte de logs système au debut du play
- `strategy` définit la stratégie d'éxecution (`linear` ou `free`)
- `order` permet de contrôler l'ordre de traitement des hosts

### Variables et environnement

- `env` : namespace dans lequel on définit les variables d'environnement
- `vars` : namespace dans lequel on définit les variables pour le play

### Organisation des tâches

- `tasks` : tâches principales à exécuter
- `pre_tasks` : tâches à exécuter avant les tâches principales
- `post_tasks` : tâches à exécuter après les tâches principales
- `handlers` : tâches déclenchées par les notifs d'autres tâches

### Filtrage et séléction

- `tags` : tags sur les tâches pour permettre des séléctions
- `hosts`

## CLI ansible-playbook

```shell
ansible-playbook <OPTIONS> my-playbook.yml
```

### Options de base

- `-i` pour spécifier l'inventaire
- `-l` pour limiter les hosts au sous-groupe spécifié
- `-t` permet d'éxecuter uniquement les tâches ayant le tag passé en argument
- `--skip-tags` est l'inverse de `-t`, il ignore les tâches concernées
- `-C` exécute le playbook en mode check

### Gestion des users

- `-b` permet d'utiliser l'escalade de privilèges
- `--become-method` spécifie la méthode d'escalade (`sudo` ou `su`)
- `--become-user` spécifie le user avec lequel on lance les tâches
- `-K` demande le password pour l'escalade

### Options d'éxecution

- `--start-at-task` spécifie la tâche ou le playbook doit démarrer
- `--step` permet d'exécuter le playbook step-by-step
- `--list-tasks` liste toutes les tâches du playbook sans les lancer

### Options de connexion

- `-u` spécifie le user pour la connexion
- `-k` permet de demander le password pour la connexion aux hôtes
- `--private-key` permet de spécifier une clé privée SSH pour la connexion
- `-c` définit le type de connexion

### Autres

- `-e` permet de spécifier une variable externe au playbook
- `-v` active le mode verbose
- `--syntax-check` permet de valider la syntaxe du playbook

## ansible-lint

Ansible Lint est un CLI qui permet de vérifier les playbooks

### Installation

```shell
pip install ansible-lint
```

### Utilisation

```shell
ansible-lint playbooks/
```
