---
sidebar_position: 5
---

# Templates GitLab

## Build Docker

```yaml
stages:
  - build

variables:
  FRONTEND_IMAGE: $CI_REGISTRY_IMAGE/frontend
  BACKEND_IMAGE: $CI_REGISTRY_IMAGE/node-api

default:
  image: docker
  services:
    - docker:dind
  before_script:
    - echo "$CI_REGISTRY_PASSWORD" | docker login $CI_REGISTRY --username container-registry-rw --password-stdin

build_frontend:
  stage: build
  script:
    - cd frontend
    - docker pull $FRONTEND_IMAGE:latest || true
    - docker build --cache-from $FRONTEND_IMAGE:latest -t $FRONTEND_IMAGE:$CI_COMMIT_SHORT_SHA -t $FRONTEND_IMAGE:latest .
    - docker push $FRONTEND_IMAGE --all-tags

build_backend:
  stage: build
  script:
    - cd node-api
    - docker pull $BACKEND_IMAGE:latest || true
    - docker build --cache-from $BACKEND_IMAGE:latest -t $BACKEND_IMAGE:$CI_COMMIT_SHORT_SHA -t $BACKEND_IMAGE:latest .
    - docker push $BACKEND_IMAGE --all-tags
```

Remarques : 

- Le service `docker:dind` défini dans `default` permet d'utiliser des commandes Docker dans les script des jobs.
- L'utilisation de `--cache-from` dans le build des images permet d'optimiser la vitesse de build en réutilisant les couches d'images déja construites.
- Le nom des images est versionné avec le SHA du commit concerné, disponible via la variable `$CI_COMMIT_SHORT_SHA`
- La syntaxe `|| true` juste après `docker pull` permet de ne pas crasher le job au cas ou si l'image n'est pas trouvée.

## Yarn + Node global template

```yaml
variables:
  NODE_VERSION: '20.9.0'
  REDIS_VERSION: 6.2.6
  ADD_RELEASE_CONTENT: "dist"
  PROD_REMOTE_HOST: my_host
  CI_IMAGE_NAME: my_repository/node-npm-docker
  CI_IMAGE_VERSION: "${NODE_VERSION}-alpine"
  GIT_CLEAN_FLAGS: "-fdx -e node_modules -e .yarn -e build"
  GITLAB_CI_IDENT: gitlab-ci-token # set the git identity to gitlab-ci-token so that gitlab can recognize the commit author
  GITLAB_GLP_IDENT: gitlab-ci-token
  GITLAB_GLP_TOKEN: ${CI_JOB_TOKEN}

image: ${CI_IMAGE_NAME}:${CI_IMAGE_VERSION}

workflow:
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
      when: never
    - if: '$CI_COMMIT_TAG != null'
      variables:
        VERSION: "$CI_COMMIT_TAG"
        APP_VERSION: "$CI_COMMIT_TAG"
    - if: '$CI_COMMIT_BRANCH != $CI_DEFAULT_BRANCH'
      variables:
        VERSION: $CI_COMMIT_BRANCH
        APP_VERSION: $CI_COMMIT_BRANCH
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'
      variables:
        VERSION: "latest"
        APP_VERSION: "latest"

stages:
  - check
  - install
  - validate
  - build
  - analyze
  - pre_release
  - release
  - notification
  - staging
  - preprod
  - tnr
  - prod

.yarn-cache: &yarn-cache
  key:
    files:
      - yarn.lock
  paths:
    - .yarn
  policy: pull

install:
  stage: install
  script:
    - yarn install
  cache:
    <<: *yarn-cache
    policy: pull-push

validate:build:
  needs:
    - install
  stage: validate
  before_script:
    - yarn install
  script:
    - yarn build
  cache:
    <<: *yarn-cache

validate:lint:
  needs:
    - install
  stage: validate
  before_script:
    - yarn install
  script:
    - yarn lint
  cache:
    <<: *yarn-cache

validate:coverage:
  needs:
    - install
  stage: validate
  before_script:
    - yarn install
  script:
    - yarn coverage --cacheDirectory ".jestcache"
  cache:
    <<: *yarn-cache
  artifacts:
    name: lcov
    paths:
      - ./dist/coverage/unit/lcov.info
      - ./coverage/lcov.info
    expire_in: 1 day

build:docker:
  image: docker:stable-dind
  stage: build
  tags:
    - docker
    - privileged
  services:
    - docker:dind
  script:
    - docker login -u ${GITLAB_CI_IDENT} -p ${CI_JOB_TOKEN} $CI_REGISTRY
    - >
      docker build
      --build-arg NODE_VERSION=${NODE_VERSION}
      --build-arg GITLAB_GLP_IDENT=${GITLAB_GLP_IDENT}
      --build-arg GITLAB_GLP_TOKEN=${GITLAB_GLP_TOKEN}
      --build-arg APP_ENV=${ENVNAME}
      --build-arg APP_VERSION=${APP_VERSION}
      -t $CI_REGISTRY_IMAGE:${VERSION#*/}
      .
    - docker push $CI_REGISTRY_IMAGE:${VERSION#*/}

sonarqube-check:
  stage: analyze
  needs:
    - validate:coverage
  image:
    name: sonarsource/sonar-scanner-cli:5.0.1
    entrypoint: [""]
  variables:
    SONAR_USER_HOME: "${CI_PROJECT_DIR}/.sonar"  # Defines the location of the analysis task cache
    GIT_DEPTH: "0"  # Tells git to fetch all the branches of the project, required by the analysis task
  cache:
    key: "${CI_JOB_NAME}-${CI_PROJECT_ID}"
    paths:
      - .sonar/cache
  script:
    - sonar-scanner
  allow_failure: true
  rules:
    - if: $SONAR_TOKEN == null
      when: never
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

dependency-scanning:
  stage: analyze
  image:
    name: my_repository/snyk
    pull_policy: always
  script: snyk-run
  artifacts:
    when: always
    paths:
      - snyk_results.html
  rules:
    - if: $SNYK_TOKEN == null
      when: never
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
    - if: $CI_COMMIT_TAG


release:generate-changelog:
  cache: []
  image:
    name: my_repository/release-utils:latest
    pull_policy: always
  stage: pre_release
  rules:
    - if: $CI_COMMIT_TAG
  script:
    - create-release-note
  artifacts:
    reports:
      dotenv: variables.env

release:
  cache: []
  stage: release
  needs: ["release:generate-changelog"]
  image:
    name: registry.gitlab.com/gitlab-org/release-cli:latest
    pull_policy: always
  rules:
    - if: $CI_COMMIT_TAG                 # Run this job when a tag is created
  script:
    - echo "running release_job"
  release:                               # See https://docs.gitlab.com/ee/ci/yaml/#release for available properties
    tag_name: '$CI_COMMIT_TAG'
    description: "# ChangeLog $CI_COMMIT_TAG\r\n\r\n$EXTRA_DESCRIPTION"

notification:
  cache: []
  image:
    name: my_repository/release-utils:latest
    pull_policy: always
  stage: notification
  rules:
    - if: $CI_COMMIT_TAG
  script:
    - teams-notify


staging:deploy-trigger:
  stage: staging
  needs:
    - build:docker
  variables:
    ENVNAME: staging
  trigger:
    project: okapi/okapi-config
  when: manual

preprod:deploy-trigger:
  stage: preprod
  needs:
   - validate:build
   - build:docker
  variables:
    ENVNAME: preprod
  trigger:
    project: okapi/okapi-config
  rules:
    - if: '$DISABLE_DEPLOY_JOBS == "true"'
      when: never
    - when: manual
      allow_failure: true

prod:deploy-trigger:
  stage: prod
  needs:
    - validate:build
    - build:docker
  variables:
    ENVNAME: prod
    APP_VERSION: $CI_COMMIT_REF_NAME
  trigger:
    project: okapi/okapi-config
  rules:
    - if: '$DISABLE_DEPLOY_JOBS == "true"'
      when: never
    - if: $CI_COMMIT_TAG
      when: manual
      allow_failure: true
```