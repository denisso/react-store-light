export abstract class AbstractStore {
  readonly __brand = 'Store';
  abstract get(key: PropertyKey): unknown;
  abstract set(key: PropertyKey, value: unknown): void;
  abstract getState(): unknown;
  abstract setState(state: unknown): void;
  abstract addListener(key: PropertyKey, listener: Function): void
  abstract removeListener(key: PropertyKey, listener: Function): void
}
