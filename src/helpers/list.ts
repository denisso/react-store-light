export class ListNode<T, N extends ListNode<T, N>> {
  next: N | null = null;
  prev: N | null = null;
}


export class List<T, LN extends ListNode<T, LN>> {
  head: LN | null;
  tail: LN | null;
  constructor() {
    this.head = null;
    this.tail = null;
  }
  add(node: LN) {
    if (!this.tail) {
      this.head = node;
      this.tail = node;
    }
    // add to tail
    node.prev = this.tail;
    this.tail.next = node;
    this.tail = node;
  }
  remove(node: LN) {
    if (!this.tail && !this.head) {
      return;
    }

    const next = node.next as LN;
    const prev = node.prev as LN;

    node.prev = null;
    node.next = null;

    if (node === this.head) {
      this.head = next;
      if (this.head) this.head.prev = null;
    } else if (node === this.tail) {
      this.tail = prev;
      if (this.tail) this.tail.next = null;
    } else {
      if (prev) {
        prev.next = next;
      }
      if (next) {
        next.prev = prev;
      }
    }
  }
}
