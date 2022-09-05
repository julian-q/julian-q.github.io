# Array-Based Trees

This is a tree!

![](content/img/tree.svg)

It's a [directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph) (DAG) where each node has a single parent (except the root). What makes this one special, though, is that each of its nodes have at most two children -- a binary tree.

## Pointer-Based Tree
Binary trees are useful for all sorts of stuff. One way to implement them is by allocating an object for each node which stores a pointer to its parent and both its children. Kinda like this!

```c++
struct Node
{
    int key;
    Node *parent;
    Node *left_child;
    Node *right_child;
};

struct BinaryTree
{
    int size;
    Node *root;
};
```

### Pros
1. **Intuitive.** The pointer-based solution allows you to easily traverse the tree without further computation: simply follow the pointers stored in each `Node`!
2. **Nice Memory Scaling**. The total memory used by the pointer-based tree is proportional to the number of nodes.

### Cons
1. **Potentially Slow Access.** If you want to reach a node which is many levels deep, you have to traverse each child node one-by-one starting from the root.
2. **More Memory Per-Node.** Each node must store the addresses of its parent and children. These days, C++ integers are $4$ bytes, while addresses are a whopping $8$ bytes. That means a (complete) pointer-based tree will use $(3 \cdot 8) / 4 = 6\ \times$ more memory than if they just stored their `key`! 
3. **Bad Locality.** We have no guarantee on where each `Node` object will be allocated in memory. Modern CPUs load memory in contiguous chunks called [*cache blocks*](https://en.wikipedia.org/wiki/CPU_cache#Cache_entries) -- with `Node` objects scattered all over the address space, we'll need to waste a lot of CPU cycles loading in different blocks.

## Array-Based Tree
There's another, super-cool way to represent binary trees, though: using an array!

![](content/img/array-based-tree.svg)

To do so, we can index each node in [level-order](https://en.wikipedia.org/wiki/Tree_traversal#Breadth-first_search). That just means we order the nodes from top-to-bottom, then left-to-right. We end up with an array where the nodes in each level are stored contiguously, one level after another. Each element of the array just stores the key of the corresponding node.

It might look like a flat log, but it's still a beautiful, branching tree! 

How will we ever find our parents? Where did our children go? Fear not: there's a simple formula. If we are node $i$, then our parent and child nodes are given by the following:

![](content/img/tree-formula.svg)

Let's see where these formulas actually come from. To do so, we need to establish a way to talk about specific nodes in the tree. Let $n$ be the level of the tree a node resides in, and call $n = 0$ the index of the very top level. Let $k$ be the left-to-right position of a node in a given level. Let's say $k = 0$ is the index of the leftmost node. We'll start by listing off where the first node in each level lands in the array.

![](content/img/array.svg)

- The $k = 0$ node in level $n = 0$ (the root node) is at index $0$
- The $k = 0$ node in level $n = 1$ is at index $1$
- The $k = 0$ node in level $n = 2$ is at index $3$
- The $k = 0$ node in level $n = 3$ is at index $7$

Do you see a pattern? The first ($k = 0$) node in the $n\text{th}$ level is at index $$i = 2^0 + 2^1 + \cdots + 2^{n-1} = \sum_{j = 0}^{n - 1} 2^j.$$ What about the indices of the other nodes in that level, where $k > 0$? Well, since each level is stored contiguously in the array, all we have to do is add $k$. So, the index for the $k\text{th}$ node in level $n$ is given by $$i = \left(\sum_{j = 0}^{n - 1} 2^j\right) + k.$$ In a complete binary tree, where every parent node has two child nodes, the number of nodes doubles for each new level. This means there are $2^n$ nodes in level $n$. So, note that $k \in [0, 1, \ldots, 2^n - 1]$ here!

Let's find the parent of node $i$, which we know lives on the $n - 1\text{st}$ level of the tree. There are half as many nodes on this level. Thus, the left-to-right index of the parent in its level will be about half that of its child. Specifically, **if node $i$ is a left-child**, then it's parent must be the $k/2$ node in it's level. Thus, 

$$
\begin{aligned}
\mathrm{parent}(i) &= \left(\sum_{j = 0}^{(n - 1) - 1} 2^j\right) + \frac{k}{2} \cr
&= \left(\sum_{j = 0}^{n - 2} 2^j\right) + \frac{k}{2} \cr
&= \left(\sum_{j = 0}^{n - 2} 2^j\right) \cdot \frac{2}{2} + \frac{k}{2} \cr
&= \frac{1}{2} \left[2 \left(\sum_{j = 0}^{n - 2} 2^j\right) + k\right] \cr
&= \frac{1}{2} \left[\left(\sum_{j = 0}^{n - 2} 2^{j + 1}\right) + k\right] \cr
&= \frac{1}{2} \left[\left(\sum_{j = 1}^{n - 1} 2^j\right) + k\right] \cr
&= \frac{1}{2} \left[\left(\sum_{j = 0}^{n - 1} 2^j\right) - 2^0 + k\right] \cr
&= \frac{1}{2} \left[\left(\sum_{j = 0}^{n - 1} 2^j\right) + k - 1\right] \cr
&= \frac{i - 1}{2}. &&\color{red}(1)
\end{aligned}
$$

On the other hand, **if node $i$ is a right-child**, then it's parent is the $(k-1)/2$ node in level $n - 1$. Following similar steps as above, we see that in this case, 

$$
\begin{aligned}
\mathrm{parent}(i) &= \left(\sum_{j = 0}^{(n - 1) - 1} 2^j\right) + \frac{k - 1}{2} \cr
&= \frac{i - 2}{2}. &&\color{red}(2)
\end{aligned}
$$

To reach the form we saw in the diagram above, we just have to realize that $i$ is odd when $i$ is a left child, and $i$ is even when it's a right child. When $i$ is even, expression $\color{red}(1)$ is a whole number. When $i$ is odd, expression $\color{red}(2)$ is fractional. So, we can unite the two cases by taking the floor: $$\mathrm{parent}(i) = \boxed{\lfloor \frac{i - 1}{2} \rfloor.}$$

Whew, that was a lot of algebra! But we indeed found the desired formula for the parent of $i$. Now, let's find the left and right children of $i$. There's some more math here, but you'll see that it follows a similar logic to the steps above.

The children of $i$ should live downstairs in the $n + 1\text{st}$ level of the tree. There are twice as many nodes in this level. Thus, the left-to-right positions of the children should be about two times as big as $k$ (the position of node $i$ in level $n$). There are $k$ other nodes that come before $i$ in level $n$, each of which has two children. Thus, the positions of the left and right children in level $n + 1$ should be $2k$ and $2k + 1$, respectively.

The index of the left child in the array is then given by

$$
\begin{aligned}
\mathrm{left\text{-}child}(i) &= \left(\sum_{j = 0}^{(n + 1) - 1} 2^j\right) + 2k \cr
&= \left(\sum_{j = 0}^{(n + 1) - 1} 2^j\right) \cdot \frac{2}{2} + 2k \cr
&= 2 \left[\frac{1}{2}\left(\sum_{j = 0}^{(n + 1) - 1} 2^j\right) + k \right] \cr
&= 2 \left[\left(\sum_{j = 0}^{(n + 1) - 1} 2^{j-1}\right) + k \right] \cr
&= 2 \left[\left(\sum_{j = 0}^{n - 1} 2^{j}\right) + 2^{-1} + k \right] \cr
&= 2 \left[\left(\sum_{j = 0}^{n - 1} 2^{j}\right) + k + \frac{1}{2} \right] \cr
&= 2 \left[\left(\sum_{j = 0}^{n - 1} 2^{j}\right) + k \right] + 1 \cr
&= \boxed{2i + 1.}
\end{aligned}
$$

Following similar steps as above, we find the index of the right child in the array to be

$$
\begin{aligned}
\mathrm{right\text{-}child}(i) &= \left(\sum_{j = 0}^{(n + 1) - 1} 2^j\right) + 2k + 1 \cr
&= \boxed{2i + 2,}
\end{aligned}
$$

which checks out with the diagram above! Yay!

Let's see how we can implement an array-based tree in C++!

```c++
struct BinaryTree
{
    int size;
    int *array;

    BinaryTree(int size) : size(size), array(new int[size]);
    ~BinaryTree() { delete []array; }

    static int parent(int i)
    {
        // integer division takes care of the floor operation:)
        return (i - 1) / 2;
    }

    static int left_child(int i)
    {
        return 2 * i + 1;
    }

    static int right_child(int i)
    {
        return 2 * i + 2;
    }
};
// you might want to do some out-of-bounds error checking if you're 
// going to do this right.
```

### Pros

1. **Fast Access.** We can get the key of *any* node in our tree with an $O(1)$ access to our array.
2. **Less Memory Per-Node.** Each node just stores its key. (After all, it's just an element in an array.) 
3. **Great Locality.** Arrays are guaranteed to be contiguous blocks of memory. That means we'll need to load far fewer cache blocks, which makes our program run faster.

### Cons

1. **Memory Scales with Levels.** Array-based trees can support incomplete trees (in which some nodes are missing children). You can do so by storing a sentinal value in those children's slots, say, $-1$. For a tree with many missing nodes, there may end up being more sentinal values than actual keys as the number of levels increases. So, array-based trees are best suited for complete trees (which is why they are often used for implementing [binary heaps](https://en.wikipedia.org/wiki/Binary_heap)).
2. **Slow to Resize.** Typically, arrays are fixed-sized. In the case that we need to add more nodes than we have space for, we'll need to allocate an entirely new array and copy all the existing keys over one-by-one.

Array-based trees are so cool! But, when I first learned about them, I was really confused where the index formulas came from, and why they looked so simple given how unnatural it seemed to flatten a tree. Now, I hope you have a better understanding of how the math works out, as well as the costs and benefits of both tree representations! If you have any questions, or feedback on how I can improve this explanation, [drop me a line](/contact)!

