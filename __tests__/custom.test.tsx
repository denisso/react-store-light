import { describe, it, expect } from 'vitest';
import Light from '../src';
import { Post, posts } from './data/post';



describe('Store init', () => {
  const ids: string[] = posts.map((post) => post.id);

  const parentStore = Light.createStore({ ids });
  const postsById = posts.reduce<Record<string, Post>>((a, post) => {
    a[post.id] = post;
    return a;
  }, {});

  const useChunk = (f: Function, id: any) => {
    return f(id);
  };
  type StoreType = {
    ids: string[];
  };
  const store = new Light.Store<StoreType>({ ids });

  const Parent = () => {
    const arrayIds = Light.useState(store, 'ids');
    return (
      <>
        {arrayIds.map((id) => (
          <Child id={id} key={id} />
        ))}
      </>
    );
  };


  class V {

  }

  type Props = { id: string };
  const Child = ({ id }: Props) => {
    return null;
  };
});
