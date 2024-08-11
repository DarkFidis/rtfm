---
sidebar_position: 10
---

# Structure des playbooks

## Les roles

Les rôles permettent de structurer les playbooks en modules, ce qui permet notamment de factoriser les tasks, les variables et handlers.

### Ansible-Galaxy

Ansible-Galaxy est une plateforme de mise à disposition des rôles et collections Ansible, on pourrait le définir comme un Ansible-Hub. Elle
s'utilise en ligne de commande comme suit : 

```shell
ansible-galaxy install ROLE
```

La liste des rôles est consultable [ici](https://galaxy.ansible.com/ui/standalone/roles/?page=1&page_size=10&sort=-download_count)

### Utilisation

```yaml
---
- hosts: webservers
  roles:
    - common
    - webservers
```

### Dépendances

```yaml
# roles/myapp/meta/main.yml
---
dependencies:
  - role: common
    vars:
      une_var: 1
  - role: nginx
    vars:
      nginx_port: 80
  - role: postgres
    vars:
      dbname: blarg
      autre_var: 42
```

### Exemple

Pour utiliser des rôles, on va utiliser l'arborescence suivante : 

```
roles/
    common/
        tasks/
            main.yml
        handlers/
            main.yml
        files/
        templates/
        vars/
            main.yml
        defaults/
            main.yml
        meta/
            main.yml
    webserver/
        tasks/
            main.yml
        handlers/
            main.yml
        files/
        templates/
        vars/
            main.yml
        defaults/
            main.yml
        meta/
            main.yml
    database/
        tasks/
            main.yml
        handlers/
            main.yml
        files/
        templates/
        vars/
            main.yml
        defaults/
            main.yml
        meta/
            main.yml
```

Les fichiers de rôles comme `roles/common/tasks/main.yml` pourraient ressembler à ça : 

```yaml
- name: Mettre à jour les paquets APT
  apt:
    update_cache: yes

- name: Installer des outils communs
  apt:
    name:
      - curl
      - vim
    state: present
```

Enfin, dans le playbook, on les utilise : 

```yaml
---
- hosts: all
  roles:
    - common

- hosts: webservers
  roles:
    - webserver

- hosts: dbservers
  roles:
    - database
```

## Include & Import

Les mots clés `include`  et `import` permettent d'importer des plays, des tasks ou des rôles. Elles ont toutefois des différences : 

- Avec `import`, toutes les instructions importées sont pré-traitées au moment ou le playbook est analysé
- Avec `include`, toutes les instructions sont traitées au-fur et à mesure de leur rencontre pendant l'éxecution du play.

> Les `import` sont purement statiques tandis que les `include` sont dynamiques.

### Import de play

```yaml
# master_playbook.yml
- import_playbook: configuration_webservers.yml
- import_playbook: configuration_databases.yml
- import_playbook: configuration_loadbalancers.yml
```

### Import de tasks

```yaml
# common_tasks.yml
- name: Installer les dépendances
  package:
    name:
      - curl
      - git
    state: present

- name: Créer un utilisateur d'application
  user:
    name: appuser
    state: present

# main_playbook.yml
- hosts: all
  tasks:
    - import_tasks: common_tasks.yml
```

On peut aussi transmettre des variables dans les imports : 

```yaml
# deploy_app.yml
- name: Déployer l'application
  git:
    repo: 'https://github.com/example/repo.git'
    dest: /var/www/myapp
    version: "{{ app_version }}"

# main_playbook.yml
- hosts: webservers
  tasks:
    - import_tasks: deploy_app.yml
      vars:
        app_version: v1.0.0

    - import_tasks: deploy_app.yml
      vars:
        app_version: v1.1.0
```

### Import de rôles

```yaml
- hosts: webservers
  tasks:
    - import_role:
        name: common
    - import_role:
        name: webserver
```

### Include de tasks

Avec variable : 

```yaml
# create_user.yml
- name: Créer un utilisateur
  user:
    name: "{{ user_name }}"
    state: present

# main_playbook.yml
- hosts: all
  tasks:
    - include_tasks: create_user.yml
      vars:
        user_name: jean

    - include_tasks: create_user.yml
      vars:
        user_name: julie
```

En utilisant une boucle (`loop`) : 

```yaml
# install_packages.yml
- name: Installer un package
  apt:
    name: "{{ item }}"
    state: present

# main_playbook.yml
- hosts: all
  tasks:
    - name: Inclure dynamiquement des tâches avec une boucle
      include_tasks: install_packages.yml
      loop:
        - git
        - curl
        - htop
```

### Include de rôles

```yaml
# main_playbook.yml
- hosts: webservers
  tasks:
    - include_role:
        name: common

    - include_role:
        name: webserver
```

### Include variables

```yaml
# vars/prod.yml
app_environment: production
db_host: prod-db.example.com

# vars/dev.yml
app_environment: development
db_host: dev-db.example.com

# main_playbook.yml
- hosts: all
  tasks:
    - include_vars: "vars/{{ ansible_environment }}.yml"
```

## Include vs Import

### Include

**Avantages**

- Boucles : on peut éxecuter une task pour chaque item défini dans un loop
- Dynamique : Contrairement à `import`, `include` permet de s'adapter au contexte du play.

**Inconvénients**

- Visibilité : Les tags et les tâches internes aux includes ne s'afficheront pas dans la sortie de `--list-tags` ou de `--list-tasks`
- Notification : On ne pourra pas utiliser `notify` pour trigger un handler dont le nom vient d'un include dynamique
- Debug : `--start-at-task` ne peut pas start à une task située à l'intérieur de l'include.

### Import

**Avantages**

- Prévisibilité : Etant donné que toutes les tasks sont pré-traitées, le debug est plus simple

**Inconvénients**

- Boucles : On ne peut pas utiliser de boucles
- Variables : Les variables d'inventaires ne peuvent pas être utilisées.

## Les tags

Les tags permettent de filter les tasks en fonction de la valaur du tag. Cela permet d'exécuter une partie spécifique du play, utile quand 
ce dernier est volumineux. Les tags sont, le plus souvent, utilisés avec des tasks : 

```yaml
tasks:
- name: Installer des paquets nécessaires
  yum:
    name:
      - nginx
      - memcached
    state: present
  tags:
  - packages

- name: Configurer NGINX
  copy:
    src: /path/to/nginx.conf
    dest: /etc/nginx/nginx.conf
  tags:
  - configuration
```

### Utilisation

Pour éxecuter les tasks avec le tag `my_tag` : 

```shell
ansible-playbook mon_playbook.yml --tags "my_tag"
```

Pour exclure les tasks avec le tag `my_tag` : 

```shell
ansible-playbook mon_playbook.yml --skip-tags "my_tag"
```

Il existe aussi des keywords spéciaux : 

- `tagged`
- `untagged`
- `all`

qu'on utilise comme suit : 

```shell
ansible-playbook mon_playbook.yml --tags tagged
```

### Tags spéciaux

Il existe deux tags spéciaux : 

- `always` : la task s'exécute toujours
- `never` : la task s'exécute jamais