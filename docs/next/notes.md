---
sidebar_position: 1
---

# Notes

## Router

### Récupération des params

#### Pages Router

Pour récupérer les paramètres d'URL dans une app Next avec `next/router`, procéder comme suit : 

```jsx
import { useRouter } from 'next/router'

const MyPage = () => {
  const router = useRouter()
  const { id } = router.query

  return (
    <div>
      <h1>Element ID : {id}</h1>
    </div>
  )
}

export default MyPage

```

> `router.query` permet de récupérer à la fois les queryparams (`?id=2`) et les paramètres dynamiques (`pages/[id].tsx`)

> `router.query` est initialisé à vide lors d'un rendu serveur et au début d'un rendu client. Il faut donc vérifier que la
> donnée est bien defined avant de la traiter

#### App Router 

Dans le cas d'un routeur basé sur le folder `app` : 

```jsx
import { useSearchParams } from 'next/navigation'

export default function Blog() {
const searchParams = useSearchParams()
const post = searchParams.get('post')

return <p>Article : {post}</p>
}

```

> Dans ce router, on utilise `useSearchParams` pour les queryparams et `useParams` pour les paramètres dynamiques

![Router diffs](/img/next/next-router-diffs.png)