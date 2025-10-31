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
