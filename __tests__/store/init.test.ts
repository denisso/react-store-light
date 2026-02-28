import { describe, it, expect } from 'vitest';
import Light from '../../src';
import { Post, posts } from '../data/post';

describe('Store init', () => {
  const ids: string[] = posts.map((post) => post.id);

  const parentStore = Light.createStore({ ids });
  const postsById = posts.reduce<Record<string, Post>>((a, post) => {
    a[post.id] = post;
    return a;
  }, {});

  const postStoresById = posts.reduce<Record<string, Light.Store<Post>>>((a, post) => {
    a[post.id] = Light.createStore(post);
    return a;
  }, {});

  
});
