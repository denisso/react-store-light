import React from 'react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { render, act, screen, waitFor } from '@testing-library/react';
import Light from '../src';

describe('Tree stores', () => {
  it('Update top bottom', () => {
    type Counter = { id: number; count: number };
    type Counters = { counters: Counter[] };
    // global
    const globalStoreId = Light.createContextValueId<Light.Store<Counters>>();
    const globalStore = Light.createStore<Counters>({ counters: [{ id: 0, count: 0 }] });

    // counter
    const counterHub = Light.createHub<Counter>();
    const counterStoreId = Light.createContextValueId<Light.Store<Counter>>();

    // for test
    const results: Counter['count'][] = [];

    // tree
    const CounterState = () => {
      const [count] = Light.useState(counterStoreId, 'count');
      React.useEffect(() => {
        results.push(count);
      }, [count]);
      return null;
    };
    const CounterChild = ({ counter }: { counter: Counter }) => {
      const counterStore = Light.useCreateHubStore(counter, counterHub);

      return (
        <Light.Provider value={{ [counterStoreId]: counterStore }}>
          {<CounterState />}
        </Light.Provider>
      );
    };

    const RootComponent = () => {
      const [counters] = Light.useState(globalStoreId, 'counters');
      return (
        <>
          {counters.map((counter) => (
            <CounterChild key={counter.id} counter={counter} />
          ))}
        </>
      );
    };

    render(
      <Light.Provider value={{ [globalStoreId]: globalStore }}>
        <RootComponent />
      </Light.Provider>,
    );

    act(() => {
      // test it
      globalStore.set('counters', [{ id: 0, count: 2 }]);
    });
    expect(results).toEqual([0, 2]);
  });

  it('Usage HubStore for connect Writer and Reader', () => {
    type Counter = { id: number; count: number };
    const counter: Counter = { id: 0, count: 0 };

    // counter
    const counterHub = Light.createHub<Counter>();
    const counterStoreId = Light.createContextValueId<Light.Store<Counter>>();

    // for test
    let writeCountSet: (count: number) => void;
    const results: number[] = [];

    // counter Reader
    const Reader = () => {
      const [count] = Light.useState(counterStoreId, 'count');

      React.useEffect(() => {
        results.push(count);
      }, [count]);
      return null;
    };

    // counter Writer
    const Writer = () => {
      const counterStore = Light.useStore(counterStoreId);

      writeCountSet = (count) => {
        const state = counterStore.getState();
        state.count = count;
        counterHub.updateState(state);
      };
      return null;
    };
    const CounterReader = () => {
      const counterStore = Light.useCreateHubStore(counter, counterHub);

      return (
        <Light.Provider value={{ [counterStoreId]: counterStore }}>{<Reader />}</Light.Provider>
      );
    };
    const CounterWriter = () => {
      const counterStore = Light.useCreateHubStore(counter, counterHub);

      return (
        <Light.Provider value={{ [counterStoreId]: counterStore }}>{<Writer />}</Light.Provider>
      );
    };

    render(
      <>
        <CounterReader />
        <CounterWriter />
      </>,
    );

    act(() => {
      writeCountSet(2);
    });

    expect(results).toEqual([0, 2]);
  });

  it('build store tree and update state each store usage Hub.update', async () => {
    type TreeNode = { id: string; value: number; nodes: TreeNode[] };

    type Tree = Record<string, { value: number; nodes?: string[] }>;
    const tree: Tree = {
      root: { value: 0, nodes: ['1', '2'] },
      1: { value: 0, nodes: ['1.1', '1.2'] },
      '1.1': { value: 0, nodes: ['1.1.1', '1.1.2'] },
      '1.1.1': { value: 0 },
      '1.1.2': { value: 0 },
      '1.2': { value: 0, nodes: ['1.2.1', '1.2.2'] },
      '1.2.1': { value: 0 },
      '1.2.2': { value: 0 },
      2: { value: 0, nodes: ['2.1', '2.2'] },
      '2.1': { value: 0, nodes: ['2.1.1', '2.1.2'] },
      '2.1.1': { value: 0 },
      '2.1.2': { value: 0 },
      '2.2': { value: 0, nodes: ['2.2.1', '2.2.2'] },
      '2.2.1': { value: 0 },
      '2.2.2': { value: 0 },
    };

    const createNode = (parent: TreeNode, nodes: string[], tree: Tree) => {
      for (const id of nodes) {
        const treeNode = tree[id];
        const node: TreeNode = { id, value: treeNode.value, nodes: [] };
        parent.nodes.push(node);
        if (treeNode.nodes) {
          createNode(node, treeNode.nodes, tree);
        }
      }
    };
    const createTree = (tree: Tree) => {
      const treeNode = tree['root'];
      const root: TreeNode = { id: 'root', value: treeNode.value, nodes: [] };
      createNode(root, treeNode.nodes ?? [], tree);
      return root;
    };
    const root = createTree(tree);

    const hub = Light.createHub<TreeNode>();

    type Props = { node: TreeNode };
    const storeId = Light.createContextValueId<Light.Store<TreeNode>>();

    let testResults: { id: string; value: number }[] = [];

    function Value() {
      const [id] = Light.useState(storeId, 'id');
      const [value, setValue] = Light.useState(storeId, 'value');
      React.useEffect(() => {
        testResults.push({ id, value });
      }, [id, value]);
      const handlerClick = () => {
        setValue((prev) => prev + 1);
      };
      return <button onClick={handlerClick}>{id}</button>;
    }

    function Children() {
      const [nodes] = Light.useState(storeId, 'nodes');
      return (
        <>
          {nodes.map((node) => (
            <Parent node={node} key={node.id} />
          ))}
          <Value />
        </>
      );
    }

    function Parent({ node }: Props) {
      const store = Light.useCreateHubStore(node, hub);
      return (
        <Light.Provider value={{ [storeId]: store }}>
          <Children />
        </Light.Provider>
      );
    }
    render(<Parent node={root} />);

    const labels = Object.keys(tree);

    const buttons: Record<string, HTMLButtonElement> = {};

    // check the text of each button
    labels.forEach((label) => {
      buttons[label] = screen.getByRole('button', { name: label });
      expect(buttons[label]).toBeInTheDocument();
    });
    const user = userEvent.setup();

    // after first render
    expect(testResults.sort((a, b) => a.id.localeCompare(b.id))).toEqual(
      labels.map((id) => ({ id, value: 0 })).sort((a, b) => a.id.localeCompare(b.id)),
    );
    testResults = [];

    // click each button
    for (const label of labels) {
      await user.click(buttons[label]);
      expect(testResults).toEqual([{ id: label, value: 1 }]);
      testResults = [];
    }

    // change state each store to 0 usage ref
    const dfs = async (parent: TreeNode) => {
      hub.updateKey(parent, 'value', 0);
      await waitFor(() => {
        expect(testResults).toEqual([{ id: parent.id, value: 0 }]);
      });
      testResults = [];
      for (const child of parent.nodes) {
        await dfs(child);
      }
    };

    dfs(root);
  });
});
