---
sidebar_position: 1
---

# Gestion de Mongo

## Databases

### Création

```shell
use <DB_NAME>
```

### Listing des utilisateurs

```shell
db.getUsers()
```

### Ajout d'utilisateur

```shell
db.createUser({ user: '<USER_NAME>', pwd: '<USER_PASSWORD', roles: [{ role: 'readWrite', db: 'dbName'}]})
```

### Update d'un utilisateur

```shell
db.updateUser('<USER_NAME>', { ...<UPDATE_DATA> })
```