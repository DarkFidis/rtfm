---
sidebar_position: 2
---

# Notions principales

## Stages

### Syntaxe de base

```yaml
stages:
  - build
  - test
  - deploy
```

> Si `stages` n'est pas défini dans le fichier, GitLab appliquera les étapes par défaut que sont `.pre`, `build`, `test`, `deploy` et `.post`

Plusieurs remarques importantes : 

- L'ordre des élements dans le tableau `stages` définit l'ordre d'éxecution des jobs dans le pipeline.
- Les jobs définis dans un même stage seront exécutés en parallèle
- Les jobs du stage suivant ne seront lancés que si le stage précédent passe
- Un job n'ayant pas de stage spécifié sera associé par défaut au stage `test`
- Si un stage n'a pas de job associé, il n'apparaîtra pas dans le pipeline.

### `.pre` et `.post`

Les stages `.pre` et `.post` servent à exécuter des jobs respectivement avant et après le pipeline. Cela peut être utile par exemple pour
préparer l'environnement en pré-pipeline ou encore à nettoyer ce dernier dans la phase post-pipeline. Exemple :

```yaml
stages:
  - .pre
  - build
  - deploy
  - .post

prepare_environment:
  stage: .pre
  script:
    - echo "Mise en place de l'environnement..."
    - mkdir build/

build_project:
  stage: build
  script:
    - echo "Construction du projet..."
    - make build

deploy_project:
  stage: deploy
  script:
    - echo "Déploiement du projet..."
    - make deploy

cleanup:
  stage: .post
  script:
    - echo "Nettoyage..."
    - rm -rf build/
```

### Ignorer l'ordre d'éxecution avec `needs`

`needs` sert à exécuter un job en ignorant l'ordre d'exécution prédéfini.

```yaml
job_1:
  stage: build
  script: echo "Building du front..."

job_2:
  stage: build
  script:
    - echo "Building du back..."
    - sleep 20

job_3:
  stage: test
  script: echo "Testing du front..."
  needs: ["job_1"]
```

Dans cet exemple, `job_3` peut se lancer dès que `job_1` est terminé sans attendre que le stage `build` (donc `job_2`) se soit terminé.

## Scripts

### Syntaxe

Le script, dans le fichier `gitlab-ci.yml`, se définit dans `job` comme suit : 

```yaml
job:
  script:
    - echo "Hello world"
```

### `before_script`

Le keyword `before_script` sert à lancer un script avant l'exécution du script principal du job. Par exemple : 

```yaml
job:
  before_script:
    - echo "Before script"
  script:
    - echo "Script"
```

Cela peut être utile si on veut installer des dépendances pour le script principal

```yaml
.install_dependencies:
  before_script:
    - pip install --upgrade pip
    - pip install -r requirements.txt

my_test_job:
  extends: .install_dependencies
  before_script:
    - pip install some_additional_package
  script:
    - pytest
```

### `after_script`

Le keyword `after_script` sert à lancer un script après le script principal. Par exemple pour nettoyer l'environnement après le main script.

```yaml
integration_tests:
  script:
    - ./provision_resources.sh  # Crée des ressources cloud ou des conteneurs Docker
    - ./run_integration_tests.sh  # Exécute les tests d'intégration
  after_script:
    - ./cleanup_resources.sh  # Supprime les ressources cloud ou les conteneurs Docker
```

## Images

Avec GitLab CI, on peut spécifier une image Docker dans lequel le job va s'exécuter. Pour se faire, on précise le nom de l'image dans la
key `image` : 

```yaml
job:
  image: python:3.9
  script:
    - pip install -r requirements.txt
    - python test.py
```

On peut avoir un usage plus précis de la manière suivante : 

```yaml
image:
  name: super/sql:experimental
  entrypoint: [""]
  pull_policy: if-not-present
```

Ici, la key `pull_policy` sert à spécifier la politique de pull de l'image : 

- `always` : toujours pull l'image
- `if-not-present` : pull l'image si on ne l'a pas déja
- `never` : ne pas pull l'image

## Variables

Il existe deux types de variables : 

- *Les variables globales* : Elles sont définies dans la key `variables` à la racine du fichier `gitlab-ci.yml` : 

```yaml
variables:
  DEPLOY_SITE: "https://my-website.com/"
```

- *Les variables de jobs* : Elles sont définies dans la key `variables` dans la définition du job : 

```yaml
my_deploy:
  stage: deploy
  variables:
    VARIABLE: "value"
```

### Variables de GitLab

GitLab met à disposition des variables par défaut. Les plus utiles sont : 

- `CI_COMMIT_SHA` : identifiant du dernier commit
- `CI_COMMIT_MESSAGE` : message du dernier commit
- `CI_COMMIT_REF_NAME` : nom de la branche courante
- `CI_PROJECT_ID`
- `CI_PIPELINE_ID`
- `CI_JOB_ID`

Pour avoir l'intégralité : [Variables GitLab](https://docs.gitlab.com/ee/ci/variables/predefined_variables.html)

### Variables sur l'UI GitLab

#### Variables projet

Pour définir une variables au niveau d'un projet, il faut aller dans `<PROJET>` > `Settings` > `CI/CD` puis dans la section `Variables`.
Ensuite, cliquer sur `Add variable` pour accéder au formulaire de création. Vous trouverez les champs suivants : 

- *Clé* : Nom de la variable, uniquement composée de lettres, chiffres et `_`. Ce nom doit être unique
- *Valeur* : valeur associée à la variable
- *Type* : `Variable` ou bien `File`
- *Portée de l'environnement* : permet de spécifier la disponibilité de la variable pour chaque environnement
- *Protéger la variable* : si cette option est cochée, la variable ne sera disponible que pour les pipelines de branches ou tags protégés.
- *Masquer la variable* : si cette option est cochée, la valeur de la variable sera masquée dans les logs du pipeline.

Une fois la variable créé, elle peut être utilisée dans `gitlab-ci.yml`

#### Variables de groupe

Pour définir une variable pour un groupe, aller dans les paramètres du groupe en question puis `Settings` > `CI/CD`

#### Variables d'instance

Pour définir une variable au niveau de l'instance même de GitLab, il faut accéder à la zone d'administration.

## Environnements

Pour consulter les différents environnements dans GitLab, aller dans `Operate` > `Environments`

### Syntaxe de base

```yaml
deploy to production:
  stage: deploy
  script: git push production HEAD:main
  environment: production
```

On peut décrire l'environnement plus en détail :

```yaml
deploy to production:
  stage: deploy
  script: git push production HEAD:main
  environment:
    name: production
    url: https://prod.example.com
```

## Contrôle des pipelines

### `allow_failure`

L'option `allow_failure` permet de définir le comportement à suivre en cas d'échec du job. Si `true`, le pipeline continue, dans le cas contraire, le
pipeline crashe.

> Dans les cas ou `allow_failure: true`, le pipeline affichera le warning correspondant au job en échec dans ses logs.

Par défaut, la valeur de `allow_failure` est :

- `true` pour tous les jobs manuels
- `false` pour tous les jobs qui ont la propriété `when: manual` dans ses `rules`.
- `false` dans tous les autres cas

```yaml
job_example:
  stage: test
  script:
    - execute_script
  allow_failure: true
```

On peut préciser des codes de sortie à `allow_failure` : 

```yaml
job_example:
  script:
    - exit 1
  allow_failure:
    exit_codes: 137
```

### `when`

Le keyword `when` permet de définir dans quelles conditions un job doit se lancer. Plusieurs possibilités : 

- `on_success` : exécute si tous les jobs précédents sont passés
- `on_failure` : exécute si au moins un des jobs précédents a crashé
- `never` : ne s'exécute jamais
- `always` : exécute le job quoiqu'il soit arrivé auparavant
- `manual` : exécute le job seulement si il a été déclenché manuellement
- `delayed` : retarde le lancement du job pendant une durée spécifiée

```yaml
job_example:
  stage: test
  script:
    - run some test
  when: manual
```

## Rules

Les règles (rules) permettent de spécifier une condition d'exécution du job en fonction de variables

### `rules:if`

`rules:if` permet de spécifier une condition pour inclure ou non le job dans le pipeline

```yaml
job:
  script: echo "some stuff"
  rules:
    - if: '$CI_COMMIT_BRANCH == "master" || $CI_COMMIT_BRANCH == "develop"'
      when: always
    - if: '$CI_COMMIT_BRANCH =~ /^feature.*/'
      when: manual
```

### `rules:changes`

`rules:changes` permet d'inclure le job en fonction de modifications de fichiers

```yaml
build_backend:
  script: echo "building backend"
  rules:
    - changes:
        - 'backend/*'
    - if: '$CI_PIPELINE_SOURCE == "schedule"'
      when: never
```

Dans cet exemple, le job `build_backend` ne sera inclus dans le pipeline que si des fichiers ont été modifiés dans le répertoire `backend`

### `rules:exists`

`rules:exists` permet d'inclure le job en fonction de l'existence de fichiers

```yaml
build_backend :
  script: echo "Building backend"
  rules:
    - exists:
        - 'backend/*'
    - if: '$CI_COMMIT_MESSAGE =~ /forcer la construction du backend/'
```

Dans cet exemple, le job `build_backend` ne sera inclus dans le pipeline que si des fichiers existent dans le répertoire `backend`

### `rules:allow_failure`

```yaml
job :
  script: echo "This job can fail."
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
      allow_failure: true
```

Dans cet exemple, le job peut échouer sans couper le pipeline uniquement dans le cas d'une MR (`merge_request_event`)


### `rules:needs`

`rules:needs` permet de spécifier des dépendances conditionnelles entre les différents jobs

```yaml
test:
  stage: test
  needs: ["build"]
  rules:
    - if: '$CI_COMMIT_REF_NAME == "master"'
      needs: ["lint", "build"]
```

### `rules:variables`

`rules:variables` permet de définir des variables de manière conditionnelle dans le job

```yaml
deploy:
  script: ./deploy.sh
  variables :
    ENV: "preprod"
  rules:
    - if: '$CI_COMMIT_REF_NAME == "master"'
      variables :
        ENV: "preprod"
```

### Regexp GitLab

Pour utiliser des expressions régulières dans les règles, deux opérateurs :

- `=~` : la valeur correspond à la regexp spécifiée

```yaml
if: $VARIABLE =~ /value.*/
```

- `!~` : la valeur ne correspond pas à la regexp spécifiée

```yaml
if: $VARIABLE !~ /value.*/
```

> Les regexp à caractère unique, comme par exemple `/.*/` ne sont pas supportées

> Par défaut, les regexp sont sensibles à la casse, pour les rendre insensibles, il faut utiliser `i` : `/value.*/i`
