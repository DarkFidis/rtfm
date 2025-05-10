---
sidebar_position: 4
---

# Les Sondes

Dans K8s, les sondes (ou probes) ont pour mission de surveiller les conteneurs dans un Pod. Il en existe plusieurs sortes : 

- __Liveness probes__ : Ces sondes s'occupent de relancer un Pod quand ce dernier est down
- __Readiness probes__ : Ces sondes déterminent quand un conteneur est prêt à recevoir du trafic
- __Startup probes__ : Ces sondes déterminent quand un conteneur est démarré

## Configuration globale

Les sondes ont toutes les mêmes clés de configuration : 

- `initialDelaySeconds` spécifie le délai entre le démarrage du conteneur et le démarrage des sondes
- `periodSeconds` spécifie la fréquence auquel les contrôles doivent être effectués
- `timeoutSeconds` spécifie le délai au-delà duquel le test sera considéré comme failed
- `successThreshold` spécifie le nombre minimum de succès consécutifs pour que la sonde soit en success après un fail
- `failureThreshold` spécifie le nombre d'essais avant que le contrôle soit considéré comme en erreur
- `terminationGracePeriodSeconds` spécifie un délai maximal de graceful shutdown pour les conteneurs down. Passé ce délai, kubelet va kill le conteneur (Valeur par défaut : 30)

## Liveness probe

Exemple de liveness probe dans un déploiement : 

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: liveness-example
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
      - name: nginx-container
        image: nginx-image
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet: # Le test est configuré pour faire un GET sur la page /index.html
            path: /index.html
            port: 80
          initialDelaySeconds: 5 # Le premier test sera lancé 5 secondes après le démarrage du conteneur
          periodSeconds: 5 # Le test sera lancé toutes les 5 sec
          failureThreshold: 3 # 3 tentatives avant échec
          successThreshold: 1
          timeoutSeconds: 1
```

### Usage de `httpGet`

Pour une sonde liveness, tout code HTTP entre 200 et 400 est synonyme de succès, le reste sera considéré comme en erreur. Le namespace `httpGet` propose de nombreuses options : 

- `host` permet de spécifier le host auquel se connecter, par défaut l'IP du Pod, option à ne pas utiliser
- `scheme` permet de spécifier le protocole de connexion : HTTP ou HTTPS
- `part` permet de spécifier le chemin d'accès au serveur. Par défaut `/`
- `httpHeaders` permet de définir des headers custom
- `port` permet de spécifier le port d'accès au conteneur

> Pour une sonde HTTP, le kubelet va envoyer deux headers supplémentaires : 
> - `User-Agent: kube-probe/<VERSION>` ou `<VERSION>` est la version du Kubelet utilisé
> - `Accept: */*`

## Startup probe

Une startup probe sert à vérifier si un conteneur est correctement démarré. Il est utile car si un conteneur met du temps à démarrer et que les liveness probes démarrent, ces dernières
vont considérer le conteneur comme en échec et vont le redémarrer indéfiniment. L'idée, c'est que les liveness et readiness probes ne démarrent pas tant que la startup n'est pas en
succès.

Exemple : 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
  - name: mon-application
    image: mon-image
    startupProbe:
      httpGet:
        path: /ping
        port: 8080
      failureThreshold: 30
      periodSeconds: 10
```

## Readiness probe

Une readiness probe sert à déterminer si un conteneur est apte à recevoir des requêtes.

Exemple : 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: readiness-example
spec:
  containers:
  - name: my-app
    image: my-image
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 10
```

Deux cas de figure : 

- Le test réussit, dans ce cas Kube commence à rediriger des requêtes vers le conteneur
- Le test fail, dans ce cas Kube arrête d'envoyer des requêtes vers le conteneur

## Autres sondes

### exec

La sonde exec sert à lancer un script dans un conteneur. Elle se configure à l'intérieur du namespace d'une sonde, comme suit : 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: exec-probe-example
spec:
  containers:
  - name: my-app
    image: my-image
    livenessProbe:
      exec:
        command:
        - cat
        - /tmp/is_alive
      initialDelaySeconds: 5
      periodSeconds: 5
```

### tcpSocket

La sonde tcpSocket sert à établir une connexion TCP à l'adresse du conteneur sur le port spécifié : 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: tcpSocket-probe-example
spec:
  containers:
  - name: my-app
    image: my-image
    readinessProbe:
      tcpSocket:
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 10
```

### gRPC

> TODO : What is GRPC ? Usecases ?

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: grpc-example
spec:
  containers:
  - name: etcd
    image: registry.k8s.io/etcd:3.5.1-0
    command: [ "/usr/local/bin/etcd", "--data-dir",  "/var/lib/etcd", "--listen-client-urls", "http://0.0.0.0:2379", "--advertise-client-urls", "http://127.0.0.1:2379", "--log-level", "debug"]
    ports:
    - containerPort: 2379
    livenessProbe:
      grpc:
        port: 2379
      initialDelaySeconds: 10
```