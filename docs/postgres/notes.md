---
sidebar_position: 1
---

# Notes

## Gestion des utilisateurs

### Création

```
CREATE USER <USER_NAME> WITH PASSWORD '<PASSWORD>';
```

### Autorisation

```
GRANT CONNECT ON DATABASE <DB_NAME> TO <USERNAME>;
```

pour la connexion puis

```
GRANT CREATE ON DATABASE <DB_NAME> TO <USERNAME>;
```

> En cas de problèmes d'accès au schéma public : 
> ```
> GRANT ALL ON SCHEMA public TO <USERNAME>
> ```