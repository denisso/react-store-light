import { State } from '../state';
export abstract class AbstractStore {
  readonly __brand = 'Store';
  abstract get(key: PropertyKey): unknown;
  abstract set(key: PropertyKey, value: unknown): void;
  abstract getState(): State;
  abstract setValues(values: Record<string, any>): void;
  abstract getValues(): unknown;
  abstract subscribe(key: PropertyKey, listener: Function): void;
}
