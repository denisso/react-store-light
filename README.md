> ⚠️ Version 2.x introduces breaking changes compared to 1.x  
> See CHANGELOG.md for details.

for v1x see READMEv1.md

# react-store-light

A **minimal reactive state manager** for React projects where you want simple shared state without
overhead. This library provides a slice-based multiple store, context-driven state management API
with built-in async support.

based on [observable-store-light](https://github.com/denisso/observable-store-light)

---

## Features

- **Observer-based state updates** Components automatically re-render when a subscribed value
  changes.

- **Works with React hooks** Built around a simple `useStore(key)` hook.

- **Fully typed with TypeScript** Strong typing for keys and values out of the box.

- **Supports multiple independent stores** Create as many stores as you need — each one is fully
  isolated.

- **Tiny bundle size**

- **Provider-based architecture optional, but recommended**

---

## Installation

```bash
npm install react-store-light
```

or

```bash
pnpm add react-store-light
```

---

## API

This library provides a **slice-based, context-driven state management API** with built-in async
support.

### createSlice ()

Creates an isolated slice definition. Each slice owns its **own store identity** and can be
instantiated multiple times.

- returns:
  - createStore (initData) - creates a store instance with uniq id for this slice.
    - returns:
      - store - store with api

  - useState (Context, key) subscribes a component to a single store field by key.
    - returns:
      - [value, setValue] = analog React.useState
    - features:
      - key that was assigned during initialization will be used, you cannot change it

  - useStateAsync (Context, key, async callback) return {dispatch, value, abort()} - subscribes a
    component to a single **async store field** by key.
    - returns:
      - dispatch - runs asynchronous callback
      - value - async store field
      - abort - abort the callback if the callback has not yet returned the result.
    - features:
      - key that was assigned during initialization will be used, you cannot change it
  - useStore (Context) return store - returns the store for imperative access.

### createContext ()

Creates a React Context and Provider for injecting stores.

- returns:
  - Context - React Context used by:
    - useState
    - useStateAsync
    - useStore

  - Provider - Registers store instances in the React tree.
    - props:
      - children: ReactNode
      - value: Store[]
    - value — array of store instances

- features:
  - each store must have a unique uniqId
  - duplicate stores will throw a runtime error

### Helpers

- asyncInit - сreates an initial async state
- asyncPending - creates a pending async state
- asyncFulfilled - creates a fulfilled async state
- asyncError - creates a rejected async state
- createTypedPromise(cb) - wraps a Promise executor and always resolves to an async value
  - cb function signature promise like (resolve, reject) => void

#### Types

- type IAsync\<V,E> - represents an async value stored in the store.
  - V - value type
  - E - error type
- type IAsyncValue\<T> - infers the value type from IAsync.
- type IAsyncError\<T> - infers the error type from IAsync.
- type IStoreApi - Store API provided by observable-store-light.

---

## Quick Start

```ts
import { createSlice } from 'react-store-light';

type Slice = { count: number };
const { createStore, useState } = createSlice<Slice>();
const { Provider, Context } = createContext();
const store = createStore({ count: 1 });
```

### Using the store in React

Add Provider to React tree and Componentwith selector

```tsx
const Counter = () => {
  const [count, setCount] = store.useState(Context, 'count');

  return <button onClick={() => setCount((prev) => prev + 1)}>Count: {count}</button>;
};

const ProviderComponent = () => {
  return (
    <Provider value={[store]}>
      <Counter />
    </Provider>
  );
};
```

---

### Reading and updating values outside React

```ts
const currentCount = store.get('count');

store.set('count', currentCount + 1);
```

---

### Listening to changes (side effects)

Listeners are useful for reacting to state changes without triggering renders (e.g. syncing to
`localStorage`, logging, analytics).

```ts
store.addListener('count', (key, value) => {
  console.log(`${key} changed to`, value);
});

store.removeListener('count', listener);
```

---

### Multiple Stores Example

```ts
const authStore = createStore({
  isAuthenticated: false,
});

const settingsStore = createStore({
  theme: 'dark',
});
```

Each store is completely independent and has its own state and subscriptions.

---

## License

MIT

---

## Author

**Denis Kurochkin**
