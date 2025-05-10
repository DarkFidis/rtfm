---
sidebar_position: 5
---

# Gérer les ressources

Il est important de bien fixer des limites d'utilisation de la mémoire et des CPUs pour les Pods de notre cluster. Ainsi, l'ensemble des conteneurs dudit Pod ne pourra
pas dépasser les limites spécifiées. Si jamais la mémoire est blindée sur un système Linux, il existe un mécanisme, le __Out of Memory Killer__, qui, une fois lancé, va 
déterminer les process les plus gourmands puis va les kill pour éviter un crash complet de la machine. Ce processus peut entraîner un kill d'un ou de plusieurs Pods sans
graceful shutdown. Si jamais un conteneur dépasse la limite configurée, il sera kill et remplacé.


Pour pouvoir consulter la consommation d'un Pod, on peut utiliser la commande suivante : 

```shell
kubectl top pod <POD_NAME>
```

L'output de la commande ressemble à ça : 

```shell
NAME                                CPU(cores)   MEMORY(bytes)
<POD_NAME>                           1m           4Mi
```

Ici : 

- `1m` signifie que le Pod consomme 1 milliCpu
- `4Mi` signifie que le Pod utilise 4 mébibytes de mémoire

Ces données sont également consultables dans le dashboard Minikube : 

```shell
minikube dashboard
```

> Ne pas oublier d'activer l'add-on de Minikube : 
>  ```shell
>   minikube addons enable metrics-server
>  ```

## Gestion de la mémoire

Pour gérer la mémoire, deux paramètres principaux : 

- `requests` permet de spécifier les ressources allouées au conteneur
- `limits` permet de spécifier la limite de ressource que le conteneur peut allouer. Si le conteneur dépasse cette limite, il devient candidat à la suppression

> La quantité de mémoire est exprimée en bytes. Les suffixes `K`, `M`, `G`, `T`, `P` et `E` correspondent aux puissances de 10. `Ki`, `Mi`, `Gi`, `Ti`, `Pi` et `Ei` aux 
> puissances de 2

Exemple : 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: my-container
    image: some-image
    resources:
      requests:
        memory: "64Mi"
      limits:
        memory: "128Mi"
```

> Si on alloue trop de mémoire à un conteneur, ce dernier ne sera jamais Ready

Pour visualiser les ressources utilisées : 

```shell
kubectl describe nodes
```

ou bien dans le dashboard : `Cluster` > `Nodes`

## Gestion du CPU

Exemple : 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: demo-cpu
spec:
  containers:
  - name: demo-cpu-container
    image: vish/stress
    resources:
      limits:
        cpu: "1"
      requests:
        cpu: "0.5"
    args:
    - -cpus
    - "2"
```

> Idem si on alloue trop de CPUs à un conteneur, il ne sera jamais Ready

## Autoscale

Il existe deux types de scaling : 

- *Scaling horizontal* : correspond à l'ajout ou la suppression de nodes dans le cluster. En cas d'augmentation du trafic, on peut augmenter le nombre de Pods du cluster pour
gérer la charge. K8s met à disposition une feature, le `HorizontalPodAutoscaler` qui ajuste automatiquement le nombre de Pods en fonction des ressources utilisées.
- *Scaling vertical* : correspond à l'ajout ou la suppression de ressources pour un Pod. Si par exemple, notre app est down à cause d'un OOM, on peut augmenter la mémoire allouée
à chaque Pod pour fixer le problème. K8s a également une feature pour ça : le `VerticalPodAutoscaler`.

### HorizontalPodAutoscaler

Prenons le déploiement suivant : 

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deploy
spec:
  selector:
    matchLabels:
      run: php-apache
  template:
    metadata:
      labels:
        run: php-apache
    spec:
      containers:
      - name: php-apache
        image: registry.k8s.io/hpa-example
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: 500m
          requests:
            cpu: 200m
---
apiVersion: v1
kind: Service
metadata:
  name: php-apache
  labels:
    run: php-apache
spec:
  ports:
  - port: 80
  selector:
    run: php-apache
```

On souhaite mettre en place un système d'autoscaling horizontal pour ce déploiement. Pour se faire, on utilise la commande suivante : 

```shell
kubectl autoscale deployment my-deploy --cpu-percent=50 --min=1 --max=10
```

Remarques sur les flags utilisés : 

- `--min` : nombre mininum de replicas
- `--max` : nombre maximum de replicas
- `-cpu-percent` : pourcentage d'utilisation du CPU à partir duquel Kube ajoutera un réplica supplémentaire

Pour pouvoir consulter les différents HorizontalPodAutoscalers : 

```shell
kubectl get hpa
```

> On peut ajouter le flag `--watch` pour un suivi en temps réel

#### Test de montée en charge

Pour effectuer un test de montée, on peut utiliser l'outil `wrk` : 

```shell
apk update && apk add --no-cache wrk
```

pour run : 

```shell
wrk -t4 -c1000 -d30s <CLUSTER_URL>
```

#### Config avancée

Exemple : 

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: php-apache
spec:
  scaleTargetRef: # spécifie la ressource qui doit être autoscalée
    apiVersion: apps/v1
    kind: Deployment
    name: php-apache
  minReplicas: 1
  maxReplicas: 10
  metrics: # spécifie les métriques pour calculer le nombre de replicas à déployer
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```

Il est possible d'être encore plus précis dans les règles de scaling avec le namespace `behavior` : 

```yaml
behavior:
  scaleDown:
    stabilizationWindowSeconds: 120 # spécifie le délai entre le changement de la métrique et le process de scaling
    policies:
    - type: Percent
      value: 100
      periodSeconds: 15
  scaleUp:
    stabilizationWindowSeconds: 0 # pas de délai pour un scale-up !
    policies:
    - type: Percent
      value: 100
      periodSeconds: 15
    - type: Pods
      value: 4
      periodSeconds: 15
    selectPolicy: Max
```

### VerticalPodAutoscaler

Le VerticalPodAutoscaler (ou VPA) n'étant pas une feature native de K8s, il faut l'installer : 

```shell
git clone https://github.com/kubernetes/autoscaler.git
```

ensuite, aller dans le dossier `autoscaler/vertical-pod-autoscaler` et lancer la commande

```shell
./hack/vpa-up.sh
```

Un VPA a trois composants principaux : 

- API qui sert à définir des objets CRD (__Custom Resource Definition__) pour les specs et les status du VPA
- *Updater* qui contrôle les Pods courants et update les demandes de ressources en cas de besoin
- *Recommender* qui calcule les demandes de ressources tout en surveillant leur utilisation

Exemple : 

```yaml
apiVersion: "autoscaling.k8s.io/v1"
kind: VerticalPodAutoscaler
metadata:
  name: php-apache-vpa
spec:
  targetRef: # spécifie la ressource à scaler
    apiVersion: "apps/v1"
    kind: Deployment
    name: php-apache
  updatePolicy:
    updateMode: "Auto"
```

Pour consulter la liste des VPAs :

```shell
kubectl get vpa
```


