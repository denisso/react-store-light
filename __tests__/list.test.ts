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
    next = next.next
  }
  return result;
};

describe('List', () => {
  it('operations add and remove', () => {
    let count = 0;
    const list = new List<number, ListNodeNumber>();

    const nodes = Array.from({ length: 5 }, () => new ListNodeNumber(count++));

    for (const node of nodes) {
      list.add(node);
    }

    expect(getListNodeValues(list)).toEqual(nodes);
    
    list.remove(nodes[0]);
    nodes.splice(0, 1);
    expect(getListNodeValues(list)).toEqual(nodes);

    while (nodes.length) {
      const node = nodes.pop();
      if (node) list.remove(node);
      expect(getListNodeValues(list)).toEqual(nodes);
    }
  });
});
