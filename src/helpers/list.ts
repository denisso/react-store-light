export class ListNode<N extends ListNode<N>> {
  next: N | null = null;
  prev: N | null = null;
}

export const addListNode = <N extends ListNode<N>>(node: N, head?: N | null) => {
  node.prev = null;
  node.next = null;
  if (!head) {
    return node;
  }

  node.next = head;
  head.prev = node;
  return node;
};

export const removeListNode = <N extends ListNode<N>>(node: N, head?: N | null) => {
  if (!head) {
    return null;
  }
  const next = node.next;
  const prev = node.prev;
  node.prev = null;
  node.next = null;

  if (node === head) {
    if (next) {
      next.prev = null;
    }
    return next;
  }
  if (!next) {
    // delete  tail
    if (prev) {
      prev.next = null;
    }
  } else {
    if (prev) {
      prev.next = next;
    }
    if (next) {
      next.prev = prev;
    }
  }
  return head;
};
