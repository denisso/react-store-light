## Changelog — v2

### Major architecture changes

* **Introduced Provider-based architecture**

  * Stores recomended be explicitly injected via a Provider.
  * Multiple stores (slices) can coexist in the same Provider.

* **`createProvider` API**

  * Accepts an array of store instances.
  * Internally maps stores by `uniqId`.
  * Prevents accidental duplication of the same store in same Provider.

* **`createSlice` API**

  * Each slice generates its own `uniqId`.
  * Guarantees strict isolation between stores.

* **`useStore(key) v1` → `useSelector(Context, key)`**

  * State access now requires explicit Context.
  * Setter is separated from state reading.
  * Supports functional updates.

---

### Async state

* **Built-in async state machine**

  * `IAsync<T, E>` with explicit lifecycle.
  * Async state lives in the store, not in components.

* **`useSelectorAsync(Context, key, async callback)` hook**

  * Dispatch + subscription in one place.
  * Built-in race condition protection.
  * Fully typed success and error paths.

---

### Type system improvements

* Stronger generics and inference.
* Runtime guards for async misuse.