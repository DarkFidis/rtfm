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


