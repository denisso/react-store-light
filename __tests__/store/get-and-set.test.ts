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

  it('From parent to children', () => {
    const _post = structuredClone(post);
    type State = {
      quality: (typeof _post)['meta']['image']['quality'];
      highH: number;
    };
    const q = Light.getStateValue(_post)('meta')('image')('quality');
    const prepValues = {
      quality: q(),
      highH: q('high')('h')(),
    };
    const store = new Light.Store<Post, State>(_post, prepValues);
    const qualityResults: State['highH'][] = [];
    const qualityListener: Light.Listener<State, 'highH'> = (_, value) => {
      qualityResults.push(value);
    };
    store.addListener('highH', qualityListener);
    _post["meta"]["image"]["quality"]["high"]["h"] = 40
    store.set('quality', _post["meta"]["image"]["quality"]);
    expect(qualityResults.length).toBe(1);
    expect(qualityResults[0]).toBe(40);
  });

  it('From children to parent', () => {
    const _post = structuredClone(post);
    type State = {
      quality: (typeof _post)['meta']['image']['quality'];
      highH: number;
    };
    const q = Light.getStateValue(_post)('meta')('image')('quality');
    const prepValues = {
      quality: q(),
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
});
