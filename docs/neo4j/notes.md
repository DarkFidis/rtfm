# Notes

## Docker

Exemple de docker-compose pour Neo4J : 

```yaml
services:
  neo4j:
    image: neo4j:latest
    container_name: neo4j-server
    ports:
      - 7474:7474
      - 7687:7687
    volumes:
      - ./neo4j/data:/data
      - ./neo4j/logs:/logs
      - ./neo4j/import:/var/lib/neo4j/import
      - ./neo4j/plugins:/plugins
    environment:
      NEO4J_AUTH: ${NEO4J_ADMIN_USERNAME:-username}/${NEO4J_ADMIN_PASSWORD:-long_password}
      NEO4JLABS_PLUGINS: '["graph-data-science", "apoc"]'
    network_mode: bridge
    restart: unless-stopped
```

## Création

### Node

```
MERGE(:Label { prop: "Value" })
```

### Relation

```
MATCH (nodeFrom:Label { prop: "Value" })
MATCH (nodeTo:Label { prop: "Value" })
MERGE (nodeFrom)-[:RelationType { prop: "Value" }]->(nodeTo)
```