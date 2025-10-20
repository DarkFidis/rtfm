# Notes TypeScript

## Utils

### Array

#### Valeurs uniques

Pour créer un tableau de valeurs uniques à partir d'un tableau en entrée : 

```typescript
export const uniqueArray: <T>(array: T[]) => T[] = (array) => [...new Set(array)]
```

#### Reduce asynchrone

```typescript
export type AsyncIterator<T, U> = (item: T, index: number, ar: T[]) => Promise<U>

export const eachAsync: <T>(array: T[], iterator: AsyncIterator<T, void>) => Promise<void> = async (
    array,
    iterator,
) =>
    await array.reduce<Promise<void>>(
        (p, item, index, ar) =>
            p.then(async () => {
                await iterator(item, index, ar)
            }),
        Promise.resolve(),
    )
```