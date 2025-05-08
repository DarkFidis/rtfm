---
sidebar_position: 3
---

# Les Ingress

## Définition

Un Ingress est un objet Kube permettant d'exposer des services à l'extérieur du cluster. Un Ingress sert à : 

- Exposer une application web sur Internet
- Gérer le trafic, en redirigeant les requêtes entrantes vers le bon service selon la config
- Gérer le chiffrement TLS
- Gérer les noms de virtual hosts

### Fonctionnement

1. L'Ingress reçoit une requête entrante. Il compare l'URL de la requête avec les règles qui lui auront été spécifiées.
2. Si l'URL matche une règle, la requête sera redirigée vers le service en question
3. Le service forwarde la requête au Pod
4. Le Pod traite la requête et renvoie une réponse qui remonte l'archi dans le sens inverse

> Si l'URL ne matche aucune règle, alors elle sera transmise au service par défaut

## Contrôleur Ingress

Un contrôleur Ingress permet de surveiller les ressources Ingress du cluster, son utilisation est obligatoire. Toute modification de ressources Ingress entraîne une mise à jour par
le contrôleur du reverse-proxy. Il existe plusieurs types de contrôleurs listés [ici](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/)

Exemple de base, avec un contrôleur NGINX : 

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-example
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: / # Spécifique au contrôleur NGINX
spec:
  ingressClassName: nginx-example
  rules:
  - http:
      paths:
      - path: /testpath
        pathType: Prefix
        backend:
          service:
            name: test
            port:
              number: 80
```

> La ligne `nginx.ingress.kubernetes.io/rewrite-target: /` indique à NGINX qu'il faut réécrire l'URL des requêtes entrantes à `/` avant de les forwarder vers le service.

## Règles Ingress

Prenons l'exemple suivant : 

```yaml
spec:
  rules:
  - host: my-app.my-domaine.fr
    http:
      paths:
      - pathType: Prefix
        path: "/some-path"
        backend:
          service:
            name: my-service
            port:
              number: 8080
```

Cette configuration va rediriger toutes les requêtes vers `my-app.my-domaine.fr/some-path` vers le service `my-service` écoutant sur le port 8080

### Routage sur le path

Trois possibilités de routage pour la clé `pathType` : 

- `Prefix` : l'URL doit matcher le préfixe, avec sensibilité à la casse
- `Exact` : l'URL doit correspondre exactement, avec sensibilité à la casse
- `ImplementationSpecific`

Tableau complet : 

![Ingress path rules](/img/kube/ingress-prefix.png)

### Routage sur le host

On peut également faire un routage en fonction du host de la requête avec `host` : 

```yaml
spec:
  rules:
  - host: "example1.fr"
    http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: service1
            port:
              number: 80
  - host: "example2.fr"
    http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: service2
            port:
              number: 80
```

### Backend par défaut

Si on souhaite spécifier un backend par défaut, on utilise le namespace `defaultBackend` : 

```yaml
spec:
  defaultBackend:
    service:
      name: default-service
      port:
        number: 80
  rules:
  - http:
      paths:
      - pathType: Prefix
        path: "/service1"
        backend:
          service:
            name: service1
            port:
              number: 80
```

## Utilisation avec Minikube

Pour pouvoir utiliser un Ingress en local avec Minikube, il faut activer les add-ons dédiés : 

```shell
minikube addons enable ingress
minikube addons enable ingress-dns
```

Pour vérifier que le contrôleur tourne : 

```shell
kubectl get pods -n ingress-nginx
```

Pour tester : 

- Lancer le contrôleur qu'on aura défini : 

```shell
kubectl apply -f my-ingress.yaml
```

puis 

```shell
minikube tunnel
```

Par la suite, on peut requêter le contrôleur sur `http://127.0.0.1`