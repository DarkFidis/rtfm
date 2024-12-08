# Notes Jest

## Test de callback

```javascript
it('should test function with callback', async done => {
    await functionWithCb()
    
    setImmediate(() => {
        // [...]
        // Tests liés au callback
        done()
    })
})
```

## Temporisatiin

Si on a besoin de gagner un peu de temps dans un test : 

```javascript
await new Promise(resolve => {
    process.nextTick(resolve)
})
```