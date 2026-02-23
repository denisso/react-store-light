export type Post = {
  text: string;
  meta: {
    header: string;
    author: {
      name: string;
    };
    image: {
      h: number;
      w: number;
      quality: {
        low: {
          h: number;
          w: number;
        };
        high: {
          h: number;
          w: number;
        };
      };
    };
  };
};
export const post: Post = {
  text: 'Text',
  meta: {
    header: 'Example header',
    author: {
      name: 'Some name',
    },
    image: {
      h: 800,
      w: 1200,
      quality: {
        low: {
          h: 200,
          w: 300,
        },
        high: {
          h: 1600,
          w: 2400,
        },
      },
    },
  },
};
