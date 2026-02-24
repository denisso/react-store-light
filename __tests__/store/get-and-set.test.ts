import { describe, it, expect } from 'vitest';
import Light from '../../src';
import { Post, post } from '../data/post';

describe('Store methods', () => {
  it('get and set', () => {
    const { addListener, get, set } = Light.createStore({ count: 0 });
    let name = '';
    let value = 0;

    addListener('count', (_name: string, _value: number) => {
      name = _name;
      value = _value;
    });
    set('count', get('count') + 1);
    expect(name).toEqual('count');

    expect(value).toEqual(1);
  });

  it('Multiple props in store', () => {
    const { get, set } = Light.createStore({ count: 0, name: '' });
    set('count', get('count') + 1);
    set('name', 'test');
    expect(get('count')).toEqual(1);
    expect(get('name')).toEqual('test');
  });

  it('Update Store state from parent to children', () => {
    const _post = structuredClone(post);
    type State = {
      quality: (typeof _post)['meta']['image']['quality'];
      highH: number;
    };
    const q = Light.createStateValue(_post)('meta')('image')('quality');
    const prepValues = {
      // parent
      quality: q(),
      // children
      highH: q('high')('h')(),
    };
    const store = new Light.Store<Post, State>(_post, prepValues);
    const qualityResults: State['highH'][] = [];
    const qualityListener: Light.Listener<State, 'highH'> = (_, value) => {
      qualityResults.push(value);
    };
    store.addListener('highH', qualityListener);
    _post['meta']['image']['quality']['high']['h'] = 40;
    store.set('quality', _post['meta']['image']['quality']);
    expect(qualityResults.length).toBe(1);
    expect(qualityResults[0]).toBe(40);
  });

  it('Update Store state from children to parent', () => {
    const _post = structuredClone(post);
    type State = {
      quality: (typeof _post)['meta']['image']['quality'];
      highH: number;
    };
    const q = Light.createStateValue(_post)('meta')('image')('quality');
    const prepValues = {
      // parent
      quality: q(),
      // children
      highH: q('high')('h')(),
    };
    const store = new Light.Store<Post, State>(_post, prepValues);
    const qualityResults: State['quality'][] = [];
    const qualityListener: Light.Listener<State, 'quality'> = (_, value) => {
      qualityResults.push(value);
    };
    store.addListener('quality', qualityListener);
    store.set('highH', 20);
    expect(qualityResults.length).toBe(1);
    expect(qualityResults[0]['high']['h']).toBe(20);
  });

  it('Store.setState and Store.setObject', () => {
    const _post = structuredClone(post);
    const p = Light.createStateValue(_post);
    const m = p('meta');
    const q = p('meta')('image')('quality');

    type State = {
      quality: Post['meta']['image']['quality'];
      meta: Post['meta'];
      lowH: number;
      lowW: number;
      highH: number;
      highW: number;
    };

    const preValues = {
      quality: q(),
      meta: m(),
      lowH: q('high')('h')(),
      lowW: q('high')('w')(),
      highH: q('low')('h')(),
      highW: q('low')('w')(),
    };

    const store = new Light.Store<Post, State>(_post, preValues);

    const resultsTest: any[] = [];
    const listener = (_: string, value: any) => {
      resultsTest.push(value)
    };
    store.addListener('highH', listener);
    store.addListener('highW', listener);
    store.addListener('lowW', listener);
    store.addListener('lowH', listener);
    store.addListener('meta', listener);
    store.addListener('quality', listener);

    const state = store.getState(true);

    state.highH = 140;
    state.highW = 140;
    store.setState(state);

    expect(resultsTest.length).toBe(6)
    
  });
});
