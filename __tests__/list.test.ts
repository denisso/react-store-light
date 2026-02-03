import { describe, it, expect } from 'vitest';
import { List, ListNode } from '../src/helpers/list';

class ListNodeNumber extends ListNode<number, ListNodeNumber> {
  val: number;
  constructor(val: number) {
    super();
    this.val = val;
  }
}

const getListNodeValues = (list: List<number, ListNodeNumber>) => {
  const result: ListNodeNumber[] = [];
  let next = list.head;
  while (next) {
    result.push(next);
    next = next.next;
  }
  return result;
};

describe('List', () => {
  it('operations add and remove', () => {
    let count = 0;
    const len = 3;
    const list = new List<number, ListNodeNumber>();

    const nodes = Array.from({ length: len }, () => new ListNodeNumber(count++));

    for (const node of nodes) {
      list.add(node);
    }

    expect(getListNodeValues(list)).toEqual(nodes);

    // last node delete
    while (nodes.length) {
      const node = nodes.pop();
      if (node) list.remove(node);
      const listNode = getListNodeValues(list);
      expect(listNode).toEqual(nodes);
    }

    for (let i = 0; i < len; i++) {
      const node = new ListNodeNumber(count++);
      nodes.push(node);
      list.add(node);
    }

    // first node delete
    while (nodes.length) {
      const node = nodes.shift();
      if (node) list.remove(node);
      const listNode = getListNodeValues(list);
      expect(listNode).toEqual(nodes);
    }

    for (let i = 0; i < len; i++) {
      const node = new ListNodeNumber(count++);
      nodes.push(node);
      list.add(node);
    }

    // middle node delete
    while (nodes.length) {
      const indx = Math.floor(nodes.length / 2);
      list.remove(nodes[indx]);
      nodes.splice(indx, 1);
      const listNode = getListNodeValues(list);
      expect(listNode).toEqual(nodes);
    }
  });
});
