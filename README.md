# react-store-light

A lightweight observer-based state manager for React.

`react-store-light` gives you:

- a tiny store with key-level subscriptions;
- React hooks powered by `useSyncExternalStore`;
- optional context-based dependency injection;
- typed aliases for nested state paths.

## Installation

```bash
npm install react-store-light
```

Peer dependency:

- `react >= 18`

## Quick Start

```tsx
import React from 'react';
import { createStore, useState } from 'react-store-light';

type CounterState = {
  count: number;
};

const counterStore = createStore<CounterState>({ count: 0 });

export function Counter() {
  const [count, setCount] = useState(counterStore, 'count');

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## Core API

### `createStore(initialState)` / `new Store(initialState)`

Creates an isolated store instance.

Store methods:

- `get(key)` - read a top-level key;
- `set(key, value)` - update a top-level key and notify listeners;
- `subscribe(key, listener)` - subscribe to key updates;
- `getValues(isDeepCopy?)` - get full state object;
- `setValues(values)` - replace full state and broadcast updates.

### `useState(storeOrIdOrAliases, key)`

Subscribes React component to one field and returns:

- current value;
- setter function for that field.

Supported first argument types:

- `Store<T>`;
- `Aliases<T>`;
- context id (`createContextId`) for either `Store` or `Aliases`.

### Context helpers

- `createContextId<T>(name?)` - creates a typed symbol id;
- `Provider` - injects stores/aliases by symbol ids;
- `useContextId(id)` - resolves a value from `Provider`.

## Using Provider and Context IDs

```tsx
import React from 'react';
import {
  createStore,
  createContextId,
  Provider,
  useState,
  Store,
} from 'react-store-light';

type AppState = { count: number };

const store = createStore<AppState>({ count: 0 });
const STORE_ID = createContextId<Store<AppState>>('counter-store');

function Counter() {
  const [count, setCount] = useState(STORE_ID, 'count');
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

export function App() {
  return (
    <Provider value={{ [STORE_ID]: store }}>
      <Counter />
    </Provider>
  );
}
```

## Nested Data with Aliases

`Store` works with top-level keys.  
If you need direct subscriptions to deep paths, create aliases:

```tsx
import { createStore, createAlias, Aliases, useState } from 'react-store-light';

type Post = {
  meta: {
    title: string;
    tags: string[];
  };
};

const postsStore = createStore<Record<string, Post>>({
  p1: { meta: { title: 'Hello', tags: ['react'] } },
});

const makePostAliases = (id: string) => {
  const a = createAlias(postsStore)(id);
  return {
    title: a('meta')('title'),
    tags: a('meta')('tags'),
  };
};

const post = new Aliases(makePostAliases('p1'));

function PostTitle() {
  const [title, setTitle] = useState(post, 'title');
  return <input value={title} onChange={(e) => setTitle(e.target.value)} />;
}
```

## TypeScript

The library is written in TypeScript and exports types for:

- `Store`;
- `Listener`;
- `CreatePath` / `CreateAlias`;
- context id typing (`IContextValueId`).

## Scripts (for this repo)

- `npm run build` - build package with `tsup`;
- `npm run test` - run tests with `vitest`;
- `npm run typecheck` - run TypeScript checks.

## License

MIT
