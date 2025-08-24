---
sidebar_position: 2
---

# Components

## Définition

Un composant Svelte ressemble à ceci : 

```sveltehtml
<!-- Paramètres dynamiques -->
<script lang="ts">
	let name = 'John'
</script>
<!-- Template -->
<p>This is a paragraph for {name}</p>
<!-- Style -->
<style>
	p {
		color: goldenrod;
		font-family: 'Comic Sans MS', cursive;
		font-size: 2em;
	}
</style>
```

## State

### State basique

Pour définir un state, on utilise `$state()` : 

```sveltehtml
<script>
	let count = $state(0);

	function increment() {
		count += 1
	}
</script>

<button onclick={increment}>
	Clicked {count}
	{count === 1 ? 'time' : 'times'}
</button>
```

### State dérivé

Un state dérivé est un state calculé à partir d'un autre state. On définit un state dérivé avec `$derived()`.

```sveltehtml
<script>
	let numbers = $state([1, 2, 3, 4]);
	let total = $derived(numbers.reduce((t, n) => t + n, 0))

	function addNumber() {
		numbers.push(numbers.length + 1);
	}
</script>

<p>{numbers.join(' + ')} = {total}</p>

<button onclick={addNumber}>
	Add a number
</button>
```

### Inspection d'un state

Si on souhaite logger un state à chaque modification de celui-ci, on peut utiliser `$inspect()`

```sveltehtml
<script>
	let numbers = $state([1, 2, 3, 4]);
	let total = $derived(numbers.reduce((t, n) => t + n, 0));

	function addNumber() {
		numbers.push(numbers.length + 1);
		console.log($state.snapshot(numbers));
	}
    // Inspection du state
	$inspect(numbers)
</script>

<p>{numbers.join(' + ')} = {total}</p>

<button onclick={addNumber}>
	Add a number
</button>
```

### Effects

```sveltehtml
<script>
	let elapsed = $state(0);
	let interval = $state(1000);

	$effect(() => {
		const id = setInterval(() => {
			elapsed += 1;
		}, interval)

		return () => {
			clearInterval(id)
		}
	})
</script>

<button onclick={() => interval /= 2}>speed up</button>
<button onclick={() => interval *= 2}>slow down</button>

<p>elapsed: {elapsed}</p>
```

### State indépendant

Il est possible de définir un state dans un fichier à part pour l'utiliser ensuite dans un ou plusieurs composants : 

```javascript
export const counter = $state({
	count: 0
});
```

> On ne peut pas utiliser `$state()` dans un fichier sans l'extension `.svelte`, on va donc nommer le fichier `mystate.svelte.js`

## Props

### Lecture des props

Pour récupérer les props d'un composant afin de les utiliser, on utilise `$props()`

```sveltehtml
<script lang="ts">
	let { myprop } = $props();
</script>

<p>The prop value is {myprop}</p>
```

Pour définir une valeur par défaut à une prop : 

```javascript
let { myprop = 'default_value' } = $props()
```

### Spread props

On peut tout à fait spread un objet contenant les props de notre composant

```sveltehtml
<MyComponent {...props} />
```

## Rendu conditionnel

### Bloc if/else

```sveltehtml
<script>
	let count = $state(0);

	function increment() {
		count += 1;
	}
</script>

<button onclick={increment}>
	Clicked {count}
	{count === 1 ? 'time' : 'times'}
</button>

{#if count > 10}
	<p>{count} is greater than 10</p>
{:else if count < 5}
    <p>{count} is between 0 than 5</p>
{:else}
    <p>{count} is between 5 than 10</p>
{/if}
```

## Rendu itératif

### Bloc each

```sveltehtml
<script>
	const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
	let selected = $state(colors[0]);
</script>

<h1 style="color: {selected}">Pick a colour</h1>

<div>
	{#each colors as color (color)}
		<button
			style="background: {color}"
			aria-label={color}
			aria-current={selected === color}
			onclick={() => selected = color}
			></button>
	{/each}
</div>
```

## Rendu asynchrone

Avec Svelte, on peut utiliser les promesses directement dans le template, avec le bloc `#await` :

```sveltehtml
<script>
	import { fetchData } from './utils.js';

	let promise = $state(fetchData());
</script>

<button onclick={() => promise = fetchData()}>
	Get data
</button>

{#await promise}
	<p>...Pending</p>
{:then data}
	<p>Successfully fetched data {data}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
```

## DOM Events

### Utilisation basique

Pour pouvoir associer un handler à un event du DOM, il suffit simplement de rajouter une propriété `on<EVENT_NAME>` à un élement, par exemple : 

````sveltehtml
<div onevent={eventHandler}></div>
````

> Le nom de l'event doit être en minuscules, pas de camelCase

Exemple concret :

```sveltehtml
<script>
	let m = $state({ x: 0, y: 0 });

	function onpointermove(event) {
		m.x = event.clientX;
		m.y = event.clientY;
	}
</script>

<div onpointermove={onpointermove}>
	The pointer is at {Math.round(m.x)} x {Math.round(m.y)}
</div>
```

> Si la propriété et le handler ont le même nom, on peut simplifier avec `<div {onpointermove}></div>`

Pour déclarer le handler directement dans la prop : 

```sveltehtml
<div onpointermove={(event) => { doSomething(event)}}></div>
```

### Phase de capture

Pour éxécuter les évènements en phase de capture, il faut ajouter le suffixe `capture` à l'event prop :

```sveltehtml
<div onpointermovecapture={(event) => { doSomething(event)}}></div>
```

## States & Inputs

### Basics

Une des spécificités de Svelte, c'est qu'on a la possibilité de mettre en place un changement bi-directionnel entre un input et un state.
Une modification du state entraîne une modification de la value de l'input, mais grâce au keyword `bind:value`, une modification de la value dans l'input entraîne une modification du state.
Prenons l'exemple suivant : 

```sveltehtml
<script>
	let name = $state('world');
</script>

<input bind:value={name} />

<h1>Hello {name}!</h1>
```

La valeur du state `name` est modifiée si la value de l'input est modifiée.

> Fonctionne avec tous types d'inputs, checkbox, textarea, etc.

### Groupes d'inputs

On peut associer un groupe d'inputs à un state en particulier avec `bind:group={mystate}`. Exemple : 

````sveltehtml
<script>
	let quantity = $state(1);
</script>

<h2>Quantity</h2>

{#each [1, 2, 3] as number}
	<label>
		<input
			type="radio"
			name="scoops"
			value={number}
			bind:group={quantity}
		/>

		{number} {number === 1 ? 'item' : 'items'}
	</label>
{/each}
````

## Style

### Classes dynamiques

Pour toggle des classes CSS en fonction d'un paramètre dynamique, rien de plus simple : 

```sveltehtml
<script>
	let isClassActive = $state(false);
</script>

<div class="container">
	<button
		class="card {isClassActive ? 'dynamic_class' : ''}"
		onclick={() => isClassActive = !isClassActive}
	>
	</button>
</div>
```

Svelte permet également une syntaxe raccourcie si le nom du paramètre et le nom de la classe concordent : 

```sveltehtml
<button
    class={["card", { isClassActive }]}
    onclick={() => isClassActive = !isClassActive}
>
</button>
```

### Style dynamique

On peut mettre en place un style en fonction d'un paramètre dynamique avec la directive `style` : 

````sveltehtml
<button
    class={["card", { isClassActive }]}
    style:transform={isClassActive ? 'rotateY(0)' : ''}
    onclick={() => isClassActive = !isClassActive}
>
</button>
````

### Props de style

Avec Svelte, il est possible de définir des variables de style qu'on utilise comme des component props. Soit le composant `Box.svelte` suivant : 

```sveltehtml
<div class="box"></div>

<style>
	.box {
		width: 5em;
		height: 5em;
		border-radius: 0.5em;
		margin: 0 0 1em 0;
		background-color: var(--color, #ddd);
	}
</style>
```

Dans ce composant, on a défini une propriété de style pour le `background-color` avec le keyword `var` lié à la variable `color`.
Ainsi, quand on va utiliser notre composant `Box`, on peut spécifier une valeur pour la prop `color` comme suit :

````sveltehtml
<Box --color="red" />
````

La box aura ici un fond rouge

## Manipulation du DOM : les actions

En Svelte, une action est une fonction qu'on attache à un élément HTML pour lui donner un comportement particulier (gestion d’events, intégration avec une librairie externe, animation, etc.).
C'est un peu l'équivalent du hook `useRef()` de React. On attribue une action à un élément avec le keyword `use`. Prenons l'exemple d'un focus automatique sur un input : 

```sveltehtml
<script>
  function autofocus(node) {
    node.focus(); // applique le focus quand l'élément est monté

    return {
      destroy() {
        // nettoyage optionnel quand l'élément est retiré du DOM
        console.log("input détruit");
      }
    };
  }
</script>

<input use:autofocus />
```

On peut également rajouter des paramètres à l'action : 

```sveltehtml
<script>
    // La fonction prend dans l'ordre le noeud concerné (node) et le paramètre (ici size)
  function resize(node, size) {
    node.style.fontSize = size + "px";

    return {
      update(newSize) {
        node.style.fontSize = newSize + "px";
      },
      destroy() {
        node.style.fontSize = null;
      }
    };
  }

  let fontSize = 20;
</script>

<p use:resize={fontSize}>
  Ce texte change de taille dynamiquement
</p>

<button on:click={() => fontSize += 2}>+ augmenter</button>
```

## Transitions

Svelte met à disposition des outils pour implémenter des transitions CSS quand un élement est retiré du DOM (par un rendu conditionnel par ex).
Pour se faire, on utilise le keyword `transition` de la même manière que `use` ci-dessus. Exemple de fade-in/fade-out avec `transition` : 

```sveltehtml
<script lang="ts">
	import { fade } from 'svelte/transition'
	let visible = $state(true);
</script>

<label>
	<input type="checkbox" bind:checked={visible} />
	visible
</label>

{#if visible}
	<p transition:fade>
		Fades in and out
	</p>
{/if}
```

On utilise ici la transition `fade` native de Svelte. Il existe de nombreuses autres transitions.

### In & Out

On peut affiner la transition avec un effet in et un effet out, respectivement avec les keywords `in` et `out` comme suit : 

```sveltehtml
<script>
	import { fade, fly } from 'svelte/transition';

	let visible = $state(true);
</script>

<label>
	<input type="checkbox" bind:checked={visible} />
	visible
</label>

{#if visible}
	<p in:fly={{ y: 200, duration: 2000 }} out:fade>
		Flies in, fades out
	</p>
{/if}
```

### Transition CSS custom

On peut tout à fait définir des transitions CSS custom. Cela revient à définir une fonction avec comme paramètres le noeud du DOM (`node`) et les paramètres passés à la transition qu'on peut spread.
Cette fonction doit retourner un objet pouvant avoir les propriétés suivantes : 

- `delay` : temps avant que la transition s'enclenche
- `duration` : durée de la transition
- `easing` : fonction de easing
- `css` : fonction retournant le CSS de la transition. Elle a deux paramètres `t` et `u`. `t` étant une valeur qui va progressivement de 0 à 1 pendant la transition, ce qui permet de gérer dynamiquement le CSS en fonction, et `u` = 1 - `t`
- `tick` : fonction retournant le JS de la transition (voir transition JS custom)

Reprenons l'exemple de `fade` : 

```javascript
function fade(node, { delay = 0, duration = 400 }) {
    const o = +getComputedStyle(node).opacity;

    return {
        delay,
        duration,
        // L'opacité est recalculée en fonction de t qui va de 0 à 1 ou inversement
        css: (t) => `opacity: ${t * o}`
    };
}
```

### Transitions JS custom

On peut également définir des transitions JavaScript en retournant une fonction `tick` dans la transition. Les paramètres sont les mêmes que pour `css`. Exemple : 

```sveltehtml
<script>
	let visible = $state(false);

	function typewriter(node, { speed = 1 }) {
		const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

		if (!valid) {
			throw new Error(`This transition only works on elements with a single text node child`);
		}
		const text = node.textContent;
		const duration = text.length / (speed * 0.01);

		return {
			duration,
			tick: (t) => {
				const i = Math.trunc(text.length * t)
				node.textContent = text.slice(0, i)
			}
		};
	}
</script>

<label>
	<input type="checkbox" bind:checked={visible} />
	visible
</label>

{#if visible}
	<p transition:typewriter>
		The quick brown fox jumps over the lazy dog
	</p>
{/if}
```

### Events de transition

Il est possible d'effectuer des actions à des moments précis d'une transition. En effet, il existe quatre évènements de transition : 

- `introstart`
- `introend`
- `outrostart`
- `outroend`

Exemple sur un paragraphe avec transition : 

```sveltehtml
<script>
    import { fly } from 'svelte/transition';

    let visible = $state(true);
    let status = $state('waiting...');
</script>
<!-- Affiche le dernier évènement triggered -->
<p>status: {status}</p>

<label>
    <input type="checkbox" bind:checked={visible} />
    visible
</label>

{#if visible}
    <p
            transition:fly={{ y: 200, duration: 2000 }}
            <!-- Le state "status" est modifié à chaque event -->
            onintrostart={() => status = 'intro started'}
            onoutrostart={() => status = 'outro started'}
            onintroend={() => status = 'intro ended'}
            onoutroend={() => status = 'outro ended'}
    >
        Flies in and out
    </p>
{/if}
```

### Transitions globales

```sveltehtml
<script>
	import { slide } from 'svelte/transition';

	let items = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

	let showItems = $state(true);
	let i = $state(5);
</script>

<label>
	<input type="checkbox" bind:checked={showItems} />
	show list
</label>

<label>
	<input type="range" bind:value={i} max="10" />
</label>

{#if showItems}
	{#each items.slice(0, i) as item}
		<div transition:slide|global>
			{item}
		</div>
	{/each}
{/if}
```

Dans cet exemple, on a une itération d'items avec chacun une transition `slide`. Quand on clique pour masquer les items, il n'y a pas de transition. En rajoutant `|global` à la transition, 
cette dernière se jouera quand on masquera les items.

### Bloc Key

Le bloc `{key}` détruit et recréé son contenu si un state est modifié. Exemple : 

```sveltehtml
<script>
	import { typewriter } from './transition.js';
	
    const messages = ['Hello there', 'I am John', 'I am happy']

	let i = $state(-1);

	$effect(() => {
        // Changement d'index à intervalles régulier pour parcourir "messages"
		const interval = setInterval(() => {
			i += 1;
			i %= messages.length;
		}, 2500);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<!-- Affiche un item de "messages" différent à chaque intervalle -->
{#key i}
<p in:typewriter={{ speed: 10 }}>
	{messages[i] || ''}
</p>
{/key}
```

