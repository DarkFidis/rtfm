---
sidebar_position: 9
---

# Logging & Monitoring

Dans Kube, chaque Pod génère des logs pour chacun des containers qu'il exécute, ces derniers sont accessibles avec la
commande `kubectl logs`. Toutefois, ces logs ne sont pas persistés en cas de suppression du Pod. C'est pour cette raison
qu'on utilise des outils de collecte de ces logs. De plus, plus le cluster grandit, plus il devient difficile de gérer les logs.
Il faut donc un outil pour les trier, les filter, les analyser, etc. Enfin, il faut un outil de surveillance capable de prévenir
par mail ou SMS en cas de crash, de pressions récurrentes, etc.

Parmi les outils les plus connus : 

- Prometheus
- Grafana
- Stack ELK
- Loki
- Fluentd

## Grafana

### Installation

Avec Helm : 

```shell
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm search repo grafana
```

> TODO avec des notes