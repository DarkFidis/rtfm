---
sidebar_position: 3
---

# Notions avancées

## Le namespace `default`

Dans le fichier `gitlab-ci.yml`, le namespace `default` sert à spécifier des valeurs par défaut pour les clés de notre choix. Par exemple : 

```yaml
default:
  image: alpine
  before_script:
    - echo "Before each job"
  after_script:
    - echo "After each job"
  timeout: 5m

job_1:
  stage: build
  script:
    - echo "Job 1 running"

job_2:
  stage: build
  script:
    - echo "Job 3 running"

job_3:
  image: ubuntu
  stage: build
  script:
    - echo "Job 3 running but with Ubuntu image"
```

Quelques remarques : 

- Les jobs qui ne réassignent pas une clé du namespace `default` utilisent leur valeur définie dans `default`. C'est le cas pour `before_script` et `after_script`.
- Lorsqu'une clé est réassignée dans un job, sa valeur écrase celle par défaut. Ici, `image` dans `job_3` écrasera `image` dans `default`. 

On peut assigner une valeur par défaut aux clés suivantes : 

- `after_script`
- `artifacts`
- `before_script`
- `cache`
- `hooks`
- `image`
- `interruptible`
- `retry`
- `services`
- `tags`
- `timeout`

## Artéfacts

Les artéfacts sont des fichiers ou dossiers attachés au job, souvent générés par ce dernier, comme par exemple des rapports de tests. Ils
sont envoyés à GitLab à la fin du job, de façon à pouvoir être consultés dans l'interface. Pour les configurer, on utilise le namespace `artifacts`
à disposition dans les jobs ou dans `default`

### `artifacts:paths`

`artifacts:paths` permet de spécifier les fichiers que l'on souhaite enregistrer en tant qu'artéfacts. Il prend un tableau de paths relatifs au répertoire du projet

```yaml
test_e2e:
  script:
    - echo "E2E test report" > report.txt
  artifacts:
    paths:
      - report.txt
```

### `artifacts:exclude`

`artifacts:exclude` permet d'exclure des fichiers de l'artéfact qui va être créé : 

```yaml
job_de_test:
  script:
    - echo "générer des fichiers"
    - mkdir binaries
    - echo "hello" > binaries/hello.txt
    - echo "world" > binaries/world.o
  artifacts:
    paths:
      - binaries/
    exclude:
      - binaries/*.o
```

### `artifacts:expire_in`

`artifacts:expire_in` permet de définir un TTL pour l'artéfact qui sera créé : 

```yaml
test:
  script:
    - echo "Test report" > report.txt
  artifacts:
    paths:
      - report.txt
    expire_in: 1 week
```

Dans notre exemple, l'artéfact contenant `report.txt` expirera dans une semaine. On peut exprimer la durée d'expiration avec le format suivant : 

- `1 week`
- `6 hrs`
- `15 min`
- `3 sec`
- `never`

On peut également combiner : 

- `3hrs 36 min 14 sec`

> Si aucune unité n'est précisée, la durée sera en secondes

### `artifacts:expose_as`

`artifacts:expose_as` permet de spécifier le nom de l'artéfact qui sera affiché dans l'UI de la MR pour download les artéfacts :

```yaml
test:
  script:
    - echo "Test report" > report.txt
  artifacts:
    expose_as: 'E2E report'
    paths:
      - report.txt
```

### `artifacts:name`

`artifacts:name` permet de spécifier le nom de l'archive créé pour les artéfacts :

```yaml
test:
  script:
    - echo "Test report" > report.txt
  artifacts:
    name: 'E2E report'
    paths:
      - report.txt
```

### `artifacts:public`

`artifacts:public` permet de spécifier si oui ou non l'artéfact sera public :

```yaml
test:
  script:
    - echo "Test report" > report.txt
  artifacts:
    public: false
    paths:
      - report.txt
```

### `artifacts:reports`

`artifacts:reports` permet de collecter les rapports générés par les modèles dans le job :

```yaml
rspec:
  stage: test
  script:
    - echo "Installing dependencies"
    - bundle install
    - echo "Running tests"
    - rspec
  artifacts:
    reports:
      junit: rspec.xml
```

### `artifacts:untracked`

`artifacts:untracked` permet d'ajouter les artéfacts au suivi de Git :

```yaml
job:
  script:
    - echo "Git add unfollowed generated files"
  artifacts:
    untracked: true
```

### `artifacts:when`

`artifacts:when` permet de spécifier à quel moment les artéfacts peuvent être download :

```yaml
job:
  script:
    - echo "That could fail"
  artifacts:
    when: on_failure
```

### `dependencies`

Le keyword `dependencies`, dans un job, sert à spécifier une dépendance vis-à-vis d'un artéfact d'un précédent job

```yaml
build_linux:
  stage: build
  script: make build:linux
  artifacts:
    paths:
      - binaries/

test_linux:
  stage: test
  script: make test:linux
  dependencies:
    - build linux
  
deploy:
  stage: deploy
  script: echo 'Deploy ...'
  environment: production
```

Dans notre exemple, on utilise `dependencies` dans le job `test_linux` de façon à ce qu'il récupère l'artéfact du job `build_linux` dont
il a besoin pour fonctionner. A noter également que le job `deploy` récupère tous les artéfacts des jobs précédents en raison du changement d'étape
(stage)

## Le Cache

Le keyword `cache` du job sert à spécifier des fichiers ou dossiers à mettre dans le cache entre les jobs.

### `cache:paths`

`cache:paths` permet de spécifier quels fichiers mettre dans le cache

```yaml
cache-job:
  script:
    - echo "Caching files ..."
  cache:
    key: binaries-cache
    paths:
      - binaries/*.apk
      - .config
```

### `cache:key`

`cache:key` permet de spécifier un identifiant unique au cache

```yaml
cache-job:
  script:
    - echo "Caching files with identifier"
  cache:
    key: binaries-cache-$CI_COMMIT_REF_SLUG
    paths:
      - binaries/
```

### `cache:key:files`

`cache:key:files` génère une nouvelle clé pour le cache à chaque fois que les fichiers spécifiés sont modifiés

```yaml
cache-job:
  script:
    - echo "Caching files with watch mode"
  cache:
    key:
      files:
        - Gemfile.lock
        - package.json
    paths:
      - vendor/ruby
      - node_modules
```

### `cache:key:prefix`

`cache:key:prefix` permet de combiner le préfixe spécifié avec le SHA calculé pour chaque cache

```yaml
rspec:
  script:
    - echo "Caching files with prefix"
  cache:
    key:
      files:
        - Gemfile.lock
      prefix: $CI_JOB_NAME
    paths:
      - vendor/ruby
```

### `cache:untracked`

`cache:untracked` permet de mettre en cache tous les fichiers non-suivis par Git

```yaml
cache-job:
  script: test
  cache:
    untracked: true
```

### `cache:unprotect`

`cache:unprotect` permet de partager le cache entre les branches protégées et non-protégées.

```yaml
cache-job:
  script: test
  cache:
    unprotect: true
```

### `cache:policy`

`cache:policy` permet de changer le comportement de download/upload du cache. Les valeurs possibles sont `pull`, `push` et `pull-push` (par défaut)

```yaml
prepare-dependencies-job:
  stage: build
  cache:
    key: gems
    paths:
      - vendor/bundle
    policy: push
  script:
    - echo "DL dependencies and building cache ..."
```

### `cache:fallback_keys`

`cache:fallback_keys` permet de spécifier une liste de clés pour tenter de restaurer le cache si on ne trouve rien sur `cache:key`

```yaml
job:
  script: rspec
  cache:
    key: gems-$CI_COMMIT_REF_SLUG
    paths:
      - rspec/
    fallback_keys:
      - gems
    when: 'always'
```

### `cache:when`

`cache:when` permet de définir à quel moment utiliser le cache en fonction du résultat du job : `on_success`, `on_failure` ou `always`

```yaml
cache-job:
  script: rspec
  cache:
    paths:
      - rspec/
    when: 'always'
```

## Exécution en parallèle des jobs

Le parallélisme est une fonctionnalité permettant de lancer plusieurs fois un même job en parallèle au sein d'un pipeline. Pour cela,
on utilise le keyword `parallel`, disponible uniquement dans les jobs.

```yaml
test:
  script: rspec
  parallel: 5
```

> La valeur de `parallel` peut aller de 1 à 200

> Dans chacun des jobs lancés, il y des variables spécifiques définies : `CI_NODE_INDEX`  et `CI_NODE_TOTAL`

> Il est tout à fait possible de créer plus de jobs qu'on a de runners disponibles. Si tel est le cas, les jobs en trop seront mis en attente.

### `parallel:matrix`

Si on souhaite éxécuter plusieurs fois un job en mode parallèle mais avec des variables différentes, on utilise `parallel:matrix`. Cette clé
prend les variables dans un tableau : 

```yaml
deploys:
  stage: deploy
  script:
    - bin/deploy
  parallel:
    matrix:
      - PROVIDER: aws
        STACK:
          - monitoring
          - app1
          - app2
      - PROVIDER: ovh
        STACK: [monitoring, backup, app]
      - PROVIDER: [gcp, vultr]
        STACK: [data, processing]
```

## Factorisation de la CI

### `include`

Le keyword global `include` permet d'inclure des fichiers de config YAML provenant d'autres fichiers dans `gitlab-ci.yml`. Plusieurs types d'inclusion
sont possibles : 

- *Inclusion locale* : pour inclure un fichier situé dans le même projet que le fichier `gitlab-ci.yml`

```yaml
include:
  - local: '/templates/.gitlab-ci-template.yml'
```

- *Inclusion de projet* : Si le fichier de template vient d'un autre projet situé dans la même instance de GitLab : 

```yaml
include:
  - project: 'my-group/my-project'
    file: '/templates/.gitlab-ci-template.yml'
```

- *Inclusion remote* : Si le fichier est situé sur un serveur distant, grâce à une URI : 

```yaml
include:
  - remote: 'https://gitlab.com/example-project/-/raw/main/.gitlab-ci.yml'
```

- *Inclusion de templates pré-définis* : pour inclure des templates pré-définis mis à disposition par GitLab [ici](https://gitlab.com/gitlab-org/gitlab/-/tree/master/lib/gitlab/ci/templates)

```yaml
include:
  - template: Auto-DevOps.gitlab-ci.yml
```

### Les templates

Les templates sont des fichiers de config génériques qui servent de base à des fichiers de conf projet. Il existe deux types de templates : 

- Les *templates intégrés* sont des templates mis à disposition par GitLab.
- Les *templates personnalisés* sont des templates custom créés par des tiers. On les utilise avec `include`

## Héritage dans les jobs

Le keyword `inherit` permet de contrôler ce dont quoi les jobs héritent comme configuration

### Héritage de `default`

`inherit:default` permet de spécifier si oui ou non le job doit hériter des variables de `default` ou bien de préciser quelles sont les variables 
dont le job doit hériter

```yaml
default:
  retry: 2
  image: ruby:3.0
  interruptible: true

job1:
  script: echo "Running job 1 without default variables"
  inherit:
    default: false

job2:
  script: echo "Running job 2 with default:interruptible only"
  inherit:
    default:
      - retry
      - image
```

Petit focus sur les clés `retry` et `interruptible` : 

- `retry` précise le nombre de tentatives à effectuer en cas de crash du job
- `interruptible` : Setté à `true`, le job peut être arrêté pour libérer des ressources pour d'autres jobs.

### Héritage des variables globales

`inherit:variables` permet de spécifier si oui ou non le job doit hériter des variables globales ou bien de préciser quelles sont les variables
dont le job doit hériter. Son comportement est similaire à `inherit:default` vu précédemment.

```yaml
variables:
  VARIABLE1: "Value 1"
  VARIABLE2: "Value 2"
  VARIABLE3: "Value 3"

job1:
  script: echo "Running without any variable"
  inherit:
    variables: false

job2:
  script: echo "Running without VARIABLE3"
  inherit:
    variables:
      - VARIABLE1
      - VARIABLE2
```