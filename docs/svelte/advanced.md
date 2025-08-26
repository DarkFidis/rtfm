---
sidebar_position: 3
---

# Notions avancées

## State

### $state.raw()

En temps normal, la méthode `$state()` de Svelte renvoie un proxy réactif, c'est à dire un objet qui intercepte les opérations de lecture/écriture
pour mettre à jour le DOM. Toutefois, si on souhaite obtenir la valeur du state sans avoir celle du proxy (pour un call AJAX par ex), il faut utiliser
la méthode `$state.raw()` : 

```sveltehtml
<script>
    let obj = $state({ count: 0 });

    // Par défaut, obj est un proxy réactif
    console.log(obj);
    // => Proxy { count: 0 }

    // Pour accéder à la vraie valeur (sans proxy)
    console.log(obj.raw());
    // => { count: 0 }
</script>
```

> Attention, la valeur renvoyée par `$state.raw()` n'est plus réactive

### Usage dans une classe

Il est possible de rendre réactives des propriétés de classes : 

```javascript
class Box {
    width = $state(0);
    height = $state(0);
    area = $derived(this.width * this.height);

    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    embiggen(amount) {
        this.width += amount;
        this.height += amount;
    }
}
```

### Classes réactives

Svelte met à disposition de nombreuses classes réactives, respectivement pour `Date`, `URL`, `URLSearchParams`, `Set` et `Map`. Exemple avec
`SvelteDate` pour `Date` : 

```sveltehtml
<script>
	import { SvelteDate } from 'svelte/reactivity'
	let date = new SvelteDate(); // Créé un state de Date

	const pad = (n) => n < 10 ? '0' + n : n;

	$effect(() => {
        // Mise à jour du state de date toutes les secondes
		const interval = setInterval(() => {
			date.setTime(Date.now());
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<p>The time is {date.getHours()}:{pad(date.getMinutes())}:{pad(date.getSeconds())}</p>

```

### Stores

#### writable

Pour créer un store, c'est-à-dire un state commun partagé entre plusieurs composants, on utilise `writable` : 

```sveltehtml
<script>
  import { writable } from "svelte/store";

  // On crée un store qui contient une valeur initiale
  export const count = writable(0);

  function increment() {
    count.update(n => n + 1); // met à jour la valeur
  }
</script>

<button on:click={increment}>
  Increment
</button>

<p>Count: {$count}</p>
```

#### Store custom

> TODO

### Snippets

> TODO