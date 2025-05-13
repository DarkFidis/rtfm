---
sidebar_position: 6
---

# Persistance

## Les volumes

Dans K8s, il existe plusieurs types de volumes, parmi lesquels ; 

- `emptyDir` : volume permettant un stockage temporaire des données. Il est initié à vide et est créé lorsque le Pod est associé à un Node. A partir du moment ou le Pod est supprimé
de la Node, les données le seront également
- `nfs` : (pour __Network File System__) volume permettant au Pod d'écrire sur le système
- `PersistantVolumeClaim` : demande d'utilisation d'un volume persistant indépendant du Pod
- `ConfigMap` : permet de stocker des données de configuration
- `Secret` : permet de stocker des données de configuration sensibles

Il existe deux catégories de volumes : les volumes ephémères, qui ne sont pas persistés au-delà du cycle de vie du Pod, et les volumes persistants qui persistent au-delà.

### Usecases de volumes ephémères

On peut être amené à utiliser un volume éphémère dans les cas suivants : 

- Stockage temporaire
- Espace de stockage commun entre deux conteneurs du Pod
- Espace de travail pour les longs calculs

### Usecases de volumes persistants

On peut être amené à utiliser un volume persistant dans les cas suivants : 

- Stockage des données d'application
- Partage de données entre les différents Pods
- Stockage des données de databases

## Volumes ephémères

Exemple d'usage d'un volume ephémère (`emptyDir`) : 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  volumes: # Création du volume
  - name: shared-volume
    emptyDir: {}
  containers:
  - name: container-1
    image: nginx
    volumeMounts:
    - mountPath: /usr/share/nginx/html # path dans le conteneur ou le volume sera monté
      name: shared-volume # spécifie le volume par son name
  - name: container-2
    image: alpine
    volumeMounts:
    - mountPath: /volume
      name: shared-volume
    command: ["/bin/sh"]
    args: ["-c", "echo Bonjour tout le monde > /volume/index.html"]
```

## Volumes persistants (PV)

Exemple de `PersistentVolume` : 

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: my_volume
spec:
  capacity:
    storage: 2Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: slow
  hostPath:
    path: "/tmp/data"
```

### Configuration

Allons plus en détail dans les spécifications d'un PV : 

- `capacity` permet de spécifier la capacité de stockage
- `volumeMode` : deux valeurs possibles : 
  - `FileSystem` monte le volume dans les Pods en tant que système de fichiers (valeur par défaut).
  - `Block` monte le volume en tant que périphérique bloc brut.
- `accessMode` définit les droits d'accès au volume pour les conteneurs qui l'utilisent : 
  - `ReadWriteOnce` : le volume peut être monté en lecture-écriture par une seule node 
  - `ReadOnlyMany` : le volume peut être monté en lecture seule par plusieurs nodes
  - `ReadWriteMany` : le volume peut être monté en lecture-écriture par plusieurs nodes
  - `ReadWriteOncePod` : le volume peut être monté en lecture-écriture par un seul Pod
> Les droits d'accès peuvent varier selon le volume utilisé, se référer à la [doc officielle](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes) 

> Le mode `ReadWriteMany` nécéssite un système de fichiers distribués, ce qui n'est pas toujours proposé par les cloud providers.

- `persistentVolumeReclaimPolicy` permet de déterminer ce qu'il doit être fait du volume quand le PVC est supprimé. Deux valeurs possibles : 
  - `Retain` : le volume est conservé sans être réutilisé par un nouveau PVC
  - `Delete` : le volume est supprimé
- `storageClassName` : spécifie la classe de stockage à utiliser. La plupart des cloud providers fournissent leur propre classe, comme par exemple AWS Elastic Block Storage (`EBS`).
Une classe de stockage permet également de créer dynamiquement des PVs dans le cas ou aucun volume ne correspond au PVC.

On peut consulter les classes disponibles avec la commande suivante : 

```shell
kubectl get storageclass
```

## Persistent Volume Claim (PVC)

Un `Persistent Volume Claim` ou PVC est une demande d'utilisation de stockage. Il utilise ses spécifications pour trouver un PersistentVolume et le lier. Une fois le volume lié
au PVC, il ne pourra plus être lié à un autre PVC

Exemple de définition : 

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi
```

Pour afficher les données d'un PVC :

```shell
kubectl get pvc <PVC_NAME>
```

### Configuration

Allons plus en détail dans les spécifications d'un PVC : 

- `accessModes` : mode d'accès au volume (voir plus haut)
- `resources` : spécifie les ressources nécessaires
- `requests` : quantité de stockage demandée
- `storageClassName` : classe de stockage à utiliser
- `selector` permet de choisir un volume en fonction de ses tags
- `volumeName` permet de choisir un volume par son nom
- `volumeMode` détermine si le volume est en mode `FileSystem` ou `Block`

## Usage de volume pour un Pod

Pour utiliser un volume dans un Pod, on peut le spécifier comme n'importe quel volume. Exemple : 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
    - name: my-container
      image: nginx
      volumeMounts:
        - name: my-volume
          mountPath: /data
  volumes:
    - name: my-volume
      persistentVolumeClaim:
        claimName: my-pvc
```

> Le `name` doit être le même dans `volumes` et dans `volumeMounts`

## StatefulSet

Un `StatefulSet` est un objet Kube permettant de gérer le déploiement d'une application à état (stateful), c'est une alternative au `Deployment`. Il permet de garantir les choses suivantes : 

- Un nom unique pour chaque réplica de Pod, ce qui permet de l'identifier clairement. Par exemple `pod-1`, `pod-2` suivant un index
- Les Pods sont crées dans un ordre précis (de 0 à N - 1) et supprimés dans le sens inverse
- Chaque Pod créé peut avoir son propre volume 

> L'usage d'un StatefulSet nécessite de créer un headless service (`clusterIP: None`) qui se charge de définir l'identité réseau de chaque Pod

Exemple de config : 

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webserver
spec:
  ports:
  - port: 80
  clusterIP: None # défini comme headless
  selector:
    app: nginx
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  selector:
    matchLabels:
      app: nginx
  serviceName: "webserver" # définit également le domaine sur lequel les Pods seront disponibles
  replicas: 3
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
          name: web
        volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html
  volumeClaimTemplates: # namespace propre au StatefulSet pour définir les volumes
  - metadata:
      name: www
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: "some-class" # permet de ne pas hériter de la classe par défaut
      resources:
        requests:
          storage: 2Gi
```

> Les PVs associés aux PVCs des différents Pods ne seront pas supprimés si le Pod ou le StatefulSet le sont, il faudra les supprimer manuellement

Une fois lancé, on peut requêter un Pod comme suit : 

```shell
curl http://web-0.webserver
```

en resumé : 

```shell
curl http://<POD_NAME>.<SERVICENAME>
```