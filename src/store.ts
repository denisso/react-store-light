import { useState, useEffect } from 'react';
import { Subject } from './subject';
import { error } from './error';

const errorKey = (key: PropertyKey) => {
  let strKey = `typeof ${typeof key}`;
  if (typeof key == 'string' || typeof key == 'number') {
    strKey = String(key);
  }
  error(`There is no key "${strKey}" in the store`);
};

const checkKey = (object: object, key: PropertyKey) => {
  if (object.hasOwnProperty(key)) {
    return;
  }
  errorKey(key);
};

type Store<T extends object> = keyof T extends never
  ? never
  : {
      [K in keyof T]: Subject<T[K]>;
    };

export type Listener<T> = (name: string, value: T) => void;

export const createStore = <T extends object>(initData: T) => {
  const store = {} as Store<T>;
  Object.keys(initData).forEach((key) => {
    const typedKey = key as keyof T;
    store[typedKey] = new Subject(key, initData[typedKey]) as unknown as Store<T>[keyof T];
  });

  const useStore = <K extends keyof T>(key: K): T[K] => {
    checkKey(store, key);

    const [value, setValue] = useState<T[K]>(store[key].value as T[K]);

    useEffect(() => {
      (store[key] as unknown as Subject<T[K]>).subscribe(setValue);
      return () => {
        (store[key] as unknown as Subject<T[K]>).unsubscribe(setValue);
      };
    }, [setValue, key]);

    return value;
  };

  const get = <K extends keyof T>(key: K) => {
    checkKey(store, key);
    return store[key].value as T[K];
  };

  const set = <K extends keyof T>(key: K, value: T[K], isCbCall: boolean = true) => {
    checkKey(store, key);
    (store[key] as unknown as Subject<T[K]>).notify(value, isCbCall);
  };

  const addListener = <K extends keyof T>(key: K, listener: Listener<T[K]>) => {
    checkKey(store, key);
    (store[key] as unknown as Subject<T[K]>).addListener(listener);
  };

  const removeListener = <K extends keyof T>(key: K, listener: Listener<T[K]>) => {
    checkKey(store, key);
    (store[key] as unknown as Subject<T[K]>).removeListener(listener);
  };

  return {
    useStore,
    get,
    set,
    addListener,
    removeListener,
  };
};
