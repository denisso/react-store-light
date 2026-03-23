type Image = {
  h: number;
  w: number;
  src: string;
  alt: string;
};
export type Post = {
  id: string;
  text: string;
  images: Image[];
  meta: {
    tags: string[];
    header: string;
    author: {
      name: string;
    };
  };
};

export const posts: Post[] = [
  {
    id: 'post-1',
    text: 'Today I visited the amazing Caucasus Mountains. The views and fresh air were incredible!',
    images: [
      {
        h: 1080,
        w: 1920,
        src: 'https://example.com/images/caucasus1.jpg',
        alt: 'Panoramic view of the Caucasus Mountains',
      },
      {
        h: 720,
        w: 1280,
        src: 'https://example.com/images/caucasus2.jpg',
        alt: 'Close-up of a mountain peak in the Caucasus',
      },
    ],
    meta: {
      tags: ['nature', 'travel', 'mountains'],
      header: 'Adventures in the Caucasus',
      author: {
        name: 'Alexey Ivanov',
      },
    },
  },
  {
    id: 'post-2',
    text: 'The perfect homemade bread recipe: simple, yet delicious. Give it a try!',
    images: [
      {
        h: 800,
        w: 600,
        src: 'https://example.com/images/bread1.jpg',
        alt: 'Freshly baked homemade bread on a wooden table',
      },
    ],
    meta: {
      tags: ['cooking', 'recipes', 'homemade'],
      header: 'Homemade Bread in 5 Steps',
      author: {
        name: 'Maria Petrova',
      },
    },
  },
  {
    id: 'post-3',
    text: 'A new contemporary art exhibition has opened in the city center. Don’t miss it!',
    images: [
      {
        h: 1200,
        w: 800,
        src: 'https://example.com/images/art1.jpg',
        alt: 'Abstract painting at the contemporary art exhibition',
      },
      {
        h: 900,
        w: 1600,
        src: 'https://example.com/images/art2.jpg',
        alt: 'Sculpture installation in the exhibition hall',
      },
      {
        h: 600,
        w: 800,
        src: 'https://example.com/images/art3.jpg',
        alt: 'Visitors admiring modern art pieces',
      },
    ],
    meta: {
      tags: ['art', 'exhibition', 'culture'],
      header: 'Contemporary Art: New Horizons',
      author: {
        name: 'Ivan Sidorov',
      },
    },
  },
  {
    id: 'post-4',
    text: 'How to properly care for indoor plants in winter? My tips and life hacks.',
    images: [
      {
        h: 1000,
        w: 800,
        src: 'https://example.com/images/plants1.jpg',
        alt: 'Green indoor plants in winter sunlight',
      },
    ],
    meta: {
      tags: ['plants', 'care', 'winter garden'],
      header: 'Winter Plant Care',
      author: {
        name: 'Olga Kuznetsova',
      },
    },
  },
];

export const dictPosts = posts.reduce<Record<string, Post>>((a, post) => {
  a[post.id] = post;
  return a;
}, {});
