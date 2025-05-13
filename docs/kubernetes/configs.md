---
sidebar_position: 7
---

# ConfigMap & Secret

## ConfigMap

`ConfigMap` est un objet Kube permettant de stocker des données de configuration d'une application, de façon à les séparer des specifications du Pod. 

> Une ConfigMap ne peut pas stocker plus de 1Mo de données

### Configuration

Exemple de `ConfigMap` avec des données sous forme de key/value : 

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: config
data:
  key1: value_1
  key.nested: value_2
```

Autre exemple avec une config multi-ligne : 

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-config
data:
  default.conf: | # Ce symbole permet la définition multi-lignes
    server {
        listen       80;
        server_name  localhost;

        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
```

### Définition

Exemple d'utilisation dans un Pod : 

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: configmap-example
data:
  my_key: value

---

apiVersion: v1
kind: Pod
metadata:
  name: example
spec:
  containers:
    - name: example-container
      image: busybox
      command: ["echo"]
      args: ["$(VAR_NAME)"]
      env:
        - name: VAR_NAME
          valueFrom:
            configMapKeyRef:
              name: configmap-example # Nom de la ConfigMap
              key: my_key # Nom de la key à utiliser pour VAR_NAME
```

Exemple d'utilisation via un volume : 

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: file-config
data:
  config.ini: |
    [demo]
    log_level = INFO

---

apiVersion: v1
kind: Pod
metadata:
  name: configmap-volume-pod
spec:
  containers:
    - name: test-container
      image: debian
      volumeMounts:
        - name: config-volume
          mountPath: /etc/config
  volumes:
    - name: config-volume
      configMap:
        name: file-config
```

## Secret

Un `Secret` est un objet Kube permettant de stocker des données de configuration sensibles

### Définition

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: secret_example
type: Opaque
data:
  username: dXNlcm5hbWU= # La donnée est encodée en b64
  password: cGFzc3dvcmQ=
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: secret1
type: Opaque
stringData: # Pas besoin d'encoder avec stringData
  username: user
  password: 'password'
```

### Utilisation

On peut utiliser un `Secret` de trois manières différentes : 

- En tant que volume : 

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-key
stringData:
  .api-key: "my_api_key"

---

apiVersion: v1
kind: Pod
metadata:
  name: secret-volume-pod
spec:
  containers:
  - name: app-container
    image: busybox
    command:
        - ls
        - "-la"
        - "/etc/api"
    volumeMounts:
    - name: api-key-volume
      mountPath: "/etc/api"
      readOnly: true
  volumes:
  - name: api-key-volume
    secret:
      secretName: api-key
```

- En tant que variable d'environnement : 

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: pg-secret
stringData:
  POSTGRES_PASSWORD: "password"

---

apiVersion: v1
kind: Pod
metadata:
  name: my_app
spec:
  containers:
  - name: app-container
    image: my_img
    env:
      - name: POSTGRES_PASSWORD
        valueFrom:
          secretKeyRef:
            name: pg-secret
            key: POSTGRES_PASSWORD
```

- En passant par le kubelet : 

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: docker-registry-secret
type: kubernetes.io/dockerconfigjson
stringData:
  .dockerconfigjson: |
    {
      "auths": {
        "https://index.docker.io/v1/": {
          "username": "admin",
          "password": "password",
          "email": "jdoe@gmail.com"
        }
      }
    }

---

apiVersion: v1
kind: Pod
metadata:
  name: my_app
spec:
  containers:
  - name: app-container
    image: my_registry/my_img
  imagePullSecrets:
  - name: docker-registry-secret
```

### Sécurisation des Secret

Quelques bonnes pratiques de sécurité pour l'usage de Secrets : 

- Eviter d'utiliser le même Secret dans plusieurs namespaces
- Chiffrer les données au repos, car par défaut elles sont stockées en clair dans Kube. Il faudrait utiliser un Key Management Service pour les chiffrer avant de les stocker dans etcd. Tous
les cloud providers fournissent un encrypteur pour les Secret au repos
- Limiter au possible l'accès aux Secrets, on donne accès aux entités et users qui en ont besoin

