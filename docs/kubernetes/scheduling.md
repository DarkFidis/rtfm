---
sidebar_position: 8
---

# Pod scheduling

Le scheduling désigne le procédé par lequel Kube décide sur quel node un Pod doit être lancé. Cette tâche est effectuée 
par le __scheduler__. Quand on créé un Pod sans lui attribuer de node, c'est le scheduler qui le fait automatiquement.

Pour choisir la node, le scheduler prend en compte plusieurs facteurs comme : 

- La capacité du node (CPU & RAM)
- Politiques d'affinités (selectors)
- Contraintes de qualité de service

Le scheduler procède par étapes : 

1. __Filtrage__ : Il filtre les nodes qui ne peuvent pas lancer le Pod. Les nodes qui restent sont appelés les nodes réalisables (feasible nodes)
2. __Scoring__ : Il attribue un score à chaque node réalisable en fonction des facteurs
3. __Selection__ : Le node avec le score le plus elevé est sélectionné

## Affinités & Selectors

### Gestion des labels

- Consulter les labels des nodes : 

```shell
kubectl get nodes --show-labels
```

- Ajouter une étiquette à un node : 

```shell
kubectl label nodes <NODE_NAME> <KEY>=<VALUE>
```

### Sélection avec `nodeName`

Permet de sélectionner un node en fonction de son nom : 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
    - name: nginx
      image: nginx-alpine
  nodeName: node-01
```

> Si le nom spécifié ne correspond à aucun node existant, le Pod ne sera pas lancé et, dans certains cas, il peut être supprimé.

> Si la node spécifié n'a pas les ressources nécessaires pour lancer le Pod, une erreur sera renvoyée. Par exemple `OutOfMemory` ou `OutOfCpu`

> Le nom des nodes sur un cloud-provider peut-être dynamique, donc on va souvent préferer d'autres moyens comme `nodeSelector` ou l'affinité/anti-affinité.

### Sélection avec `nodeSelector`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx
  nodeSelector:
    key: value
```

## Affinité & Anti-affinité

L'affinité et l'anti-affinité permettent d'élargir les types de contraintes sur lequel une node peut être selectionnée.
On peut être plus précis dans le process de selection :

- On peut privilégier une règle en particulier, on parle alors de règle prédérentielle (`preferred`)
- On peut contraindre un Pod en utilisant les labels d'autres Pods sur une node, de façon à spécifier des
règles pour les Pods

Il existe deux types d'affinités : 

- Affinités de nodes
- Affinités inter-Pods, qui permettent de contraindre un Pod en fonction d'autres Pods.

### Affinités de nodes

Il y a deux types d'affinités possibles pour les nodes : 

- `requiredDuringSchedulingIgnoredDuringExecution` : la règle doit être respectée pour que le Pod soit planifié
- `preferredDuringSchedulingIgnoredDuringExecution` : la règle peut ne pas être trouvée dans les nodes mais le Pod est quand même planifié.

Exemple : 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-node-affinity
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: topology.kubernetes.io/zone
            operator: In
            values:
            - europe-east1
            - europe-west1
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 1
        preference:
          matchExpressions:
          - key: une-etiquette-de-node
            operator: In
            values:
            - une-valeur-detiquette
            - une-autre-valeur-detiquette
      - weight: 20
        preference:
          matchExpressions:
          - key: topology.kubernetes.io/region
            operator: In
            values:
            - europe-west1
  containers:
  - name: test-node-affinity
    image: busybox
```

> On peut utiliser des opérateurs logiques pour préciser les règles pour un champ : `In`, `NotIn`, `Exists`, `DoesNotExists`, `Gt` et `Lt`

> On peut spécifier un `weight` compris entre 1 et 100 pour chaque affinité définie -> Correspond à quoi ?

### Affinités inter-pods

POur les affinités inter-pods, ce sont les deux mêmes namespaces, mais il faut spécifier une `topologyKey` : 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-pod-affinity
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: security
            operator: In
            values:
            - S1
        topologyKey: topology.kubernetes.io/zone
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: security
              operator: In
              values:
              - S2
          topologyKey: topology.kubernetes.io/zone
  containers:
  - name: test-pod-affinity
    image: busybox
```

Une clé de topologie correspond à un domaine ou sont regroupés les nodes. Par exemple sur la même machine ou la même zone géographique. On peut avoir : 

- `kubernetes.io/hostname` : nodes sur le même host
- `topology.kubernetes.io/zone` : même dispo dans un cloud provider

## Teintes & Tolérances

Tandis qu'une affinité consiste à attirer les Pods vers une node spécifique, une teinte, au contraire, permet de les repousser. Les tolérances permettent au scheduler de lancer des Pods
ayant certaines tolérances. Ces features sont particulièrement utiles lors de la phase de filtrage du scheduling.

### Teintes

Les teintes (`taints`) sont des balises qu'on applique aux nodes. Elles permettent d'indiquer qu'une node ne doit pas accepter des Pods avec les caractéristiques spécifiés dans la teinte.
Une teinte est composée de trois choses : 

- Clé
- Valeur
- Effet : permet d'indiquer quoi faire des Pods qui n'ont pas la tolérance spécifiée parmi : 
  - `NoSchedule` : n'autorise pas de nouveaux Pods
  - `PreferNoSchedule` : Le scheduler évite la planification si possible mais le fait quand même
  - `NoExecute` : pas de planification et les Pods seront supprimés

#### Commandes

- Créer une teinte : 

```shell
kubectl taint nodes <NODE_NAME> <KEY_1>=<VALUE_1>:NoSchedule
```

- Supprimer une teinte : 

```shell
kubectl taint nodes <NODE_NAME> <KEY_1>=<VALUE_1>:NoSchedule-
```

### Tolérances

Une tolérance est une caractéristique du Pod lui permettant d'être schedule sur une node

```yaml
tolerations:
  - key: "variable"
    operator: "Equal"
    value: "value"
    effect: "NoSchedule"
```

> On peut spécifier une durée pendant laquelle le Pod restera sur la Node en cas de `NoExecute` : 
>```yaml
>tolerations:
>  - key: "app"
>    operator: "Exists"
>    effect: "NoExecute"
>    tolerationSeconds: 3600
>```

## Contraintes de diffusion

Les contraintes de diffusion topologiques des Pods permettent de repartir les Pods dans les différentes nodes en fonction de leur topologie. Particulièrement utile pour garantir
la disponibilité et la robustesse d'une application :

- Disponibilité : en évitant que les Pods ne se retrouvent que sur une seule node
- Robustesse : en garantissant que les Pods soient répartis dans plusieurs zones, au cas ou l'une d'entre elles est down.
- Performance : en répartissant les Pods uniformément dans les nodes pour encaisser la charge en cas de fort traffic ou gros traitement.
- RGPD : en assurant la localisation des données dans des régions autorisées.

Parmi les champs possibles pour les contraintes : 

- `maxSkew` : Degré maximal de déséquilibre autorisé entre les Nodes. Si la valeur est `N` alors il ne peut pas y avoir plus que `N` Pods de différence entre les nodes pour l'app.
- `topologyKey` : déja vu auparavant
- `whenUnsatisfiable` : décrit le comportement au cas ou les contraintes ne sont pas satisfaites : 
  - `DoNotSchedule` : le Pod ne sera pas planifié
  - `ScheduleAnyway`
- `labelSelector` : permet de sélectionner un sous-ensemble de Pods en fonction d'un label de ces derniers. Si pas de value, sélectionne tous les Pods.
- `nodeAffinityPolicy` : spécifie si oui (`Honor`) ou non (`Ignore`) les règles d'affinité sont considérées ou non lors du calcul des contraintes.
- `nodeTaintsPolicy` : Idem pour les rejets de nodes, avec les mêmes valeurs possibles

Exemple : 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: kubernetes.io/hostname
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        app: myapp
  containers:
  - name: mycontainer
    image: myimage
```

## Priorité & Préemption

Chaque Pod dispose d'un attribut `priorityClassName` qui détermine la priorité de ce dernier. Il existe deux classes de priorités utilisées par Kube : 

- `system-cluster-critical` : classe pour les Pods indispensables au cluster. Ces derniers doivent obligatoirement être planifiés, même si cela entraîne la suppression d'autres Pods.
- `system-node-critical` : classe pour les Pods indispensables à la node dans laquelle is sont.

> Les pods n'ayant pas de classe de priorité se verront assigner une valeur de propriété à 0

### PriorityClass

Il est possible de définir des classes de priorité custom en créant des objets `PriorityClass` avec une valeur allant de -2147483648 et 1000000000. Exemple : 

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: priorite-maximale
value: 1000000
preemptionPolicy: Never
description: "Cette classe doit être utilisée que pour les Pods critiques."
```

Ici, la propriété `preemptionPolicy` sert à definir le comportement d'éviction des Pods : 

- `PreemptLowerPriority` (défaut) : les Pods avec une priorité supérieure vont évincer les Pods avec une priorité inférieure
- `Never` : un Pod avec une priorité supérieure restera dans la file d'attente jusqu'à ce que les ressources soient libérées

Exemple d'application sur un Pod : 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx-alpine
  priorityClassName: priorite-maximale
```

## Eviction sous pression

Quand un Pod consomme plus de ressources que prévu dans un node, on dit de la node qu'elle subit une pression sur ses ressources. POur gérer ce usecase, Kube met à disposition une
feature appelée "eviction sous pression" (Node pressure eviction). Lorsque les seuils minimaux de ressources disponibles sont atteints, Kube va commencer à kill des Pods.

On parle de "pression" quand la node n'a plus suffisamment de ressources pour satisfaire les besoins de ses Pods. Il peut y en avoir 3 types : 

- Pression mémoire
- Pression sur l'espace disque
- Pression du PID lorsque le nombre de running process approche la limite du système

### Signaux d'éviction

Kube surveille un certain nombre d'indicateurs pouvant déterminer si une node est sous pression : 

- Pour la mémoire : `memory.available`
- Pour le disque : 
  - `nodefs.available`
  - `nodefs.inodesFree`
  - `imagefs.available`
  - `imagefs.inodesFree`
- Pour le PID: `pid.available`

Les valeurs par défaut utilisées : 

- `memory.available` < 100Mi
- `nodefs.available` < 10%
- `imagefs.available` < 15%
- `nodefs.inodesFree` < 5%

### Processus d'éviction

Lorsqu'un signal est triggered, le process d'éviction est lancé :

1. On détermine quel Pod supprimer en fonction de :
   - Si les ressources utilisées par le Pod dépassent les seuils spécifiés dans la demande
   - Priorité du Pod
   - Utilisation des ressources par rapport à la demande
2. On envoie un signal d'évition aux process des Pods concernés qui s'occupent de supprimer tous les conteneurs.

