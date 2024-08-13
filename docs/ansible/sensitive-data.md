---
sidebar_position: 11
---

# Gestion des données sensibles

## Ansible-Vault

Ansible-Vault est un outil qui permet de chiffrer les données sensibles telles que les clés ou les mots de passes.

### Création d'un vault

```shell
ansible-vault create vars/my-secrets.yml
```

> On vous demandera un mot de passe pour le chiffrement

### Edition

```shell
ansible-vault edit vars/my-secrets.yml
```

### Chiffrement

```shell
ansible-vault encrypt vars/my-secrets.yml
```

### Déchiffrement

```shell
ansible-vault decrypt vars/my-secrets.yml
```

### Utilisation dans un play

```yaml
- hosts: web
  become: yes
  vars_files:
    - vars/main.yml
    - vars/my-secrets.yml
  roles:
    - web

- hosts: db
  become: yes
  vars_files:
    - vars/main.yml
    - vars/my-secrets.yml
  roles:
    - database
```

Ensuite, pour exécuter le play en rentrant le mot de passe du Vault : 

```shell
ansible-playbook playbook.yml --ask-vault-pass
```

## Les templates

Les templates permettent de charger dynamiquement une config de projet en fonction de variables

### Variables

Les variables s'utilisent avec la syntaxe `{{ variable }}`

```
server_name {{ server_name }};
```

### Conditions

Les conditions débutent pas `{% if %}` et se ferment avec `{% endif %}` : 

```
{% if enable_ssl %}
server {
    listen 443 ssl;
    ssl_certificate /etc/ssl/certs/{{ ssl_cert }};
    ssl_certificate_key /etc/ssl/private/{{ ssl_key }};
}
{% endif %}
```

### Filtres

```
server_name {{ server_name | upper }};
```

### Inclusion de templates

```
{% include 'common_settings.j2' %}
```

## Les handlers

Les handlers sont des tâches spécifiques qui ne s'exécutent que si elles sont triggered par une autre tâche

### Utilisation

```yaml
---
- name: Configuration d'un serveur web
  hosts: webservers
  become: yes

  tasks:
    - name: Copier le fichier de configuration NGINX
      copy:
        src: /path/to/nginx.conf
        dest: /etc/nginx/nginx.conf
      notify:
        - Redémarrer NGINX

  handlers:
    - name: Redémarrer NGINX
      service:
        name: nginx
        state: restarted
```

Ici, à chaque fois que le fichier de config de NGinx sera copié, le handler `Redémarrer NGINX`, défini dans le namespace `handlers`, est triggered
par le keyword `notify`.

### Forcer l'exécution

On peut forcer l'exécution des handlers avec `meta: flush_handlers` : 

```yaml
tasks:
  - name: Exécuter les handlers
    meta: flush_handlers
```