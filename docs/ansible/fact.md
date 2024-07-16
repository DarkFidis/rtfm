---
sidebar_position: 6
---

# Facts & Variables

## Facts

Les facts désignent les données qu'Ansible collecte automatiquement sur les nodes managées, avec le module `setup`. Les données sont stockées
dans la variable `ansible_facts` disponible dans le playbook. Ce comportement par défaut, exécuté au début de chaque play, peut être désactivé avec `gather_facts: false`

### Facts custom

Avec Ansible, on a la possibilité d'ajouter des facts personnalisés qui permettent d'élargir la collecte par le module `setup`

### Le module set_fact

Le module Ansible `set_fact` permet de créer dynamiquement des variables au niveau du host pendant l'exécution d'un play

```yaml
- name: Créer des listes et des dictionnaires
  ansible.builtin.set_fact:
    une_liste: [element1, element2]
    un_dictionnaire:
      cle: valeur
      autre_cle: autre_valeur
```

## register

Dans Ansible, le namespace `register` sert à stocker la sortie d'une task en lui spécifiant un nom de variable dans lequel il stockera les données.

```yaml
- name: Exemple register
  hosts: all
  tasks:
    - name: Get current date and time
      ansible.builtin.command: date
      register: current_date
```

On pourra éventuellement afficher la sortie avec le module `debug` en lui spécifiant la variable `current_date`

## Le module vars_prompt

Le module `vars_prompt` permet de demander des valeurs à l'utilisateur au début de l'exécution du play

```yaml
- hosts: localhost
  vars_prompt:
    - name: username
      prompt: "Quel est votre nom d'utilisateur ?"
      private: false  # Le nom d'utilisateur est affiché pendant la saisie

    - name: password
      prompt: "Quel est votre mot de passe ?"
      private: true   # Le mot de passe est masqué pendant la saisie

  tasks:
    - name: Afficher un message
      ansible.builtin.debug:
        msg: "Connexion en tant que {{ username }}"
```

### Options

- `name` : Nom de la variable ou stocker l'info
- `prompt` : Question à afficher à l'utilisateur
- `private` : Masque ou non la valeur entrée
- `default` : spécifie une valeur par défaut
- `confirm` : demande une confirmation à l'utilisateur ou pas
- `encrypt` : permet de spécifier un algo pour encrypter les données (par ex `sha512_script`)
- `salt_size` : nombre de salts

Exemple de task pour créer un user : 

```yaml
---
- hosts: all
  vars_prompt:
    - name: user_password
      prompt: "Entrez le mot de passe de l'utilisateur"
      private: true
      encrypt: sha512_crypt
      confirm: true
      salt_size: 7

  tasks:
    - name: Créer un nouvel utilisateur avec le mot de passe haché
      ansible.builtin.user:
        name: "nouvelutilisateur"
        password: "{{ user_password }}"
        state: present
```

## Variables magiques

Ansible met à disposition des variables natives, appelées variables magiques. Parmi les plus connues, on trouve : 

- `hostvars` accède aux variables de tous les hosts
- `groups` contient la liste de tous les groupes et hosts de l'inventaire
- `group_names` contient la liste de groupes auxquels le host appartient
- `inventory_hostname` : nom du host tel que configuré dans l'inventaire

Et quelques autres utiles : 

- `ansible_play_hosts` liste tous les hosts actifs dans le play courant
- `ansible_play_batch` liste des hosts dans le batch courant du play
- `inventory_dir` : chemin du dossier de l'inventaire
- `inventory_file` : chemin complet de l'inventaire
- `playbook_dir` : repertoire du play
- `ansible_check_mode` indique si le play est joué en mode check ou non

[Liste complète](https://docs.ansible.com/ansible/latest/reference_appendices/special_variables.html)

