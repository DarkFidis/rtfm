---
sidebar_position: 1
---

# Basics

## DevOps

### Notion de DevOps

"__Development operations__" ou *DevOps* désigne les pratiques qui lient le développement logiciel aux opérations informatiques. Le DevOps
regroupe plusieurs principes clés : 

- *L'intégration continue* (CI) : le code est régulièrement mergé et testé
- *La livraison continue* (CD) : le code est régulièrement livré en production
- *Infrastructure en tant que code* : Gestion et provision des infrastructures
- *Surveillance et journalisation* : Suivi de la performance et des erreurs logiciel
- *Culture de la rétroaction* : Amélioration via les retex

### Outils DevOps

#### Planification et collaboration

Outils pour la gestion d'un projet et la planification des tâches :

- Jira
- GitHub
- GitLab

#### Gestion du code

Pour le versioning du code : 

- GitHub
- GitLab
- BitBucket

#### Intégration continue

Outils de CI pour la gestion des pipelines pour le build, les tests, etc.

- Jenkins
- GitLab CI/CD
- GitHub actions
- AWS CodePipeline
- Azure DevOps
- CircleCI
- Travis CI

#### Gestion de l'infrastructure

- Docker
- Docker Hub
- Kubernetes
- Terraform
- Ansible

#### Monitoring

- Prometheus
- Grafana
- Stack ELK
- Datadog / Nagios / New Relic / Sentry

## Intro à GitLab

GitLab est une plateforme CI/CD qui fournit un service de gestion des repositories ainsi que quelques fonctionnalités DevOps

### Fonctionnalités principales

#### Versioning

- *Repositories* : Gestion du code
- *MRs* : Proposition et débat sur les changements dans le code
- *Diff viewer* : Consultation des différences entre les versions du code

#### CI/CD

- *Pipelines* : Automatisation des tests et des déploiements
- *Runners* : Exécution des tâches par des machines spécifiques
- *Artéfacts* : Stockage des fichiers générés par les pipelines

#### Gestion des projets

- *Issues* : Suivi des bugs et des tâches
- *Milestones* : Définition d'objectifs à court et moyen terme
- *Boards* : Tableaux pour une gestion Agile

#### Collaboration

- Commentaires
- *Snippets* : Partage de code
- *Wiki* : Documentation du projet dans GitLab

#### Sécurité

- Scanner
- Audit trail
- Gestion des accès

#### Deploy et monitoring

- Environnements
- Auto DevOps
- Monitoring

### Vocabulaire de GitLab

#### Runners

Un runner est un agent chargé de l'exécution des pipelines. Ces derniers peuvent être des machines physiques ou virtuelles

> On peut utiliser un conteneur Docker spécialisé pour créer un runner

#### Pipeline

Un pipeline est un ensemble de jobs, c-à-d une action que l'on souhaite effectuer (build, test ou deploy par exemple), répartis dans des
stages (`build`, `test` ou `deploy` par exemple)

Les pipelines sont définis dans un fichier `gitlab-ci.yml` situé à la racine du projet. Voici le template sample : 

```yaml
# Ce fichier est un modèle et pourrait nécessiter des modifications avant de fonctionner sur votre projet.
# C'est un exemple de fichier de configuration GitLab CI/CD qui devrait fonctionner sans aucune modification.
# Il montre un pipeline CI/CD basique à 3 étapes. Au lieu de vrais tests ou scripts,
# il utilise des commandes echo pour simuler l'exécution du pipeline.
#
# Un pipeline est composé de jobs indépendants qui exécutent des scripts, regroupés en étapes.
# Les étapes sont exécutées dans un ordre séquentiel, mais les jobs au sein des étapes sont exécutés en parallèle.
#
# Pour plus d'informations, consultez : https://docs.gitlab.com/ee/ci/yaml/index.html#stages
#
# Vous pouvez copier et coller ce modèle dans un nouveau fichier `.gitlab-ci.yml`.
# Vous ne devriez pas ajouter ce modèle à un fichier `.gitlab-ci.yml` existant en utilisant le mot-clé `include:`.
#
# Pour contribuer à l'amélioration des modèles de CI/CD, veuillez suivre le guide de développement sur :
# https://docs.gitlab.com/ee/development/cicd/templates.html
# Ce modèle spécifique se trouve à l'adresse :
# https://gitlab.com/gitlab-org/gitlab/-/blob/master/lib/gitlab/ci/templates/Getting-Started.gitlab-ci.yml

stages:          # Liste des étapes pour les jobs, et leur ordre d'exécution
  - build
  - test
  - deploy

build-job:       # Ce job est exécuté dans l'étape de build, qui est la première à être exécutée.
  stage: build
  script:
    - echo "Compiling the code..."
    - echo "Compile complete."

unit-test-job:   # Ce job est exécuté dans l'étape de test.
  stage: test    # Il ne démarre que lorsque le job de l'étape de build se termine avec succès.
  script:
    - echo "Running unit tests... This will take about 60 seconds."
    - sleep 60
    - echo "Code coverage is 90%"

lint-test-job:   # Ce job est également exécuté dans l'étape de test.
  stage: test    # Il peut être exécuté en même temps que unit-test-job (en parallèle).
  script:
    - echo "Linting code... This will take about 10 seconds."
    - sleep 10
    - echo "No lint issues found."

deploy-job:      # Ce job est exécuté dans l'étape de déploiement.
  stage: deploy  # Il ne démarre que lorsque *les deux* jobs de l'étape de test se terminent avec succès.
  environment: production
  script:
    - echo "Deploying application..."
    - echo "Application successfully deployed."
```

#### Stages

Les stages servent à ordonner les jobs que le pipeline doit suivre. Concrètement, quand on push du code, GitLab lance un pipeline qui exécute
les jobs dans l'ordre spécifié dans le namespace `stages`. Chaque job est associé à un stage grâce à la key `stage`

