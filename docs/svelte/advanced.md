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

## Snippets

En Svelte, les snippets sont des bouts de code que l'on peut ré-utiliser dans nos composants.

### Définition & Utilisation

Pour définir un snippet : 

```sveltehtml
{#snippet mysnippet()}
    <!-- Du code HTML -->
{/snippet}
```

Ensuite, pour l'afficher dans un composant

```sveltehtml
{@render mysnippet()}
```

Si toutefois le snippet contient des données dynamiques, on les ajoute en tant que paramètres :

```sveltehtml
{#snippet mysnippet(prop)}
    <!-- Du code HTML -->
{/snippet}
```

Pour l'afficher dans un composant

```sveltehtml
{@render mysnippet('prop_value')}
```

### Utilisation comme props

On peut passer un snippet en tant que propriété d'un composant

````sveltehtml
<MyComponent {mysnippet} />
````

Par la suite, dans `MyComponent` : 

````sveltehtml
<script>
	let { mysnippet } = $props();
</script>

<div>
    {@render mysnippet()}
</div>
````

> Si on définit un snippet en tant que children d'un composant, ce dernier devient automatiquement une propriété dudit composant donc inutile
> de le déclarer

## Bindings

### Texte

Les élements ayant la prop `contenteditable` permettent un binding dynamique `innerHTML` ou `textContent` : 

```sveltehtml
<script>
	let html = $state('<p>Write some text!</p>');
</script>
<!-- L'utilisateur peut éditer le contenu de la div -->
<!-- Le contenu sera interprété en HTML avec innerHTML -->
<div bind:innerHTML={html} contenteditable></div>
<!-- Le state sera modifié en conséquence -->
<pre>{html}</pre>
```

### Dans un bloc each

```sveltehtml
<script>
	let todos = $state([
		{ done: false, text: 'Finish tutorial' },
		{ done: false, text: 'Build an app' },
		{ done: false, text: 'World domination' }
	]);

	function add() {
		todos.push({
			done: false,
			text: ''
		});
	}

	function clear() {
		todos = todos.filter((t) => !t.done);
	}

	let remaining = $derived(todos.filter((t) => !t.done).length);
</script>

<div class="centered">
	<h1>todos</h1>

	<ul class="todos">
		{#each todos as todo}
			<li class={{ done: todo.done }}>
				<input
					type="checkbox"
                    <!-- Si l'utilisateur clique sur check, la tâche sera done -->
					bind:checked={todo.done}
				/>

				<input
					type="text"
					placeholder="What needs to be done?"
                    <!-- L'utilisateur peut modifier directement le contenu de la todo -->
					bind:value={todo.text}
				/>
			</li>
		{/each}
	</ul>

	<p>{remaining} remaining</p>

	<button onclick={add}>
		Add new
	</button>

	<button onclick={clear}>
		Clear completed
	</button>
</div>
```

### Binding de dimensions

Il est possible de binder la hauteur et la largeur d'un élément, respectivement avec `clientHeight` et `clientWidth` : 

```sveltehtml
<script>
	let width = $state();
	let height = $state();
	let size = $state(42);
</script>

<label>
	<input type="range" bind:value={size} min="10" max="100" />
	font size ({size}px)
</label>

<div bind:clientWidth={width} bind:clientHeight={height}>
	<span style="font-size: {size}px" contenteditable>
		edit this text
	</span>

	<span class="size">{width} x {height}px</span>
</div>
```

### Binding this

Le binding `this` permet d'avoir une référence directe au composant dans la variable bindée. On peut voir ça comme l'équivalent d'une ref en React.

```sveltehtml
<script>
  let inputEl;

  function focusInput() {
    inputEl.focus(); // On peut appeler les méthodes natives du DOM
  }
</script>

<input bind:this={inputEl} placeholder="Tapez ici..." />
<button on:click={focusInput}>Focus</button>
```

### Binding de props

Si on souhaite binder une prop de composant, il faut la rendre "bindable" : 

- Dans le composant enfant

```sveltehtml
<script>
	let { value = $bindable(''), onsubmit } = $props();

	const select = (num) => () => (value += num);
	const clear = () => (value = '');
</script>

<div class="keypad">
	<button onclick={select(1)}>1</button>
	<button onclick={select(2)}>2</button>
	<button onclick={select(3)}>3</button>
	<button onclick={select(4)}>4</button>
	<button onclick={select(5)}>5</button>
	<button onclick={select(6)}>6</button>
	<button onclick={select(7)}>7</button>
	<button onclick={select(8)}>8</button>
	<button onclick={select(9)}>9</button>

	<button disabled={!value} onclick={clear}>
		clear
	</button>

	<button onclick={select(0)}>0</button>

	<button disabled={!value} onclick={onsubmit}>
		submit
	</button>
</div>
```

Ensuite, on peut binder la prop dans le composant parent

```sveltehtml
<script>
	import ChildrenComponent from './ChildrenComponent.svelte';

	let pin = $state('');

	let view = $derived(pin
		? pin.replace(/\d(?!$)/g, '•')
		: 'enter your pin');

	function onsubmit() {
		alert(`submitted ${pin}`);
	}
</script>

<h1 style="opacity: {pin ? 1 : 0.4}">
	{view}
</h1>

<ChildrenComponent bind:value={pin} {onsubmit} />
```

## setContext & getContext

En Svelte, le contexte sert à partager des variables entre des composants parents et des composants enfants, sans passer par les props ni par event dispatch.

Dans le composant parent

````sveltehtml
<script>
import { setContext } from 'svelte';

let context = $state({...})
setContext('my-context', context)
</script>
````

Dans le composant enfant

````sveltehtml
<script>
import { getContext } from 'svelte';

const context = getContext('my-context')
</script>
````

## Elements spéciaux

### svelte:window

Avec la balise `<svelte:window>`, on peut ajouter un ou plusieurs event listeners appliqués à tous les éléments du DOM

```sveltehtml
<svelte:window {onevent}>
```

#### Binding de properties

Pour binder un event window à un state (exemple avec l'event `scroll`) : 

```sveltehtml
<script>
	let y = $state(0);
</script>

<svelte:window bind:scrollY={y} />

<span>depth: {y}px</span>
```

On peut binder les propriétés suivantes : 

- `innerWidth`
- `innerHeight`
- `outerWidth`
- `outerHeight`
- `scrollX`
- `scrollY`
- `online`

### svelte:document

La balise `<svelte:document>` permet d'écouter un ou plusieurs évènements dans `document`, c'est pratique si on veut
réagir à des events qui ne sont pas accessibles dans `window`

```sveltehtml
<svelte:document {onevent}>
```

Exemple avec un changement de sélection : 

```sveltehtml
<script>
	let selection = $state('');

	const onselectionchange = (e) => {
		selection = document.getSelection().toString();
	};
</script>

<svelte:document {onselectionchange} />

<h1>Select this text to fire events</h1>
<p>Selection: {selection}</p>
```

> Les events `mouseenter` et `mouseleave` ne sont pas utilisables avec `<svelte:document>`


### svelte:body

La balise `<svelte:body>` permet d'écouter un ou plusieurs évènements dans `document.body`, c'est celui à utiliser si on veut exploiter
des events comme `mouseenter` et `mouseleave`

```sveltehtml
<svelte:body {onevent}>
```

Exemple avec un changement de sélection :

```sveltehtml
<script>
	import imageUrl from './some_img.png';

	let visible = $state(false);
</script>

<svelte:body
	onmouseenter={() => visible = true}
	onmouseleave={() => visible = false}
/>

<img
	class={{ myClass: visible }}
	alt="Image is visible if mouses is inside document.body"
	src={imageUrl}
/>
```

### `svelte:head`

La balise `<svelte:head>` peut s'avérer utile si on souhaite ajuster dynamiquement le CSS global, comme par exemple pour
un changement de thème : 

```sveltehtml
<script>
	const themes = ['dark', 'light', 'space', 'halloween'];
	let selected = $state(themes[0]);
</script>

<svelte:head>
	<link rel="stylesheet" href="/tutorial/stylesheets/{selected}.css" />
</svelte:head>

<h1>Welcome to my site!</h1>

<select bind:value={selected}>
	<option disabled>choose a theme</option>

	{#each themes as theme}
		<option>{theme}</option>
	{/each}
</select>
```

### svelte:element

La balise `<svelte:element>` permet par exemple de modifier dynamiquement la nature d'un élément en fonction d'un state : 

```sveltehtml
<script>
	const options = ['h1', 'h2', 'h3', 'p', 'strong', 'marquee'];
	let selected = $state(options[0]);
</script>

<select bind:value={selected}>
	{#each options as option}
		<option value={option}>{option}</option>
	{/each}
</select>

<svelte:element this={selected}>
	I'm a <code>&lt;{selected}&gt;</code> element
</svelte:element>
```

### svelte:boundary

Le composant `svelte:boundary` sert à catcher les erreurs que peuvent throw les composants instables, cela permet d'éviter
un crash complet de l'application et d'afficher directement le message d'erreur dans un snippet si besoin. Exemple : 

```sveltehtml
<script>
	import BrokenComponent from './BrokenComponent.svelte';
</script>

<svelte:boundary onerror={(e) => console.error(e)}>
	<BrokenComponent />

	{#snippet failed(error, reset)}
		<p>Oops! {error.message}</p>
		// Bouton pour reset la page
		<button onclick={reset}>Reset</button>
	{/snippet}
</svelte:boundary>
```