---
title: "Array-Based Trees"
date: 2022-08-18T01:23:24-04:00
draft: true
math: true
---

This is a tree!
![](/shorts/images/tree.svg)
It's a [directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph) (DAG) where each node has a single parent (except the root). What makes this one special, though, is that each of its nodes have at most two children -- a binary tree.

## Pointer-Based Tree
Binary trees are useful for all sorts of stuff. One way to implement them is by allocating an object for each node which stores a pointer to its parent and both its children. Kinda like this!
```c++
struct BinaryTree
{
    int size;
    Node *root;
}

struct Node
{
    int key;
    Node *parent;
    Node *left_child;
    Node *right_child;
}
```
### Pros
1. **Intuitive.** The pointer-based solution allows you to easily traverse the tree without further computation: simply follow the pointers stored in each `Node`!
### Cons
1. **Slow.** If you want to reach a node which is many layers deep, you have to traverse each child node one-by-one.
2. **Memory Inefficient.** Each node must store the addresses of its parent and children. These days, C++ integers are $4$ bytes, while addresses are a whopping $8$ bytes. That means a pointer-based tree will use $(3 \cdot 8) / 4 = 6\ \times$ more memory than if they just stored their `key`! Not only that, we have no guarantee on where each `Node` object will be allocated in memory. Modern CPUs load memory in contiguous chunks called [*cache blocks*](https://en.wikipedia.org/wiki/CPU_cache#Cache_entries) -- with `Node` objects scattered all over the address space, we'll need to waste a lot of CPU cycles loading in different blocks.
## Array-Based Tree
There's another, super-cool way to represent binary trees, though: using an array!
![](/shorts/images/array-based-tree.svg)
To do so, we can index each node in [level-order](https://en.wikipedia.org/wiki/Tree_traversal#Breadth-first_search). That just means we order the nodes from top-to-bottom, then left-to-right. We end up with an array where the nodes in each layer are stored contiguously, one layer after another. Each element of the array just stores the key of the corresponding node.

It might look like a flat log, but it's still a beautiful, branching tree! 

How will we ever find our parents? Where did our children go? Fear not: there's a simple formula. If we are node $i$, then our parent and child nodes are given by the following:
![](/shorts/images/tree-formula.svg)
Let's see where these formulas actually come from. Let's call $n = 0$ is the index of the root layer and $k = 0$ is the index of the leftmost node within a given layer.
- The $k = 0$ node in layer $n = 0$ (the root node) is at index $0$
- The $k = 0$ node in layer $n = 1$ is at index $1$
- The $k = 0$ node in layer $n = 2$ is at index $3$
- The $k = 0$ node in layer $n = 3$ is at index $7$

Do you see a pattern? The first node in the $n\text{th}$ layer is at index $$i = 2^0 + 2^1 + \cdots + 2^{n-1} = \sum_{j = 0}^{n - 1} 2^j.$$ In a complete binary tree, the number of nodes doubles for each new layer, meaning there are $2^n$ nodes in layer $n$. So, the index for the $k\text{th}$ node in layer $n$ (where $k \in [0, 1, \ldots, 2^n - 1]$) is given by $$i = \left(\sum_{j = 0}^{n - 1} 2^j\right) + k.$$

The parent of $i$ is the $\lfloor (k - 1) / 2 \rfloor\text{th}$ found on layer $n - 1$.

Let's find the parent of node $i$, which we know lives on the $n - 1\text{st}$ layer of the tree. 


