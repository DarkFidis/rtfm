---
sidebar_position: 1
---

# Notes

## Components

### Afficher le HTML dynamiquement

```sveltehtml
<script>
	let string = `this string contains some <strong>HTML!!!</strong>`;
</script>

<p>{@html string}</p>
```