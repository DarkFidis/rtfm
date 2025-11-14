---
sidebar_position: 5
---

# SvelteKit - Advanced

## Hooks

SvelteKit met à disposition des hooks, que l'on peut définir dans le fichier `src/hooks.server.js`

### `handle`

Le hook `handle` est le hook de base pour intercepter les données lors du chargement d'une route. Quand on requête une route, SvelteKit
va charger le contenu lié à cette route (les fichiers `+page.server.js` et `+page.svelte`) et génère la réponse. Ainsi, le comportement par défaut 
se résume comme suit : 

```js
export async function handle({ event, resolve }) {
	return await resolve(event);
}
```

Ici, l'objet `event` contient toute la data chargée pour la route : 

- `cookies` : API native cookies
- `fetch`: API native fetch
- `getClientAddress()` : méthode pour obtenir l'IP du client
- `isDataRequest` : booléen qui détermine si oui ou non la requête est faite par un navigateur pour de la donnée ou bien une requête directe
- `locals` : sert à stocker de la data custom, comme `res.locals` de Express JS
- `params` : paramètres dynamiques de la route
- `request` : objet Request de la requête
- `route` : objet représentant la route matchée
- `setHeaders()` pour les entêtes
- `url` : objet URL correspondant à la requête courante

#### Modification du contenu HTML

Pour les pages uniquement

```js
export async function handle({ event, resolve }) {
    return await resolve(event, {
        transformPageChunk: ({ html }) => html.replace(
            '<body',
            '<body style="color: aquablue"'
        )
    });
}
```

#### Nouvelle route

On peut ajouter une nouvelle route dans un hook `handle` :

```js
export async function handle({ event, resolve }) {
    if (event.url.pathname === '/ping') {
        return new Response('pong');
    }
    return await resolve(event);
}
```

### `handleFetch`

Avec le hook `handle`, on a accès à un client dans `event.fetch` qui équivaut à l'API native `fetch` mais avec quelques améliorations :

- On peut faire des requêtes d'authentification avec, car le client hérite des cookies et des entêtes de la requête courante
- On peut faire des requêtes sur des URL relatives (ce qui n'est pas possible avec l'API fetch)
- Les requêtes internes passent directement par le handler

Le hook `handleFetch` donne la possibilité de modifier le comportement du client, celui par défaut étant équivalent à

```js
export async function handleFetch({ event, request, fetch }) {
	return await fetch(request);
}
```

On pourrait utiliser ce hook pour, par exemple, répondre sur une route avec le contenu d'une autre ressource : 

```js
export async function handleFetch({ event, request, fetch }) {
	const url = new URL(request.url);
	if (url.pathname === '/a') {
		return await fetch('/b');
	}
	return await fetch(request);
}
```

### `handleError`

Le hook `handleError` sert à définir un comportement en cas de crash inattendu de l'application : 

```js
export function handleError({ event, error }) {
	console.error(error.stack);
	return {
		message: 'everything is fine',
		code: 'ERROR'
	};
}
```

Le contenu ainsi retourné est disponible dans `page.error`. On peut ainsi l'exploiter dans une page d'erreur `+error.svelte` :

```sveltehtml
<script lang="ts">
	import { page } from '$app/state';
</script>

<h1>{page.status}</h1>
<p>{page.error.message}</p>
<p>error code: {page.error.code}</p>
```

## Options de chargement

### SSR

Pour désactiver le SSR :

`src/routes/+page.server.js`

```js
export const ssr = false
```

### CSR

Pour désactiver le SSR :

`src/routes/+page.server.js`

```js
export const csr = false
```

> Warning : Si on désactive le Client-Side Rendering, les composants ne seront plus interactifs

### Pré-rendu

Pour pré-builder la page sans attendre une requête

`src/routes/+page.server.js`

```js
export const prerender = true
```

> Pratique si on rend de la donnée statique. A contrario, incompatible avec des données dynamiques ou un formulaire.
    
### Trailing slashes

En temps normal, quand on requête une page `/foo/`, SvelteKit va nous rediriger vers `/foo`. Si toutefois on souhaite garder `/foo/`,
il faut exporter la chose suivante : 

`src/routes/+page.server.js`

```js
export const trailingSlash = 'always'
```

La valeur par défaut étant `never`, on peut aussi à l'inverse, exporter :

`src/routes/+page.server.js`

```js
export const trailingSlash = 'ignore'
```

La présence ou non du trailing slash a un impact sur le rendu de la page. La route `/foo/` correspond à `/foo/index.html` tandis
que `/foo` correspond à `foo.html`

## Routing avancé

### Paramètre optionnel

Pour créer une page avec un paramètre dynamique optionnel, on rajoute `[]` à la route. Par exemple, le dossier `src/routes/[param]` devient
`src/routes/[[param]]`

> Attention aux conflits de routes, car `src/routes/[[param]]/+page.svelte` peut entrer en conflit avec `src/routes/+page.svelte`

### Multiples paramètres

Il est possible de créer une route avec une infinité de paramètres dynamiques comme ceci : 

`src/routes/[...path]/+page.svelte`

```sveltehtml
<script>
	import { page } from '$app/state';

	let params = $derived(page.params.path)
</script>

<div class="flex">
	<pre>{JSON.stringify(params, null, 2)}</pre>
</div>
```

> Penser à prevoir une page 404 si le paramètre ne correspond à aucune donnée attendue, par exemple `src/routes/categories/[...catchAll]/+error.svelte`

### Matching de params

On peut mettre en place un matcher pour les paramètres dynamiques de pages. Les matchers doivent être définis dans le dossier `src/params`. Par exemple,
si on souhaite que le paramètre soit un hexa pour une couleur : 

`src/params/hex.js`

````js
export function match(value) {
	return /^[0-9a-f]{6}$/.test(value);
}
````

> Il faut forcément exporter une fonction `match`

Ensuite, pour le mettre en place dans la route, on nomme cette dernière `[param=matcher]`, donc dans notre exemple ce sera `src/routes/colors/[color=hex]/+page.svelte`

> Si le paramètre reçu ne matche pas, une erreur 404 est renvoyée

### Groupement de routes

Avec SvelteKit, il est possible de grouper les routes dans un dossier `(groupe)`. C'est vraiment utile pour par exemple grouper les
routes qui nécessitent d'être authentifié sur l'app. Pour ce cas, on peut créer un groupe `(authed)` dans lequel on va définir un layout de serveur
pour vérifier l'auth

`src/routes/(authed)/layout.server.js`

```js
import { redirect } from '@sveltejs/kit';

export function load({ request, url }) {
    // Calcul de isLoggedIn
	if (!isLoggedIn) {
        // Si non loggé, redirection vers la page de log
		redirect(303, `/login?redirectTo=${url.pathname}`);
	}
}
```

Et enfin un layout pour les boutons de log in/log out : 

`src/routes/(authed)/layout.svelte`

```sveltehtml
<script lang="ts">
	let { children } = $props();
</script>

{@render children()}

<form method="POST" action="/logout">
	<button>Déconnexion</button>
</form>
```

### Layout overriding

Généralement, une page Svelte hérite de son layout mais aussi de tous les layouts parents. Si on souhaite n'avoir que le root layout, 
alors il faut renommer la page avec un `@` : `+page@.svelte`

## Loading avancé

### Loading universel

Avec SvelteKit, on a vu qu'on pouvait charger des données depuis le serveur grâce aux fichiers `page.server.js` et `layout.server.js`. 
Cependant, dans certains cas ce n'est pas utile de charger des données depuis le serveur : 

- Si on utilise une API externe
- Si on souhaite retourner une donnée non serializable (SvelteKit utilise `devalue` pour parser la donnée, une sorte de `JSON.stringify` amélioré), comme par exemple un composant

Si par exemple, on veut retourner la donnée directement, sans serialization, on utilise des fichiers `page.js` dans la route. 

On peut y exploiter les données retournées par le serveur. Exemple :

`src/routes/page.js`

```js
export async function load({ data }) {
    // Ici, data est la donnée retournée par le load de page.server.js
    const otherData = { foo: 'bar' }
	return {
        serverData: data,
        otherData
    }
}
```

### Donnée parente

Si on souhaite récupérer les données retournées par les load parent, la fonction `load` a un paramètre `parent` :

```js
export async function load({ parent }) {
	const { parentData } = await parent();
	return { 
        foo: 'bar',
        ...parentData
    };
}
```

### Revalidation de la donnée

Pour revalider la donnée calculée par un loader, on utilise la fonction `invalidate` dans lequel on passe la route de l'API à revalider.

```sveltehtml
<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';

	let { data } = $props();

	onMount(() => {
		const interval = setInterval(() => {
			invalidate('/api/now');
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>
```

Si on souhaite revalider toutes les données, on appelera `invalidateAll()` également importée depuis `import { invalidate } from '$app/navigation';`

## Variables d'environnement