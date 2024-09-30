---
sidebar_position: 7
---

# Le template Jinja

Jinja2 est un moteur de templating pour Python utilisé par Ansible. Il comporte certaines caractéristiques comme : 

- *Héritage de template*
- *Bloc de texte* pouvant contenir du code logique permettant de générer dynamiquement une valeur (conditions, boucles, etc.)
- *Filtres et tests*

## Basics

### Interpolation

Avec Jinja, on peut faire des interpolations en indiquant le nom de la variable comme `{{ variable }}`

```yaml
vars:
  username: "admin"
tasks:
  - debug:
      msg: "Le nom d'utilisateur est {{ username }}"
```

### Conditions

```yaml
vars:
  score: 85
tasks:
  - debug:
      msg: "{{ 'Pass' if score > 50 else 'Fail' }}"
```

### Filtres

```yaml
vars:
  numbers: [1, 2, 3, 4, 5]
tasks:
  - debug:
      msg: "{{ numbers | map('pow', 2) | list }}"
```

Les filtres permettent d'appliquer des traitements spécifiques aux variables pipées. Parmi les plus utilisés : 

- `map` applique un callback à chaque item d'une liste
- `select` filtre les items selon le critère spécifié
- `regexp_replace` applique une regexp pour remplacer les caractères qui la matchent

### Tests

```yaml
tasks:
  - debug:
      msg: "Variable is defined"
    when: variable is defined
```

## Filtres Jinja

Les filtres permettent de modifier la valeur d'une variable. On les utilise avec le symbole `|` : 

```yaml
vars:
  my_var: value
tasks:
  - debug:
      msg: "{{ my_var | <FILTRE_A> | <FILTRE_B }}"
```

> Il est possible de chaîner les filtres comme ci dessus

### Filtres mathématiques

- `abs`
- `max`
- `min`
- `round`
- `sum`

### Filtres de texte

- `capitalize`
- `center`
- `escape` convertit les caractères en entités HTML
- `forceescape` force la conversion en entités HTML
- `format` formate les variables dans une string
- `indent`
- `lower`
- `replace`
- `safe` marque une chaîne comme étant sûre de façon à ne pas l'escape en HTML
- `string`
- `title` transforme la première lettre de chaque mot en majuscules
- `trim`
- `truncate`
- `upper`
- `urlencode` encode une chaîne pour un URL
- `urlize` convertit les URL et les adresses mail en liens HTML
- `wordcount` compte les mots de la chaîne
- `wordwrap` enveloppe les mots d'une chaîne à une largeur spécifiée

### Filtres de listes/objets

- `batch` groupe une liste en petites listes de taille spécifiée
- `dictsort` trie un dictionnaire par ses keys
- `first` renvoie le premier item
- `groupby` regroupe des items par un attribut commun spécifié
- `join` 
- `last` renvoie le dernier item
- `list` convertit un ensemble de valeurs en liste
- `map`
- `random` séléctionne un item random
- `reject` filtre la liste, en excluant les items qui passent le test spécifié
- `rejectattr` filtre la liste, en excluant les items dont un attribut passe le test spécifié
- `select` séléctionne les items qui passent le test spécifié
- `selectattr` séléctionne les items dont un attribut passe le test spécifié
- `slice` découpe une liste en listes de taille égale
- `sort`
- `unique` élimine les doublons dans la liste

### Filtres de données

- `default` fournit une valeur par défaut à une variable non-définie
- `items` renvoie une liste de paires key/value d'un dictionnaire
- `pprint` affiche une representation formattée pour le debug
- `tojson` convertit un objet en JSON
- `length` renvoie la longueur d'une chaîne ou le nombre d'items d'une liste
- `reverse` inverse les items d'une liste
- `float` convertit une valeur en décimales
- `int` convertit une valeur en entier
- `xmlattr` formate les dictionnaires en XML

## Filtres Ansible

### Conversion

- `to_nice_json`
- `to_nice_yaml`
- `from_json`
- `from_yaml`
- `bool`

### Listes et dictionnaires

- `combinations` génère des combinaisons des items d'une liste
- `permutations` génère des permutations des items d'une liste
- `combine` fusionne deux dictionnaires
- `dict2items` convertit un dictionnaire en liste de paires key/value
- `items2dict` inverse de `dict2items`
- `flatten` 
- `zip` combine les items de plusieurs listes

### Filtres de texte

- `split`
- `regex_search`
- `regex_replace`
- `regex_findall`
- `regex_escape`
- `quote` ajoute des guillemets pour le shell
- `vault`
- `unvault`
- `to_uuid` génère un UUID

### Filtres mathématiques

- `log`
- `pow`
- `root`
- `random`
- `shuffle`
- `product`
- `ternary`

### Filtres d'encryptage

- `b64encode`
- `b64decode`
- `checksum`
- `hash`
- `md5`
- `sha1`
- `password_hash` permet de calculer un hash du password spécifié

### Filtres de date

- `to_datetime` convertit une string en datetime
- `strftime` formate une date selon le pattern spécifié

### Filtes d'URLs

- `urldecode`
- `urlsplit` décompose l'URL spécifiée 

## Méthodes Python dans les filtres

On peut utiliser des méthodes natives de Python dans les filtres Ansible

### Listes

```yaml
- name: Manipulation de liste
  hosts: localhost
  vars:
    my_list: [1, 2, 3]
  tasks:
    - ansible.builtin.debug:
        msg: "{{ my_list.append(4) }}{{ my_list }}"
```

### Dictionnaires

Pour les dictionnaires on peut utiliser les méthodes `keys()`, `values()` et `items()`

```yaml
- name: Utilisation des méthodes de dictionnaire
  hosts: localhost
  vars:
    my_dict: {'clé1': 'valeur1', 'clé2': 'valeur2'}
  tasks:
    - ansible.builtin.debug:
        msg: "Clés : {{ my_dict.keys() }}, Valeurs : {{ my_dict.values() }}"
```

## Les tests

Les tests servent à évaluer une expression, soit à `true` soit à `false`. Ils ne s'éxecutent que sur la node de contrôle et jamais sur la node
managée.

### Tests Jinja

#### Tests de types

- `boolean`
- `integer`
- `float`
- `string`
- `number`
- `sequence` vérifie si la variable est une liste ou un tuple
- `mapping` vérifie si la variable est un dictionnaire
- `iterable` vérifie si la variable est un itérable

#### Tests de comparaison

- `eq` : égal
- `ne` : non-égal
- `lt` : inférieur
- `le` : inférieur ou égal
- `gt` : supérieur
- `ge` : supérieur ou égal

#### Tests d'état

- `defined` vérifie si la variable est définie
- `undefined` vérifie si la variable est non-définie
- `none` vérifie si la variable est null
- `true` vérifie si la variable est truthy
- `false` vérifie si la variable est falsy

#### Tests sur le contenu

- `empty` vérifie si la variable est vide
- `escape` vérifie si le contenu est escaped pour le HTML
- `callable` vérifie si le contenu est callable
- `in` vérifie si un item est présent dans une liste/dictionnaire

#### Tests sur le texte

- `lower` vérifie si la string est en minuscules
- `upper` vérifie si la string est en majuscules

### Tests Ansible

#### Tests de conditions

- `all` vérifie si toutes les conditions de la liste sont vraies
- `any` vérifie si au moins une condition de la liste sont vraies
- `truthy`
- `falsy`

#### Tests textuels

- `search` vérifie si la chaîne match la regexp spécifiée
- `url` vérifie si la chaîne est une URL
- `uri` vérifie si la chaîne est une URI
- `urn` vérifie si la chaîne est une URN

#### Tests de fichiers

- `abs` vérifie si le chemin est absolu
- `exists` vérifie si le chemin existe
- `file` vérifie si le chemin est un fichier
- `directory` vérifie si le chemin est un dossier
- `link` vérifie si le chemin est un lien
- `mount` vérifie si le chemin est un point de montage

#### Tests de tâches

- `changed` vérifie si la taĉhe a été modifiée
- `failed` vérifie si la tâche a fail
- `skipped` vérifie si la tâche a été ignorée
- `unreachable` vérifie si le host de la tâche était inaccessible
- `success` vérifie si la tâche a été un succès
- `started` vérifie la tâche a été lancée
- `finished` vérifie si la tâche s'est terminée

## Conditions

### Conditions de base

Les conditions de base s'utilisent dans les tasks avec le namespace `when`. 

```yaml
- name: Afficher un message si la longueur d'une chaîne littérale est supérieure à 5
  debug:
    msg: "La chaîne est assez longue"
  when: "'Hello World' | length > 10"
```

On peut effectuer des conditions sur des facts ou des variables. `when` peut tout aussi bien accepter un tableau de conditions : 

```yaml
when:
  - "<CONDITION_A>"
  - "<CONDITION_B>"
  - "<CONDITION_C>"
```

## Le module assert

Le module `assert` d'Ansible permet de vérifier des conditions dans les playbooks. C'est utile quand il faut faire des vérifications avant de passer
à la tâche suivante.

```yaml
---
- name: Exemple d'utilisation de assert
  hosts: localhost
  gather_facts: false
  vars:
    my_var: 100
  tasks:
    - name: S'assurer que 'my_var' est entre 0 et 20 inclus
      assert:
        that:
          - my_var <= 20
          - my_var >= 0
        fail_msg: "'my_var' doit être entre 0 et 20 inclus"
        success_msg: "'my_var' est entre 0 et 20 inclus"
```

### Options

- `that` (required) prend une liste de conditions à vérifier
- `fail_msg` spécifie le message d'erreur
- `success_msg` spécifie le message de succès
- `quiet` réduit la verbosité du module

## Plugins de recherche

Les plugins de recherche, ou `lookup plugins` sont une extension de Jinja spécifique à Ansible. Ils permettent l'accès à des ressources extérieures
dans les playbooks. Ils s'utilisent avec la fonction `lookup` : 

```yaml
- name: Lire le contenu d'un fichier
  hosts: localhost
  vars:
    file_contents: "{{ lookup('ansible.builtin.file', 'path/to/file.txt') }}"
  tasks:
    - name: Afficher le contenu du fichier
      debug:
        msg: "{{ file_contents }}"
```

### Liste des plugins

Les plus connus sont : 

- `ansible.builtin.config` recherche les valeurs de la config actuelle d'Ansible
- `ansible.builtin.csvfile` lit les fichiers CSV et TSV et les extrait sous forme de tables 
- `ansible.builtin.dict` retourne les paires key/value d'un dictionnaire
- `ansible.builtin.env` lit la valeur des variables d'environnement
- `ansible.builtin.file` lit le contenu d'un fichier, pour pouvoir l'inclure dans un template par exemple
- `ansible.builtin.file_glob` liste les fichiers qui matchent un motif spécifié
- `ansible.builtin.first_found` retourne le premier fichier trouvé dans une liste
- `ansible.builtin.indexed_items` réécrit les listes pour retourner des items indexés
- `ansible.builtin.ini` lit un fichier INI
- `ansible.builtin.inventory_hostnames` liste les hosts de l'inventaire correspondants au motif spécifié
- `ansible.builtin.items` liste des items
- `ansible.builtin.lines` lit les lignes de commandes
- `ansible.builtin.list` retourne ce qui lui est donné
- `ansible.builtin.nested` compose une liste avec d'autres listes imbriquées
- `ansible.builtin.password` récupère ou génère un random password depuis le fichier spécifié
- `ansible.builtin.pipe` lit la sortie d'une commande, pour pouvoir traiter cette dernière
- `ansible.builtin.random_choice` retourne un item random d'une liste
- `ansible.builtin.sequence` génère une liste basée sur une séquence de nombres
- `ansible.builtin.subelements` lit une clé imbriquée d'une liste de dictionnaires
- `ansible.builtin.template` récupère le contenu d'un fichier après le templating Jinja.
- `ansible.builtin.together` permet de fusionner des listes
- `ansible.builtin.unvault` lit les fichiers Vault
- `ansible.builtin.url` retourne le contenu d'une URL
- `ansible.builtin.varnames` recherche le nom des variables correspondants au motif spécifié
- `ansible.builtin.vars` recherche la valeur template des variables

### Contrôle des erreurs

On peut contrôler le comportement des plugins en cas d'erreur avec le paramètre `errors` : 

```yaml
- name: si ce fichier n'existe pas, préviens-moi mais continue
  debug:
    msg: "{{ lookup('file', '/nosuchfile', errors='warn') }}"
```

`errors` peut être défini à `ignore`, `warn` ou `strict`

### query

Le comportement par défaut de `lookup` est de retourner une string avec les valeurs séparées par une virgule. Si toutefois on souhaite une liste
en retour, il faut utiliser `query` : 

```yaml
query('dict', dict_variable)
```