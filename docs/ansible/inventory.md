---
sidebar_position: 3
---

# Inventaires

## Structure de base

Un inventaire Ansible peut s'écrire sous le format YAML ou bien sous le format __INI__

Exemple YAML : 

```yaml
ungrouped:
  hosts:
    mail.example.com:
webservers:
  hosts:
    foo.example.com:
    bar.example.com:
dbservers:
  hosts:
    one.example.com:
    two.example.com:
    three.example.com:
```

La même chose en INI : 

```
mail.example.com

[webservers]
foo.example.com
bar.example.com

[dbservers]
one.example.com
two.example.com
three.example.com
```

## Groupes

Généralement, on groupe les différents serveurs selon leur fonction ou bien leur localisation (Europe, US, etc.). Pour créer des groupes, on fait comme suit : 

```yaml
<NOM_GROUPE>:
  hosts:
    serveur_1:
    serveur_2:
    serveur_3:
```

On peut aussi factoriser les URI des hosts si ceux ci ont un pattern commun avec des plages d'hôtes : 

```yaml
web:
  hosts:
    web[01:05].example.com:
```

Un inventaire se structure généralement de la manière suivante : 

```
inventaire/
│
├── production/                # Dossier pour l'environnement de production
│   ├── serveurs_web.yml       # Inventaire des serveurs web en production
│   ├── serveurs_bd.yml        # Inventaire des serveurs de base de données en production
│   └── group_vars/           # Variables spécifiques à l'environnement de production
│       ├── serveurs_web.yml   # Variables pour les serveurs web en production
│       └── serveurs_bd.yml    # Variables pour les serveurs de base de données en production
│
├── test/                      # Dossier pour l'environnement de test
    ├── serveurs_web.yml       # Inventaire des serveurs web en test
    ├── serveurs_bd.yml        # Inventaire des serveurs de base de données en test
    └── group_vars/           # Variables spécifiques à l'environnement de test
        ├── serveurs_web.yml   # Variables pour les serveurs web en test
        └── serveurs_bd.yml    # Variables pour les serveurs de base de données en test
```

## Variables

### Définition

```yaml
vars:
  <KEY>: <VALUE>
```

### Scopes

Les variables d'inventaires peuvent être définies sur plusieurs scopes différents : globalement, dans l'inventaire ou pour un groupe de nodes

#### Global

Pour définir des variables globalement, on les définit dans un fichier `group_vars/all.yml` par exemple

```yaml
# group_vars/all.yml
api_server: "https://restapi.fr"
```

Pour l'utiliser dans un inventaire : 

```yaml
- name: Afficher l'adresse de l'API
  hosts: localhost
  gather_facts: false

  tasks:
    - name: Afficher l'adresse du serveur API
      ansible.builtin.debug:
        msg: "L'adresse du serveur API est {{ api_server }}"
```

#### Par groupes

Pour définir des variables uniquement pour le groupe `my_group`, on les définit dans le fichier `group_vars/my_group.yml`

#### Par playbook

```yaml
- hosts: all
  vars:
    <KEY>: <VALUE>
  vars_files:
    - secrets.yml
    - more_vars.yml
  tasks:
    - debug:
        msg: "The secret is {{ secret_key }}"
```

> Le namespace `var_files` permet de charger des fichiers de variables externes

#### Variables d'hôtes

Les variables d'hôtes sont spécifiques à un hôte et sont définies dans le répertoire `host_vars` avec le nom de l'hôte en question.

## CLI ansible-inventory

### Options

- `--list` affiche l'inventaire sous forme de JSON
- `--graph` affiche un graphique de l'inventaire
- `--host` affiche toutes les variables associées à l'hôte passé en argument
- `-i` permet de spécifier l'inventaire
- `--yaml` affiche l'inventaire sous format YAML

## Les motifs

Les motifs, ou patterns Ansible, sont utiliser pour cibler des hôtes et/ou des groupes spécifiques lorsque l'on lance une commande.

### Utilisation

Dans une commande : 

```shell
ansible <MOTIF> -m <MODULE> -a "<MODULE_OPTIONS>"
```

Dans un playbook : 

```yaml
- name: <PLAYBOOK_NAME>
  hosts: <MOTIF>
```

### Motifs communs

Pour les hosts : 

- `all` ou `*` : Tous les hosts
- `my_host` : un seul host
- `hostA,hostB` ou `hostA:hostB` : plusieurs hosts

Pour les groupes : 

- `my_group` : un groupe
- `groupA:groupB` : plusieurs groupes
- `groupA:!groupB` : Exclusion d'un groupe
- `groupA:&groupB` : intersection de groupes

Position de groupe : 

```
my_group[0]       # Premier host du groupe my_group
my_group[-1]      # Dernier host du groupe my_group
my_group[0:2]     # Les trois premiers hosts du groupe my_group
```

On peut également utiliser des regexps : 

```yaml
hosts: ~(web|db).*\.example\.com
```