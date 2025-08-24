---
sidebar_position: 1
---

# Notes

## Création app SvelteKit

```shell
npx sv create <APP_NAME>
```

suivi des propositions de la CLI

## Components

### Afficher le HTML dynamiquement

```sveltehtml
<script>
	let string = `this string contains some <strong>HTML!!!</strong>`;
</script>

<p>{@html string}</p>
```