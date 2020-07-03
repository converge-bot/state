# @converge/state &middot; [![Version](https://flat.badgen.net/npm/v/@converge/state)](https://www.npmjs.com/package/@converge/state) [![License](https://flat.badgen.net/npm/license/@converge/state)](https://www.npmjs.com/package/@converge/state) [![JavaScript Standard Style](https://flat.badgen.net/badge/code%20style/standard/green)](https://standardjs.com)

> Minimal state management library similar to `redux`, with `immer` built in.

## installation

```sh
# using yarn:
yarn add @converge/state

# or npm:
npm i @converge/state
```

## usage

```js
import { createStore } from "@converge/state"

const store = createStore({ count: 0 }, {
  plus: (by = 1) => state => { state.count += by },
  minus: (by = 1) => state => { state.count -= by },
  reset: () => () => ({ count: 0 })
})

const { plus, minus, reset } = store.getActions()

const unsubscribe = store.subscribe(() => {
  console.log(store.getState())
})

plus()
// -> { count: 1 }

plus(2)
// -> { count: 3 }

minus(2)
// -> { count: 1 }

reset()
// -> { count: 0 }

unsubscribe()

const { state, actions } = store.useStore()

console.log(state)
// -> { count: 0 }

actions.plus(10)

console.log(state)
// -> { count: 0 }

console.log(store.getState())
// -> { count: 10 }
```

## see also

* [`redux`][redux] &ndash; predictable state container for JS apps
* [`immer`][immer] &ndash; create the next immutable state by mutating the current one

## contributing

Search the [issues](https://github.com/converge/state) if you come
across any trouble, open a new one if it hasn't been posted, or, if you're
able, open a [pull request](https://help.github.com/articles/about-pull-requests/).
Contributions of any kind are welcome in this project.

## license

MIT © [Bo Lingen / citycide](https://github.com/citycide)

[redux]: https://github.com/reduxjs/redux
[immer]: https://github.com/immerjs/immer
