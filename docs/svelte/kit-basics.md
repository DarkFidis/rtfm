---
sidebar_position: 4
---

# SvelteKit - Basics

## Création app SvelteKit

```shell
npx sv create <APP_NAME>
```

suivi des propositions de la CLI

### Structure initiale du projet

> TODO

## Routing

### Système de pages

Pour ajouter une nouvelle page à une application, il faut créer un fichier dans `src/routes`. Par exemple, pour ajouter
une page `/accueil`, il faut créer un fichier `accueil/+page.svelte`

### Layouts

Pour créer un layout global, ou dans une route en particulier, il faut créer un fichier `+layout.svelte`. Exemple de layout basique : 

```sveltehtml
<script lang="ts">
	let { children } = $props();
</script>

<!-- Contenu du layout -->
<nav>
	<a href="/">Accueil</a>
	<a href="/about">A propos</a>
</nav>

<!-- Rendu des différentes pages -->
{@render children()}
```

### Routes dynamiques

Pour définir une page avec un paramètre dynamique, on créé un fichier `[param]/+page.svelte`. Pour récupérer le paramètre, il faut créer un fichier
`[param]/+page.server.js` dans lequel on charge la donnée comme suit : 

```js
import { error } from '@sveltejs/kit';

export function load({ params }) {
	const dynamicParam = params.param;

	if (!dynamicParam) error(404);

	return {
		dynamicParam
	};
}
```

Ici, la fonction `load` permet de récupérer des données et de les rendre disponibles en tant que props pour la page Svelte finale :

```sveltehtml
<script lang="ts">
	let { data } = $props();
</script>

<h1>{data.dynamicParam}</h1>
```

### Layout de données

Par ailleurs, on peut définir un layout de données qui permettra de rendre les dites données accessibles pour toutes les pages enfant du layout.
Pour utiliser un layout de data, il suffit de le définir dans un fichier `.layout.server.js` à l'endroit ou on le souhaite.

### Headers & Cookies

#### Headers

Pour setter une entête dans une app : 

```js
export function load({ setHeaders }) {
	setHeaders({
		'Header': 'header_value'
	});
}
```

#### Cookies

Exemple de traitement d'un cookie : 

```js
export function load({ cookies }) {
    // Lecture
	const visited = cookies.get('visited');
    // Création
	cookies.set('visited', 'true', { path: '/' });

	return {
		visited: visited === 'true'
	};
}
```

## L'alias $lib

Il arrive souvent, avec une grosse application, que les imports depuis les routes vraiment nestées soient un peu longs.
Pour importer un service de manière plus concise, on peut le définir dans le dossier `src/lib`. Une fois le service créé, 
on peut l'importer avec `$lib` : 

```sveltehtml
<script>
	import { message } from '$lib/message.js';
</script>

<h1>home</h1>
<p>{message}</p>
```

## Formulaires

Utilisation simple d'un formulaire : 

```sveltehtml
<form method="POST" action="?/create">
    <label>
        Ajouter une TODO :
        <input
            name="description"
            autocomplete="off"
        />
    </label>
</form>

<form method="POST">
    <label>
        Ajouter une TODO :
        <input
            name="defaut"
            autocomplete="off"
        />
    </label>
</form>
```

Ensuite, dans `page.server.js`, on récupère la donnée comme suit : 

```js
export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();
        const description = data.get('description')
        console.log({ description })
	},
    // Si le <form> n'a pas d'action, la data est traitée dans default : -->
    default: async ({ request }) => {
        const data = await request.formData();
        const defaut = data.get('defaut')
        console.log({ defaut })
    }
};
```

### Validation

Pour mettre en place une validation basique :

```sveltehtml
<script>
	let { form } = $props();
</script>

<div class="centered">
	<h1>todos</h1>

    <!-- Affichage de l'erreur -->
	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}

	<form method="POST" action="?/create">
		<label>
			add a todo:
			<input
				name="description"
				value={form?.description ?? ''}
				autocomplete="off"
				required
			/>
		</label>
	</form>
</div>
```

```js
export const actions = {
    create: async ({cookies, request}) => {
        const data = await request.formData();
        try {
            db.createTodo(data.get('description'));
        } catch (err) {
            // En cas d'erreur, retourner un fail
            return fail(422, {
                description: data.get('description'),
                error: err.message
            })
        }
    },
}
```

### `enhance`

`enhance` est une fonction sert à améliorer le comportement des formulaires, notamment en permettant un submit asynchrone sans reload la page (La page sera reload au moment de la réponse du serveur) et
une gestion des erreurs plus fluide.

Exemple basique : 

```sveltehtml
<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<form method="POST" use:enhance>
	<input name="email" type="email" required />
	<button type="submit">Envoyer</button>
</form>
```

On peut également customiser le traitement de la réponse du serveur en passant une fonction en paramètre de `enhance` : 

```sveltehtml
<script lang="ts">
	import { enhance } from '$app/forms';

	function handleResponse({ result, update }) {
		if (result.type === 'success') {
			alert('Formulaire envoyé avec succès !');
			update(); // met à jour la page avec les nouvelles données
		} else if (result.type === 'error') {
			alert('Erreur : ' + result.error.message);
		}
	}

</script>

<form method="POST" use:enhance={handleResponse}>
	<input name="name" required />
	<button type="submit">Envoyer</button>
</form>
```

## API

Pour définir une route dans une app, créer le fichier `src/routes/<NOM_MA_ROUTE>/+server.js`

### Route GET

```js
import { json } from '@sveltejs/kit';

export function GET({ params, query }) {
    // Récupération du param dynamique
    const { myParam } = params
	const message = 'Hello world !'

    // Pour retourner une réponse plus détaillée
	return new Response(message, {
		headers: {
			'Content-Type': 'application/json'
		}
	});
    
    // Pour retourner une réponse plus concise
	return json(message);
}
```

### Route POST

```js
import { json } from '@sveltejs/kit';
import * as database from '$lib/server/database.js';

export async function POST({ request, cookies }) {
    // Récupération du body
	const { description } = await request.json();
    // Récupération du cookie
	const userid = cookies.get('userid');
	const { id } = await database.createTodo({ userid, description });

	return json({ id }, { status: 201 });
}
```

## State de l'application

SvelteKit met à disposition trois variables pour l'état de l'application : `page`, `navigating` et `updated`, via le module `$app/state`

### `page`

La variable d'état `page` contient toutes les infos relatives à la page dans lequel on se trouve : 

- `url`: URL de la page
- `params` : Params dynamiques
- `route` : objet avec ID représentant la route
- `status` : Statut HTTP de la page
- `error` : Erreurs actuelles de la page
- `data` : Donnée disponible dans la page (inclut donc le retour des fonctions `load` côté serveur)
- `form` : Donnée retournée par une `action` de formulaire côté serveur

Exemple d'utilisation pour une navigation dans un layout : 

```sveltehtml
<script>
	import { page } from '$app/state';
	
	let { children } = $props();
</script>

<nav>
	<a href="/" aria-current={page.url.pathname === '/'}>
		Accueil
	</a>

	<a href="/about" aria-current={page.url.pathname === '/about'}>
		A propos
	</a>
</nav>

{@render children()}
```

### `navigating`

La variable d'état `page` contient toutes les infos de navigation. Quand on clique sur un lien vers une autre page, cette variable est remplie avec :

- `from` et `to` qui contiennent tous les deux un objet avec `params`, `route` et `url`
- `type` : le type de navigation. Trois valeurs possibles : `link`, `popstate` ou `goto`

### `updated`

La variable d'état `updated` est objet contenant un booléen `current` qui détermine si oui ou non l'application a été mise à jour depuis le dernier chargement de la page

### Exemple complet

```sveltehtml
<script>
	import { page, navigating, updated } from '$app/state';
	let { children } = $props();
</script>

<nav>
	<a href="/" aria-current={page.url.pathname === '/'}>
		Accueil
	</a>

	<a href="/about" aria-current={page.url.pathname === '/about'}>
		A propos
	</a>

	{#if navigating.to}
		navigating to {navigating.to.url.pathname}
	{/if}
</nav>

{@render children()}

{#if updated.current}
	<div class="toast">
		<p>
			A new version of the app is available

			<button onclick={() => location.reload()}>
				reload the page
			</button>
		</p>
	</div>
{/if}
```

## Gestion des erreurs

Dans SvelteKit, il y a deux types d'erreurs, les expected et les unexpected. Dans le premier cas, on utilise l'utilitaire `error` du module `@sveltejs/kit`.
Exemple : 

```js
import { error } from '@sveltejs/kit';

export function load() {
	error(418, 'Custom error');
}
```

### Page d'erreur

On peut créer une page d'erreur par défaut pour toute l'app SvelteKit. Quand un `load` retournera une erreur, l'app va render la page `+error.svelte`
définie soit dans la route, ou par défaut celle au niveau du dossier `routes` : 

```sveltehtml
<script lang="ts">
	import { page } from '$app/state';
</script>

<h1>{page.status} {page.error.message}</h1>
```

Si toutefois une erreur venait à être levée pendant le chargement de la page (par exemple), SvelteKit va se rabattre sur une page d'erreur statique, la page de fallback `src/error.html` :

````sveltehtml
<h1>Erreur inattendue</h1>
<p>Code %sveltekit.status%</p>
<p>%sveltekit.error.message%</p>
````

## Redirections

Pour effectuer une redirection, on utilise l'utilitaire `redirect` du module `@sveltejs/kit`

```js
import { redirect } from '@sveltejs/kit';

export function load() {
	redirect(307, '/to_new_page');
}
```

> Rappel des codes de redirection : 
> - `303` après un submit de formulaire réussi
> - `307` pour les redirections temporaires
> - `308` pour les redirections permanentes



