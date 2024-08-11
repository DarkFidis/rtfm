---
sidebar_position: 9
---

# Gestion des taĉhes

## Tâches asynchrones

Par défaut, Ansible exécute les tâches de manière synchrone, maintenant la connexion au node managé jusqu'à la fin de la taĉhe. Par conséquent,
dans un playbook, chaque tâche bloque la suivante tant qu'elle n'est pas terminée. 

Dans Ansible, le _**polling**_ désigne le mécanisme avec lequel Ansible vérifie régulièrement l'état des tâches asynchrones à des intervalles définies 
par la variable `DEFAULT_POLL_INTERVAL`. Si cette variable est à `0` lorsqu'on exécute une tâche asynchrone, Ansible peut lancer d'autres tâches de manière concurrente.

### Utilisation via le CLI

Le polling se configure via le CLI avec deux options : 

- `-B` (`--background`) permet d'exécuter la tâche en arrière-plan et définir un timeout
- `-P` permet de spécifier l'intervalle de polling

```shell
ansible all -B 60 -P 10 -a "/bin/sleep 30" -i inventory.yml
```

### Utilisation dans un playbook

Dans un playbook, le polling se configure avec les namespaces `async` et `poll` : 

```yaml
- hosts: all

  tasks:
  - name: polling
    command: /bin/sleep 10
    async: 30
    poll: 5
```

> Ici, on simule une opération de 10 secondes, en spécifiant un timeout de 30 secondes et une intervalle de 5 secondes

## Stratégies d'éxecution

### Stratégie linéaire

La stratégie linéaire est la stratégie par défaut adoptée par Ansible. Elle a les caractéristiques suivantes : 

- **Exécution par tâche** : Ansible va exécuter une tâche sur tous les hosts du play avant de passer à la suivante
- **Ordre séquentiel** : Ansible va éxecuter les tâches en suivant leur ordre de définition dans le playbook.
- **Blocage des hosts** : C'est l'inconvénient de cette stratégie. Si jamais un host est plus lent à l'exécution de la tâche, cela va retarder la tâche suivante.

### Stratégie free

La stratégie free permet l'exécution des tâches le plus rapidement possible par lots. Ansible n'attendra pas que le host termine la tâche avant de
passer à la suivante, ce qui évite les problèmes de blocage si un host est lent.

Cependant, cela peut poser problème si il existe des inter-dépendances entre les tâches car celles-ci se termineront à des moments différents.
A noter également que l'ordre d'éxecution des tâches sera plus difficilement maîtrisable avec cette stratégie

Mise en oeuvre avec le namespace `strategy`: 

```yaml
- hosts: all
  strategy: ansible.builtin.free
  tasks:
    - name: Exécuter une commande simple
      command: hostname
    - name: Attendre 5 secondes
      command: sleep 5
    - name: Exécuter une autre commande
      ansible.builtin.command: uptime
```

### Stratégie de debug

La stratégie de debug permet de débogger un playbook en intéragissant au fur et à mesure avec les tâches

```yaml
- hosts: all
  strategy: debug
  tasks:
    - name: Exécuter une commande simple
      command: hostname
```

## Contrôle des ressources allouées 

### forks

On a la possibilité de fixer le nombre de forks utilisés par Ansible pour lancer les tâches dans le fichier de config `ansible.cfg` : 

```yaml
[defaults]
forks = 30
```

### Taille des livraisons

Si on souhaite limiter le nombre de nodes managés à gérer dans une tâche, on peut fixer ce nombre avec `serial` : 

```yaml
- name: test play
  hosts: webservers
  serial: 3
  gather_facts: False

  tasks:
    - name: première tâche
      command: hostname
    - name: deuxième tâche
      command: hostname
```

> La valeur de `serial` peut aussi bien être un entier ou bien un pourcentage (ex : `"30%"`)

### Limiter le nombre de workers

Pour limiter le nombre de workers pour une tâche, on utilise le namespace `throttle` : 

```yaml
tasks:
- command: /tache_cpu_intensive.py
  throttle: 1
```

### Ordre d'exécution des hosts

Le namespace `order` permet de spécifier un ordre d'exécution des hosts. Ses valeurs possibles sont : 

- `inventory` : ordre de définition dans l'inventaire
- `reverse_inventory` : ordre inverse de définiton
- `sorted` : ordre par nom
- `reverse_sorted` : ordre par nom inversé
- `shuffle` : ordre aléatoire

### Tâche à exécution unique

Pour exécuter une tâche une seule et unique fois dans un play, on utilise `run_once` : 

```yaml
---
# ...
  tasks:
    # ...
    - command: /une_tâche_à_exécuter_une_fois.py
      run_once: true
```

## Gestion des erreurs

Par défaut, Ansible stoppe le play à la première erreur rencontrée. Toutefois, on peut lui indiquer de continuer quand même dans certaines conditions : 

- `ignore_errors: true` permet d'ignorer l'erreur sur la tâche
- `ignore_unreachable: true` permet d'ignorer la tâche si le host visé est inaccessible
- `failed_when: "<MY_CONDITION>"` permet de définir une condition d'échec de la tâche
- `changed_when: "<MY_CONDITION>` permet de définir une condition de changement de la tâche
- `any_errors_fatal: true` permet de stopper tout le play si il y a une erreur sur un host.

Exemple d'utilisation : 

```yaml
- name: Gestion des services web et de base de données
  hosts: all
  become: yes
  tasks:
    - name: Mettre à jour les paquets APT
      apt:
        update_cache: yes

    - name: Installer NGINX sur les serveurs web
      apt:
        name: nginx
        state: latest
      when: "'webservers' in group_names"
      ignore_errors: true

    - name: Démarrer NGINX
      service:
        name: nginx
        state: started
      when: "'webservers' in group_names"

    - name: Vérifier l'accessibilité des serveurs web
      uri:
        url: http://localhost
        status_code: 200
      when: "'webservers' in group_names"
      register: web_status
      failed_when: web_status.status != 200

    - name: Vérifier l'état de PostgreSQL
      shell: pg_isready
      when: "'dbservers' in group_names"
      register: pgsql_status
      failed_when: pgsql_status.rc != 0
      changed_when: pgsql_status.rc == 0
```

## Les blocs

Un bloc sert à regrouper logiquement les tasks et permettre ainsi la gestion des erreurs de ces dernières.

### rescue

```yaml
- name: Exemple de bloc avec rescue
  hosts: all
  tasks:
  - name: Gérer les erreurs
    block:
      - name: Afficher un message
        debug:
          msg: "Je m'exécute normalement"

      - name: Forcer une erreur
        command: /bin/false

      - name: never
        debug:
          msg: "Je ne m'exécute jamais à cause de l'échec de la tâche précédente"
    rescue:
      - name: Afficher un message en cas d'erreur
        debug:
          msg: "J'ai capturé une erreur, je peux faire quelque chose pour la corriger"
```

Le namespace `rescue` sert ici à exécuter une tâche en cas d'erreur dans le bloc précédent. Il met à disposition deux variables : 

- `ansible_failed_result` : contient le résultat de la task qui a fail. On peut accéder au code retour (`rc`), la sortie standard (`stdout`) et la sortie d'erreur (`stderr`)
- `ansible_failed_task` : contient des infos sur la task qui a fail.

### always

Si on souhaite éxecuter une task indépendamment du
résultat du bloc, on utilise `always` : 

```yaml
- name: Exemple de bloc avec always
  hosts: all
  tasks:
  - name: Toujours faire X
    block:
      - name: Afficher un message
        debug:
          msg: "Je m'exécute normalement"

      - name: Forcer une erreur
        command: /bin/false

      - name: never
        debug:
          msg: "Je ne m'exécute jamais"
    always:
      - name: Toujours exécuter cette tâche
        debug:
          msg: "Cette tâche s'exécute toujours"
```
