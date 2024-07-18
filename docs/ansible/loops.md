---
sidebar_position: 8
---

# Les boucles

## Boucles avec filtres de recherche

On peut effectuer des boucles avec les filtres de recherche (page précédente) comme suit : 

```yaml
tasks:
  - name: Exemple de boucle with_items
    ansible.builtin.debug:
      msg: "{{ item }}"
    with_items:
      - "élément1"
      - "élément2"
      - "élément3"
```

> La variable `{{ item }}` désigne chaque itération des éléments.

## Boucles avec loop

Les boucles standard se définissent avec le namespace `loop` qui permet d'itérer sur ses valeurs

```yaml
- name: Ajouter plusieurs utilisateurs
  ansible.builtin.user:
    name: "{{ item }}"
    state: present
    groups: "wheel"
  loop:
    - John Doe
    - Elias
```

### Variables de loop

Dans une task avec `loop`, on a accès à certaines variables : 

- `ansible_loop.allitems` : Liste de tous les items de la boucle
- `ansible_loop.index` : index courant de la boucle (à partir de 1)
- `ansible_loop.index0` : index courant de la boucle (à partir de 0)
- `ansible_loop.revindex` : nombre d'itérations depuis la fin de la boucle
- `ansible_loop.revindex0` : nombre d'itérations depuis la fin de la boucle
- `ansible_loop.first` : true si c'est le premier item qui est courant
- `ansible_loop.last` : true si c'est le dernier item qui est courant
- `ansible_loop.length` : nombre d'items de la boucle
- `ansible_loop.previtem` : item de l'itération précedente
- `ansible_loop.nextitem` : item de l'itération suivante

## Boucles avec until

On peut également définir une boucle avec `until` qui va itérer jusqu'à ce que la condition soit satisfaite

```yaml
- name: Vérifier la disponibilité du service web
  uri:
    url: http://example.fr/status
    method: GET
  register: service_status
  until: service_status.status == 200
  retries: 3
  delay: 10
```

> Dans notre exemple la tâche sera relancée jusqu'à ce que le statut soit 200 avec un maximum de 3 tentatives (`retries`) espacées chacune de 
> 10 secondes (`delay`)

Exemple utile : 

```yaml
- name: Vérifier la disponibilité des sites web
  uri:
    url: "https://{{ item }}.mywebsite.fr"
    method: GET
  register: uri_status
  until: uri_status.status == 200
  retries: 3
  delay: 2
  loop:
    - "site1"
    - "site2"
    - "site3"
```

