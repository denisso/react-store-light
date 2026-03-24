import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Light from '../../src';
import { dictPosts } from '../__stubs__/posts';

describe('Context', () => {
  it('Provider', () => {
    const state = { posts: structuredClone(dictPosts), ids: Object.keys(dictPosts) };
    const store = new Light.Store(state);
    const createPostAliases = (id: string) => {
      const p = Light.createAlias(store)('posts')(id);
      const aliases = {
        id: p('id'),
        text: p('text'),
      };
      return aliases;
    };

    class PostAliases extends Light.Aliases<ReturnType<typeof createPostAliases>> {}

    const contextIdPostAliases = Light.createContextId<PostAliases>();
    type Props = { id: string };
    const PostFields = () => {
      const postAlias = Light.useContextId(contextIdPostAliases)
      const [text] = Light.useState(postAlias, 'text');
      const [id] = Light.useState(postAlias, 'id');
      React.useEffect(() => {
        expect(text).toEqual(dictPosts[id]['text']);
      }, [text, id]);
      return null;
    };

    const Post = ({ id }: Props) => {
      const [postAlias] = React.useState(() => {
        return new PostAliases(createPostAliases(id));
      });
      return (
        <Light.Provider value={{ [contextIdPostAliases]: postAlias }}>
          <PostFields />
        </Light.Provider>
      );
    };

    const Parent = () => {
      const [ids] = Light.useState(store, 'ids');
      return (
        <>
          {ids.map((id) => (
            <Post id={id} key={id} />
          ))}
        </>
      );
    };

    render(<Parent />);
  });
});
