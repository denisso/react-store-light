import { describe, it, expect } from 'vitest';
import { ListNode, addListNode, removeListNode } from '../src/helpers/list';

class ListNodeNumber extends ListNode<ListNodeNumber> {
  val: number;
  constructor(val: number) {
    super();
    this.val = val;
  }
}

const getListNodeValues = (head: ListNodeNumber | null) => {
  const result: ListNodeNumber[] = [];
  let __next = head;
  while (__next) {
    result.push(__next);
    __next = __next.__next;
  }
  return result;
};

describe('List', () => {
  it('addListNode and removeListNode', () => {
    let count = 0;
    const len = 3;
    let head: ListNodeNumber | null = null;

    const nodes = Array.from({ length: len }, () => new ListNodeNumber(count++));

    for (const node of nodes) {
      head = addListNode(node, head);
    }

    expect(getListNodeValues(head).sort((a, b) => a.val - b.val)).toEqual(
      nodes.sort((a, b) => a.val - b.val),
    );

    // last node delete
    while (nodes.length) {
      const node = nodes.pop();
      if (node) head = removeListNode(node, head);
      const listNode = getListNodeValues(head).sort((a, b) => a.val - b.val);
      expect(listNode).toEqual(nodes.sort((a, b) => a.val - b.val));
    }

    for (let i = 0; i < len; i++) {
      const node = new ListNodeNumber(count++);
      nodes.push(node);
      head = addListNode(node, head);
    }

    // first node delete
    while (nodes.length) {
      const node = nodes.shift();
      if (node) head = removeListNode(node, head);
      const listNode = getListNodeValues(head).sort((a, b) => a.val - b.val);
      expect(listNode).toEqual(nodes.sort((a, b) => a.val - b.val));
    }

    for (let i = 0; i < len; i++) {
      const node = new ListNodeNumber(count++);
      nodes.push(node);
      head = addListNode(node, head);
    }

    const nodesCopy = [...nodes]
    // middle node delete
    while (nodes.length) {
      const indx = Math.floor(nodes.length / 2);
      head = removeListNode(nodes[indx], head);
      nodes.splice(indx, 1);
      const listNode = getListNodeValues(head).sort((a, b) => a.val - b.val);
      expect(listNode).toEqual(nodes.sort((a, b) => a.val - b.val));
    }

    expect(head).toEqual(null);

    for (const node of nodesCopy) {
      expect(node.__next).toEqual(null);
      expect(node.__prev).toEqual(null);
    }
  });
});
