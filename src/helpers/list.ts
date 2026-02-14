export class ListNode<N extends ListNode<N>> {
  __next: N | null = null;
  __prev: N | null = null;
}

export const addListNode = <N extends ListNode<N>>(node: N, head?: N | null) => {
  node.__prev = null;
  node.__next = null;
  if (!head) {
    return node;
  }

  node.__next = head;
  head.__prev = node;
  return node;
};

export const removeListNode = <N extends ListNode<N>>(node: N, head?: N | null) => {
  if (!head) {
    return null;
  }
  const __next = node.__next;
  const __prev = node.__prev;
  node.__prev = null;
  node.__next = null;

  if (node === head) {
    if (__next) {
      __next.__prev = null;
    }
    return __next;
  }
  if (!__next) {
    // delete  tail
    if (__prev) {
      __prev.__next = null;
    }
  } else {
    if (__prev) {
      __prev.__next = __next;
    }
    if (__next) {
      __next.__prev = __prev;
    }
  }
  return head;
};
