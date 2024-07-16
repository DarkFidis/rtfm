---
sidebar_position: 5
---

# Modules

## Fonctionnement

Voici en détail comment Ansible éxecute un module sur une node managée : 

1- Ansible se connecte en SSH au node

2- Ansible transfert le/les modules sur le répertoire temporaire de la node après les avoir compréssés.

3- Sur la node distante, Ansible décompresse le module puis les éxecute

4- Après l'exécution, Ansible supprime les fichiers temporaires

## Le module copy

```yaml
- name: Copier le fichier de configuration
  ansible.builtin.copy:
    src: /path/to/local/foo.conf
    dest: /path/to/remote/foo.conf
    owner: root
    group: root
    mode: '0644'
```

### Fonctionnalités principales

- Copie de fichiers/dossiers de la node principale vers la node managée
- Gestion des metadonnées (permission de fichiers et autres)
- Validation de fichiers

### Options

- `backup` crée une sauvegarde du fichier cible avant sa modification
- `checksum` permet de spécifier le checksum du fichier source afin de le valider
- `dest` (required) destination du fichier
- `directory_mode` permet de spécifier les permissions des repertoires crées lors d'une copie recursive
- `force` force la copie
- `group` spécifie le groupe owner du fichier
- `mode` spécifie les permissions du fichier à copier
- `owner` spécifie le owner du fichier
- `remote_src` détermine si oui ou non le fichier source est en local ou à distance
- `src` spécifie le chemin du fichier à copier
- `validate` permet de valider le fichier avant de le copier

## Le module file

Le module Ansible `file` sert à la gestion des fichiers

```yaml
- name: Changer la propriété, le groupe et les permissions d'un fichier
  ansible.builtin.file:
    path: /etc/foo.conf  # chemin vers le fichier
    owner: jean          # propriétaire du fichier
    group: jean           # groupe propriétaire du fichier
    mode: '0644'         # permissions du fichier
```

### Options

- `force` permet de forcer la création du fichier 
- `group` spécifie le groupe owner de/des fichiers
- `mode` spécifie les permissions de/des fichiers
- `owner` spécifie le owner de/des fichiers
- `path` spécifie le chemin du fichier cible
- `src` spécifie le chemin du fichier à lier
- `state` spécifie l'état souhaité du fichier parmi `absent` (pour la suppression), `directory`, `file`, `hard`, `link` et `touch`

## Le module command

Le module Ansible `command` permet de lancer des commandes sur la node managée

> Cela ne traite pas la commande comme dans le shell, les variables et les caractères shell ne seront pas interprétés.

### Options

- `cmd` spécifie la commande à lancer
- `argv` spécifie les arguments
- `chdir` spécifie le repertoire de la node managée ou lancer la commande
- `stdin` permet de définir l'entrée standard de la commande
- `stdin_add_newline` ajoute un retour à la ligne à l'entrée standard
- `strip_empty_ends` supprime les lignes vides de la fin de stdout et stderr

### Valeurs de retour

Quand une commande est exécutée, Ansible renvoie une série de valeurs : 

- `cmd` : nom de la commande
- `delta` : Temps d'exécution de la commande
- `end` : Heure de fin de la commande
- `msg` : indique si la commande a entraîné un changement ou non
- `rc` : retour de la commande (0 ou 1)
- `start` : Heure de début de la commande
- `stderr` : sortie d'erreur
- `stderr_lines` : sortie d'erreur serializée
- `stdout` : sortie standard
- `stdout_lines` : sortie standard serializée

## Le module shell

Le module Ansible `shell` permet d'exécuter des commandes shell sur les nodes managées

### Options

- `chdir` spécifie le repertoire de la node managée ou lancer la commande
- `cmd` spécifie la commande à lancer
- `stdin` permet de définir l'entrée standard de la commande

## Le module debug

Le module Ansible `debug` sert à afficher le contenu d'une variable à des fins de debug d'une task.

```yaml
- name: Exemple de debug
  hosts: localhost

  tasks:
    - name: Obtient les informations de fonctionnement
      ansible.builtin.shell: /usr/bin/uptime
      register: result

    - name: Affiche les informations de retour de la tâche précédente
      ansible.builtin.debug:
        var: result
```

### Options

- `msg` : Message custom à afficher
- `var` : Nom de la variable dont on souhaite afficher le contenu