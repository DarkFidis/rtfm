---
sidebar_position: 2
---

# Les objets Kubernetes

Les objets Kube définissent l'état souhaité du cluster, ils peuvent représenter : 

- Les conteneurs en cours d'exécution
- Les ressources réseau disponibles
- Les règles de comportement du cluster ou de ses conteneurs

Chaque objet a un but précis dans le cluster. Les principaux types d'objets sont : 

- `Pod` : ensemble de conteneurs en cours d'exécution dans le cluster
- `Service` : définit des ensembles de Pods et leurs règles d'accès réseau
- `Volume` : permet de stocker des données pour la persistance
- `Namespace` : permet de diviser le cluster en plusieurs sous-clusters virtuels
- `Deployment` : permet la gestion des applications sur le cluster
- `StatefulSet` : permet de gérer les applications avec état
- `DaemonSet` : garantit qu'une copie spécifique d'un Pod tourne sur certains noeuds du cluster
- `Job` : task ponctuelle exécutée jusqu'à son achèvement
- `CronJob` : Job planifié

Quasiment tous les objets K8S ont, dans leur définition, deux namespaces : 

- `spec` : description des caractéristiques de l'objet
- `status` : état actuel de l'objet

Dans cette définition, les champs obligatoires sont : 

- `apiVersion` : Précise la version de l'API Kube utilisée
- `kind` : Précise le type d'objet que l'on veut créer (par ex `Pod`, `Service` ou `Deployment`)
- `metadata` : données qui permettent d'identifier l'objet (nom, UID + espace de noms custom)
- `spec` : caractéristiques de l'objet

## Pod

Un Pod est un ensemble de conteneurs avec des ressources de stockage et réseau partagées ainsi qu'une spécification sur la façon d'exécuter 
les conteneurs. Un Pod peut contenir un ou plusieurs conteneurs, la plupart du temps un seul et unique conteneur de façon à avoir une gestion
plus fine de ces conteneurs par Kube, qui ne gère pas directement ces derniers. Chaque Pod est chargé d'exécuter une seule instance de l'application

### Utilisation

#### Définition

Exemple de définition d'un Pod avec un serveur NGinx dans un fichier `my_pod.yaml` : 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx:alpine
    ports:
    - containerPort: 80
```

#### Lancement

```shell
kubectl apply -f my_pod.yaml
```

#### Consultation

Pour consulter l'état des Pods de notre cluster : 

```shell
kubectl get pods
```

Pour avoir une sortie au format JSON : 

```shell
kubectl get pods -o json
```

On aura l'output suivant : 

```shell
NAME    READY   STATUS              RESTARTS   AGE
nginx   0/1     ContainerCreating   0          3s
```

Dans ce retour, les infos sont : 

- `NAME` : nom donné dans les metadata
- `READY` : indique combien de conteneurs dans le Pod sont prêts
- `STATUS` : état actuel du Pod
- `RESTARTS` : indique le nombre de fois ou les conteneurs ont été redémarrés
- `AGE` : temps écoulé depuis la création du Pod

### Lifecycle des Pods

Le cycle de vie d'un Pod se décompose en phases, il en existe 5 : 

- `Pending` : le Pod est pris en compte par Kube, mais certaines images ne sont pas téléchargées
- `Running` : le Pod est lié à un node et tous ses conteneurs tournent
- `Suceeded` : tous les conteneurs sont arrêtés avec succès
- `Failed` : tous les conteneurs sont arrêtés avec succès mais l'un d'entre eux est en erreur
- `Unknown` : l'état du Pod n'a pas pu être obtenu

### Lifecycle des conteneurs

Les conteneurs ont également des états bien définis : 

- `Waiting` : le conteneur est en cours de démarrage
- `Running` : le conteneur s'exécute sans problèmes
- `Terminated` : le démarrage du conteneur a échoué

### Redémarrage des conteneurs

La spec d'un Pod met à disposition un champ `RestartPolicy` qui sert à definir la politique de redémarrage des conteneurs : 

- `Always` (par défaut)
- `OnFailure` : en cas d'échec
- `Never`

### Condition des Pods

Chaque Pod dispose d'un statut (`PodStatus`), à savoir un tableau de conditions que le Pod remplit, géré par `kubelet` : 

- `PodScheduled` : le Pod a été programmé sur un noeud
- `ContainersReady` : tous les conteneurs du Pod sont prêts
- `Initialized` : toutes les initialisations de conteneurs ont été faites
- `Ready` : le Pod est prêt à recevoir des requêtes

## Deployment

L'objet `Deployment` a pour tâche de décrire comment créer et mettre à jour les différentes instances de l'application. Le déploiement se fait en
quatre étapes : 

1. *Définition* : On définit les caractéristiques du déploiement dans un fichier YAML
2. *Création* : On va "appliquer" le déploiement au cluster (`kubectl apply ...`). `kubectl` va traduire les instructions YAML en requêtes HTTP qui seont envoyées ensuite à l'API de Kube
3. *Planification* : Une fois la demande de déploiement reçue, `kube-scheduler` décide du placement des Pods dans le cluster en fonction des instructions reçues
4. *Surveillance* : Une fois les instances d'applications crées, le `Deployment controller` surveille en permanence leur disponibilité. Si un node tombe en panne, il est immédiatement relancé.

### Définition

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deploy-nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
```

Regardons plus en détail le contenu de la `spec` du déploiement : 

- `replicas` : permet de spécifier le nombre de réplicas de notre app
- `selector` : permet de sélectionner les Pods concernés par le déploiement
- `template` : décrit les nouveaux Pods à créer dans le déploiement ainsi que leurs caractéristiques
- `metadata` : labels du Pod
- `spec` : caractéristiques du Pod

### Lancement

```shell
kubectl apply -f my_deploy.yaml
```

### Consultation

```shell
kubectl get deployments
```

avec pour output : 

```shell
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   1/1     1            1           13s
```

les données affichées sont : 

- `NAME` : nom du déploiement
- `READY` : nombre de réplicas prêts
- `UP-TO-DATE` : nombre de réplicas à jour
- `AVAILABLE` : nombre de réplicas disponibles 
- `AGE` : temps écoulé depuis la création du déploiement

> Les déploiements s'exécutent sur un réseau privé et isolé, ils sont visibles par les autres Pods et Services du même cluster mais pas en dehors.
> On ne peut donc pas accéder à l'application depuis le port 80

### Hash du déploiement

Lors de chaque déploiement, un label `pod-template-hash: <HASH>` est automatiquement générée. Elle est ensuite ajoutée aux Pods , aux
sélécteurs et au modèle de Pod du ReplicaSet. Ce mécanisme évite aux réplicas enfants de se chevaucher entre eux

### Mise à jour

Quand Kube met à jour les Pods, il suit un procédé appelé *__rolling update__*. Avec ce procédé, Kube veille à ce que, par défaut, 75 % des Pods
soient toujours en service pendant la mise à jour, et que le nombre de Pods créé ne dépasse pas 125 % du nombre de Pods désiré.

Pour vérifier le succès d'une mise à jour : 

```shell
kubectl rollout status deployment
```

Un déploiement conserve un historique de ses mises à jour de façon à permettre un rollback si nécéssaire. Toutefois, une révision n'est créé
que si un nouveau déploiement est declénché, plus précisément si et seulement si le `template` du déploiement a été modifié.

On a la possibilité d'ajouter des annotations à un déploiement : 

```shell
kubectl annotate deployments my-deploy kubernetes.io/change-cause="Use image 1.24"
```

> L'annotation `kubernetes.io/change-cause` sert à garder une trace des annotations

Ainsi, l'annotation apparaîtra dans l'historique, que l'on peut consulter avec la commande suivante : 

```shell
kubectl rollout history deployment
```

On peut consulter une mise à jour précise grâce à son index : 

```shell
kubectl rollout history deployment --revision=<INDEX>
```

### Rollback

Pour rollback le dernier déploiement :

```shell
kubectl rollout undo deployment
```

Pour rollback tous les déploiements jusqu'à un index précis : 

```shell
kubectl rollout undo deployment --to-revision=<INDEX>
```

### Scaling

Pour scaler un déploiement avec un nombre de réplicas à spécifier : 

```shell
kubectl scale deployment my-deploy --replicas=10
```

## Services

Les services servent à definir l'accessibilité au trafic externe d'un ensemble de Pods ainsi que l'équilibrage de la charge

> Chaque Pod dispose de sa propre adresse IP sur le réseau privé de Kube, ces IPs ne peuvent être exposées à l'extérieur sans un service.

Les Services permettent donc aux Pods de recevoir du trafic, il en existe plusieurs types : 

- `ClusterIP` permet d'exposer le service sur une IP interne au cluster. Cela permet de rendre ce service accessible aux autres Pods du cluster (une base de données par exemple)
- `NodePort` permet de rendre un service accessible depuis l'extérieur du cluster (Frontend ou API éventuellement)
- `LoadBalancer` permet de créer un LoadBalancer pour répartir la charge. Une adresse IP fixe est attribuée au service
- `ExternalName`

### Définition

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

Les `spec` d'un service contiennent les infos suivantes : 

- `type` : type du service
- `selector` permet de sélectionner le/les Pods exposés
- `ports` : permet de spécifier le protocole d'accès (`protocol`), le port sur lequel est exposé le service (`port`) et enfin le port du Pod sur lequel seront redirigées les requêtes (`targetPort`)

### Consultation

```shell
kubectl get services
```

### Nommage et exposition des ports

Il est possible de nommer les ports d'un service, de façon à factoriser le code. Cette pratique devient obligatoire à partir du moment ou l'on
définit plusieurs ports pour un service. Par exemple, pour un serveur NGINX : 

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: http-nginx
    - name: https
      protocol: TCP
      port: 443
      targetPort: https-nginx
```

## Labels & Sélécteurs

### Labels

Les labels et les sélecteurs ont pour fonction de permettre le regroupement d'objets sur lequel on va effectuer une opération. Par exemple, si
on souhaite regrouper tous les objets liés à notre environnement de production, on pourrait définir un label `env: production` dans les metadatas
de chacun des objets concernés.

Les labels peuvent se décomposer en deux segments : 

- Un nom : doit commencer et se terminer par un caractère alpha-numérique, ne doit pas dépasser 63 caractères.

- Un préfixe (optionnel) : cela doit être un sous-domaine DNS valide.

Kubernetes recommande par ailleurs certaines nomenclatures pour des labels d'application : 

- `app.kubernetes.io/name` pour désigner le nom de l'application
- `app.kubernetes.io/instance` pour désigner des instances de l'application
- `app.kubernetes.io/version` pour désigner des versions de l'application
- `app.kubernetes.io/component` pour désigner des composants de l'application (par ex `backend`, `front`)
- `app.kubernetes.io/part-of` désigne l'app de niveau supérieur auquel appartient le composant. Si par exemple un serveur Node JS est déployé au sein d'une application `web`, on mettra `web`.
- `app.kubernetes.io/managed-by` désigne l'outil utilisé pour le déploiement.

Pour consulter les labels des Pods : 

```shell
kubectl get pods --show-labels
```

### Sélécteurs

Les sélecteurs permettent de grouper des objets en fonction de leurs labels.

#### Sélécteurs d'égalité

Les sélecteurs d'égalité permettent d'effectuer des sélections en fonction des valeurs des labels.

```yaml
selector:
  matchLabels:
    app: nginx
    environment: production
```

#### Sélecteurs d'ensembles

Les sélecteurs d'ensembles permettent de filtrer les clés en fonction d'un ensemble de valeurs. Il existe 4 opérateurs de ce type : 

- `In`
- `NotIn`
- `Exists`
- `DoesNotExists`

```yaml
selector:
  matchExpressions:
    - {key: app, operator: In, values: [nginx, mysql]}
```

#### Usage avec la CLI

Pour sélectionner des Pods avec un label spécifié : 

```shell
kubectl get pods -l app=my-app
```

cela peut aussi s'utiliser avec des sélecteurs : 

```shell
kubectl get pods -l 'app in (my-app1,my-app2)'
```

## ReplicaSets

Un `ReplicaSet` est un objet permettant de garantir la disponibilité de copies d'un même Pod au sein du cluster. Si par exempleun Pod crashe,
c'est le ReplicaSet qui s'occupe d'en relancer un nouveau.

Un ReplicaSet est défini avec les champs suivants : 

- *Un sélecteur* qui permet d'identifier les Pods qu'il doit gérer
- *Un nombre de replicas*. Le ReplicaSet maintiendra ce nombre de replicas du Pod
- *Un modèle de Pod* qui spécifie les données des nouveaux Pods relancés.

## Namespaces

Un namespace est une couche d'isolation au sein du cluster. Cela permet notamment : 

- Isoler les ressources
- Gérér les quotas, donc contrôler l'utilisation des ressources de chaque namespace.
- Contrôle d'accès plus fin avec des RBAC dédiés

On les utilise pour répartir les objets Kube dans les différents environnements (prod, staging, etc.)

### Création

```shell
kubectl create namespace my-namespace
```

Si on souhaite y ajouter un Pod : 

```shell
kubectl create -f my-pod.yaml -n my-namespace
```

### Suppression

```shell
kubectl delete namespaces my-namespace
```