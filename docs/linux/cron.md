---
sidebar_position: 9
---

# Les tâches Cron

cron est un daemon qui permet d'éxecuter des commandes de manière différée et régulière

## La commande crontab

La commande `crontab` permet de lister et modifier les fichiers cron pour les utilisateurs.

### Affichage

```shell
crontab -l
```

### Modification

```shell
crontab -e
```

## Syntaxe

Une cron se configure comme suit : 

```shell
<MIN> <HEURE> <JM> <MOIS> <JSEM> <COMMANDE>
```

ou

- `MIN` est la minute (de 0 à 59)
- `HEURE` est l'heure de la journée (de 0 à 23)
- `JM` est le jour dans le mois (de 1 à 31)
- `MOIS` est le mois dans l'année (de 1 à 12)
- `JSEM` est le jour de la semaine (0 à 6)

Les valeurs peuvent être remplacés par les caractères spéciaux suivants : 

- `*` : tous
- `N-M` : intervalle entre `N` et `M`
- `N,M` : liste comprenant `N` et `M`
- `*/N` : toutes les `N` (minutes, heures, jours, etc.)

On peut également utiliser des raccourcis : 

- `@yearly`
- `@monthly`
- `@weekly`
- `@daily`
- `@hourly`
- `@reboot` : à chaque redémarrage

> Une cron s'éxecute selon le fuseau horaire de la machine