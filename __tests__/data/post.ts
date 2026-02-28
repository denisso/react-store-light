export type Post = {
  id: string;
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
export const posts: Post[] = [
  {
    id: '1',
    text: 'Text 1',
    meta: {
      header: 'Example header 1',
      author: {
        name: 'Some name',
      },
      image: {
        h: 700,
        w: 1100,
        quality: {
          low: {
            h: 300,
            w: 400,
          },
          high: {
            h: 1400,
            w: 2200,
          },
        },
      },
    },
  },
  {
    id: '2',
    text: 'Text 2',
    meta: {
      header: 'Example header 1',
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
  },
];
