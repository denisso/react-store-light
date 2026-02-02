class ListNode<T> {
  val: T;
  next: ListNode<T> | null;
  prev: ListNode<T> | null;
  constructor(val: any, next: ListNode<T> | null = null, prev: ListNode<T> | null = null) {
    this.val = val;
    this.next = next;
    this.prev = prev;
  }
}
class List<T> {
  head: ListNode<T> | null;
  tail: ListNode<T> | null;
  constructor() {
    this.head = null;
    this.tail = null;
  }
  add(val: T) {
    let node = new ListNode<T>(val);
    if (!this.tail) {
      this.head = node;
      this.tail = node;
      return [
        node.val,
        () => {
          this.delete(node);
        },
      ];
    }
    node.prev = this.tail.prev;
    node.prev = this.tail;
    this.tail.next = node;
    this.tail = node;
  }
  delete(node: ListNode<T>) {
    if (!node) return;
    if (node === this.head) {
      if (!node.next) {
        this.head = null;
        this.tail = null;
      }
      this.head = node.next;
      return;
    }
    const prev = node.prev;
    if (prev) {
      prev.next = node.next;
    }

    const next = node.next;
    if (next) next.prev = prev;
    if (this.tail === node) {
      this.tail = prev;
    }
  }
}
