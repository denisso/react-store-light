import React from 'react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { render, act, screen, waitFor } from '@testing-library/react';
import Light, { HubStore } from '../src';

describe('Tree stores', () => {
  it('Update from top to bottom', () => {
    type Counter = { id: number; count: number };
    type Counters = { counters: Counter[] };
    // root
    const rootStoreId = Light.createContextValueId<Light.Store<Counters>>();
    const rootStore = Light.createStore<Counters>({ counters: [{ id: 0, count: 0 }] });

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
      const [counters] = Light.useState(rootStoreId, 'counters');
      return (
        <>
          {counters.map((counter) => (
            <CounterChild key={counter.id} counter={counter} />
          ))}
        </>
      );
    };

    render(
      <Light.Provider value={{ [rootStoreId]: rootStore }}>
        <RootComponent />
      </Light.Provider>,
    );

    act(() => {
      // test it
      rootStore.set('counters', [{ id: 0, count: 2 }]);
    });
    expect(results).toEqual([0, 2]);
  });

  it('Usage HubStore for connect Writer and Reader with ref, mount and remount', () => {
    type Counter = { id: number; count: number };

    // counter
    const counterHub = Light.createHub<Counter>();
    const counterStoreId = Light.createContextValueId<Light.Store<Counter>>();

    // for test
    let setCountFromWriter: (count: number) => void = () => {
      throw Error('setCountFromWriter not assigned');
    };

    let results: number[] = [];

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

      setCountFromWriter = (count) => {
        counterStore.set('count', count);
      };
      return null;
    };

    type Props = { counter: Counter };
    const ReaderProvider = ({ counter }: Props) => {
      const counterStore = Light.useCreateHubStore(counter, counterHub);

      return (
        <Light.Provider value={{ [counterStoreId]: counterStore }}>{<Reader />}</Light.Provider>
      );
    };
    const WriterProvider = ({ counter }: Props) => {
      const counterStore = Light.useCreateHubStore(counter, counterHub);

      return (
        <Light.Provider value={{ [counterStoreId]: counterStore }}>{<Writer />}</Light.Provider>
      );
    };

    let setCounterFromRoot: (counter: Counter) => void = () => {
      throw Error('setCounterTest not assigned');
    };

    let copyState = { id: 0, count: 0 };
    let currentState = { ...copyState };
    const CounterWrapper = () => {
      const [counter, setCounter] = React.useState<Counter>(currentState);
      setCounterFromRoot = setCounter;
      return (
        <>
          <ReaderProvider counter={counter} />
          <WriterProvider counter={counter} />
        </>
      );
    };

    render(<CounterWrapper />);
    results = [];
    act(() => {
      setCountFromWriter((copyState.count += 2));
    });

    expect(results).toEqual([currentState.count]);
    expect(results.length).toBe(1);
    expect(copyState.count).toEqual(currentState.count);

    copyState.count += 2;
    currentState = structuredClone(copyState);

    results = [];
    act(() => {
      setCounterFromRoot(currentState);
    });

    expect(results).toEqual([currentState.count]);
    expect(results.length).toBe(1);

    results = [];
    act(() => {
      setCountFromWriter((copyState.count += 2));
    });
    expect(results).toEqual([currentState.count]);
    expect(results.length).toBe(1);
    expect(copyState.count).toEqual(currentState.count);
  });

  it('Build store tree and update state each store usage Hub.update', async () => {
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

  it('Custom Hub Store', () => {
    type Counter = { count: number };
    class CustomHubStore extends HubStore<Counter> {
      getSustomState() {
        return super.getState();
      }
    }

    const counterStoreId = Light.createContextValueId<CustomHubStore>();
    const hub = Light.createHub<Counter>();

    const testResults: Counter[] = [];
    const StoreCounterComp = () => {
      const custoStore = Light.useStore(counterStoreId);
      testResults.push(custoStore.getSustomState());
      return null;
    };
    type Props = { counter: Counter };
    const CounterProvicer = ({ counter }: Props) => {
      const storeCounter = Light.useCreateHubStore(counter, hub, CustomHubStore);
      return (
        <Light.Provider value={{ [counterStoreId]: storeCounter }}>
          <StoreCounterComp />
        </Light.Provider>
      );
    };
    let countersArr: Counter[] = Array.from({ length: 3 }, (_, i) => ({ count: i }));
    const CountersComp = () => {
      const [counters] = React.useState(countersArr);
      return (
        <>
          {counters.map((counter) => (
            <CounterProvicer counter={counter} key={counter.count} />
          ))}
        </>
      );
    };
    render(<CountersComp />);

    expect(countersArr.sort()).toEqual(testResults.sort());
  });
});
