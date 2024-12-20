---
title: 项目：机器人
description: 07_robot
---

> 机器是否可以思考的问题 [...] 与潜艇是否可以游泳的问题同样重要。
>
> —— Edsger Dijkstra，《计算科学面临的威胁》

![chapter_picture_07.jpg](./chapter_picture_7.jpg)

在“项目”章节中，我将暂时停止向您灌输新理论，而是让我们一起完成一个程序。理论对于学习编程必不可少，但阅读和理解实际程序也同样重要。

本章中的项目是构建一个自动机，这是一个在虚拟世界中执行任务的小程序。我们的自动机将是一个收发包裹的邮递机器人。

## 梅多菲尔德村

梅多菲尔德村并不大。它由 11 个地方组成，这些地方之间有 14 条道路。可以用以下道路阵列来描述它：

```js
const roads = [
  "Alice's House-Bob's House",
  "Alice's House-Cabin",
  "Alice's House-Post Office",
  "Bob's House-Town Hall",
  "Daria's House-Ernie's House",
  "Daria's House-Town Hall",
  "Ernie's House-Grete's House",
  "Grete's House-Farm",
  "Grete's House-Shop",
  "Marketplace-Farm",
  "Marketplace-Post Office",
  "Marketplace-Shop",
  "Marketplace-Town Hall",
  "Shop-Town Hall",
];
```

![village](./village2x.png)

村庄的道路网络形成了一个图。图是点（村庄中的地方）及其之间的线（道路）的集合。这个图就是我们的机器人在其中移动的世界。

字符串数组不太好用。我们感兴趣的是从给定地点可以到达的目的地。让我们将道路列表转换为图结构，该结构会告诉我们从每个地点可以到达哪里。

```js
function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (from in graph) {
      graph[from].push(to);
    } else {
      graph[from] = [to];
    }
  }
  for (let [from, to] of edges.map((r) => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

const roadGraph = buildGraph(roads);
```

给定一个边数组，buildGraph 创建一个地图对象，该对象为每个节点存储一个连接节点数组。它使用 split 方法从道路字符串（形式为"Start-End"）转到包含起点和终点作为单独字符串的双元素数组。

## 任务

我们的机器人会在村庄里四处移动。各个地方都有包裹，每个包裹的地址都不一样。机器人遇到包裹时会捡起包裹，到达目的地后再送达。

自动机必须决定每次到达的下一个地点。当所有包裹都送达后，它就完成了任务。

为了能够模拟这个过程，我们必须定义一个可以描述它的虚拟世界。这个模型告诉我们机器人在哪里以及包裹在哪里。当机器人决定移动到某个地方时，我们需要更新模型以反映新的情况。

如果你从面向对象编程的角度来思考，你的第一个念头可能是开始为世界中的各种元素定义对象：一个用于机器人的类，一个用于包裹的类，也许还有一个用于地点的类。然后这些可以保存描述其当前状态的属性，例如某个位置的包裹堆，我们可以在更新世界时更改这些属性。

这是错误的。至少，通常情况下是错误的。某个东西听起来像一个对象，并不意味着它就应该是程序中的一个对象。反射性地为应用程序中的每个概念编写类，往往会给你留下一组相互关联的对象，每个对象都有自己内部不断变化的状态。这样的程序通常很难理解，因此很容易被破坏。

相反，让我们将村庄的状态压缩为定义它的最小值集。有机器人的当前位置和未送达包裹的集合，每个包裹都有当前位置和目的地地址。就是这样。

在此过程中，我们要确保当机器人移动时不会改变这个状态，而是为移动后的情况计算一个新的状态。

```js
class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination) {
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    } else {
      let parcels = this.parcels
        .map((p) => {
          if (p.place != this.place) return p;
          return { place: destination, address: p.address };
        })
        .filter((p) => p.place != p.address);
      return new VillageState(destination, parcels);
    }
  }
}
```

方法 move 是动作发生的地方。它首先检查是否有一条路从当前位置通向目的地，如果没有，则返回旧状态，因为这不是有效的移动。

接下来，该方法创建一个新状态，将目的地作为机器人的新位置。它还需要创建一组新的包裹——机器人携带的包裹（位于机器人当前位置）需要一起移动到新位置。并且需要递送寄往新地点的包裹——也就是说，需要将它们从未递送包裹集中移除。调用 map 负责移动，调用 filter 负责递送。

包裹对象在移动时不会改变，而是重新创建。该 move 方法为我们提供了一个新的村庄状态，但旧状态完全保持不变。

```js
let first = new VillageState("Post Office", [
  { place: "Post Office", address: "Alice's House" },
]);
let next = first.move("Alice's House");

console.log(next.place);
// → Alice's House
console.log(next.parcels);
// → []
console.log(first.place);
// → Post Office
```

此举导致包裹被送达，这反映在下一个状态中。但初始状态仍然描述的是机器人在邮局，包裹尚未送达的情况。

## 持久数据

不会改变的数据结构称为不可变或持久的。它们的行为很像字符串和数字，因为它们就是它们本身，并且会一直保持这种状态，而不是在不同时间包含不同的内容。

在 JavaScript 中，几乎所有东西都可以更改，因此处理应该持久的值需要一些限制。有一个函数称为 Object.freeze，它可以更改对象，以便忽略对其属性的写入。如果您想小心，可以使用它来确保您的对象不会被更改。冻结确实需要计算机做一些额外的工作，而忽略更新几乎和让他们做错事一样容易让人感到困惑。我通常更喜欢告诉人们不应该弄乱某个对象，并希望他们记住它。

```js
let object = Object.freeze({ value: 5 });
object.value = 10;
console.log(object.value);
// → 5
```

为什么当语言显然期望我改变对象时，我却不去改变它呢？因为这有助于我理解我的程序。这又涉及到复杂性管理。当我的系统中的对象是固定的、稳定的事物时，我可以单独考虑对它们的操作——从给定的起始状态移动到爱丽丝的家总是会产生相同的新状态。当对象随时间变化时，这会为这种推理增加一个全新的复杂性维度。

对于像本章中我们构建的这种小型系统，我们可以处理这一点额外的复杂性。但是，对于我们可以构建的系统类型，最重要的限制是我们能够理解多少。任何使代码更易于理解的东西都使构建更雄心勃勃的系统成为可能。

不幸的是，虽然理解基于持久数据结构的系统比较容易，但设计一个系统（尤其是当你的编程语言没有帮助时）可能会有点困难。我们将在本书中寻找使用持久数据结构的机会，但我们也会使用可变数据结构。

## 模拟

送货机器人观察周围环境，决定要往哪个方向移动。因此，我们可以说机器人是一个函数，它接受一个 VillageState 对象并返回附近地点的名称。

因为我们希望机器人能够记住事情，以便制定和执行计划，所以我们还将记忆传递给它们，并允许它们返回新的记忆。因此，机器人返回的是一个对象，其中包含它想要移动的方向和下次调用时将返回给它的内存值。

```js
function runRobot(state, robot, memory) {
  for (let turn = 0; ; turn++) {
    if (state.parcels.length == 0) {
      console.log(`Done in ${turn} turns`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    console.log(`Moved to ${action.direction}`);
  }
}
```

考虑一下机器人要做什么才能“解决”给定状态。它必须通过访问每个有包裹的地点来拾取所有包裹，并通过访问每个包裹寄往的地点来递送包裹，但只能在拾取包裹之后进行。

最愚蠢但可行的策略是什么？机器人每次都可以随机行走。这意味着，它很有可能最终碰到所有包裹，然后在某个时刻到达包裹应该送达的地方。

看起来可能像这样：

```js
function randomPick(array) {
  const choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

function randomRobot(state) {
  return { direction: randomPick(roadGraph[state.place]) };
}
```

请记住，Math.random()返回一个介于 0 和 1 之间的数字 —— 但始终小于 1。将该数字乘以数组的长度，然后应用于 Math.floor 该数字，我们将得到该数组的随机索引。

由于这个机器人不需要记住任何东西，它会忽略它的第二个参数（请记住，可以使用额外的参数调用 JavaScript 函数而不会产生不良影响）并省略 memory 其返回对象中的属性。

要让这个复杂的机器人工作，我们首先需要一种方法来使用一些包裹创建新的状态。静态方法（此处通过直接向构造函数添加属性来编写）是实现该功能的理想位置。

```js
VillageState.random = function (parcelCount = 5) {
  const parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph));
    let place;
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({ place, address });
  }
  return new VillageState("Post Office", parcels);
};
```

我们不希望任何包裹从其地址相同的位置发送。出于这个原因，do 当循环找到与地址相同的位置时，它会继续选择新的地方。

让我们开启一个虚拟世界。

```js
runRobot(VillageState.random(), randomRobot);
// → Moved to Marketplace
// → Moved to Town Hall
// → …
// → 63 个回合内完成
```

由于机器人的提前规划不太好，所以需要多次轮流才能送达包裹。我们很快就会解决这个问题。

为了更愉快地观察模拟，你可以使用本章编程环境 runRobotAnimation 中提供的功能。这将运行模拟，但不会输出文本，而是显示机器人在村庄地图上移动。

```js
runRobotAnimation(VillageState.random(), randomRobot);
```

目前，其实现方式 runRobotAnimation 仍是一个谜，但在阅读本书后面讨论 Web 浏览器中 JavaScript 集成的章节后，您将能够猜出它是如何工作的。

## 邮车路线

我们应该能做得比随机机器人好得多。一个简单的改进方法是从现实世界的邮件投递方式中得到启发。如果我 ​​ 们找到一条经过村庄所有地方的路线，机器人可以运行该路线两次，此时保证完成。以下是一条这样的路线（从邮局出发）：

```js
const mailRoute = [
  "Alice's House",
  "Cabin",
  "Alice's House",
  "Bob's House",
  "Town Hall",
  "Daria's House",
  "Ernie's House",
  "Grete's House",
  "Shop",
  "Grete's House",
  "Farm",
  "Marketplace",
  "Post Office",
];
```

要实现路线跟踪机器人，我们需要利用机器人的记忆。机器人将其余路线保存在记忆中，并在每次转弯时丢弃第一个元素。

```js
function routeRobot(state, memory) {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return { direction: memory[0], memory: memory.slice(1) };
}
```

这个机器人已经快了很多。它最多需要 26 个回合（13 步路线的两倍），但通常更少。

```js
runRobotAnimation(VillageState.random(), routeRobot, []);
```

## 寻路

不过，我并不认为盲目遵循固定路线的行为是智能行为。如果机器人能够根据实际需要完成的工作调整自己的行为，那么它就能更高效地工作。

要做到这一点，机器人必须能够有意识地朝指定包裹或包裹需要送达的地点移动。即使目标距离机器人不止一步之遥，机器人也需要某种路线寻找功能。

通过图寻找路线的问题是一个典型的搜索问题。我们可以判断给定的解决方案（路线）是否有效，但我们不能像计算 2 + 2 那样直接计算解决方案。相反，我们必须不断创造潜在的解决方案，直到找到一个可行的解决方案。

图中可能存在的路线数量是无限的。但是，当搜索从 A 到 B 的路线时，我们只对从 A 开始的路线感兴趣。我们也不关心两次访问同一地点的路线——这些路线绝对不是最高效的路线。因此，这减少了路线查找器必须考虑的路线数量。

事实上，由于我们最感兴趣的是最短路线，因此我们希望确保先查看短路线，然后再查看较长路线。一个好方法是从起点开始“增加”路线，探索尚未访问的每个可到达地点，直到路线到达目标。这样，我们将只探索可能有趣的路线，并且我们知道我们找到的第一条路线是最短的路线（或者如果有多条路线，则是其中一条最短的路线）。

下面是一个实现这个功能的函数：

```js
function findRoute(graph, from, to) {
  let work = [{ at: from, route: [] }];
  for (let i = 0; i < work.length; i++) {
    let { at, route } = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      if (!work.some((w) => w.at == place)) {
        work.push({ at: place, route: route.concat(place) });
      }
    }
  }
}
```

探索必须按照正确的顺序进行——首先到达的地方必须首先探索。我们不能一到达一个地方就立即探索它，因为这意味着从那里到达的地方也会立即被探索，依此类推，即使可能还有其他更短的路径尚未被探索。

因此，该函数保留一个工作列表。这是下一步应探索的地点的数组，以及到达那里的路线。它仅从起始位置和一条空路线开始。

然后，搜索通过取出列表中的下一个项目并进行探索来运行，这意味着它会查看从该位置出发的所有道路。如果其中一条是目标，则可以返回一条完成的路线。否则，如果我们之前没有查看过这个地方，则会将新项目添加到列表中。如果我们之前查看过它，因为我们首先查看的是短路线，所以我们找到了一条更长的路线或一条与现有路线一样长的路线，我们不需要探索它。

您可以将其想象为一张由已知路线组成的网，从起始位置开始向外爬行，均匀地向四面延伸（但从不纠缠在一起）。一旦第一根线到达目标位置，该线就会追溯到起始位置，从而为我们提供路线。

我们的代码不会处理工作列表中没有更多工作项的情况，因为我们知道我们的图是连通的，这意味着每个位置都可以从所有其他位置到达。我们总能找到两点之间的路线，并且搜索不会失败。

```js
function goalOrientedRobot({ place, parcels }, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    if (parcel.place != place) {
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  return { direction: route[0], memory: route.slice(1) };
}
```

这个机器人使用其记忆值作为移动方向的列表，就像路线跟踪机器人一样。每当该列表为空时，它就必须确定下一步该做什么。它会取出集合中第一个未送达的包裹，如果该包裹尚未被取走，则绘制一条通往该包裹的路线。如果包裹已被取走，则仍需要送达，因此机器人会创建一条通往送货地址的路线。

## 练习

### 测量机器人

仅通过让机器人解决几个场景很难客观地比较机器人。也许一个机器人恰好能完成更简单的任务或它擅长的任务，而另一个机器人却不能。

编写一个函数 compareRobots，该函数接受两个机器人（及其起始内存）。它应生成 100 个任务，并让两个机器人解决每个任务。完成后，它应输出每个机器人执行每个任务的平均步数。

为了公平起见，请确保将每个任务分配给两个机器人，而不是为每个机器人生成不同的任务。

让我们看看它的效果如何。

```js
runRobotAnimation(VillageState.random(), goalOrientedRobot, []);
```

这个机器人通常需要大约 16 个回合才能完成运送 5 个包裹的任务。这比最佳状态略好 routeRobot，但绝对不是最佳状态。我们会在练习中继续完善它。

```js
function compareRobots(robot1, memory1, robot2, memory2) {
  // Your code here
}

compareRobots(routeRobot, [], goalOrientedRobot, []);
```

<details><summary>显示提示</summary>您必须编写该runRobot函数的变体，它不是将事件记录到控制台，而是返回机器人完成任务所采取的步数。

然后，您的测量函数可以循环生成新状态并计算每个机器人的步数。当它生成了足够的测量值时，它可以用来 console.log 输出每个机器人的平均值，即总步数除以测量次数。</details>

### 机器人效率

你能写一个比 更快完成送货任务的机器人 goalOrientedRobot 吗？如果你观察机器人的行为，它会做什么明显愚蠢的事情？这些事情如何改进？

如果您解决了前面的练习，您可能想要使用您的 compareRobots 功能来验证您是否改进了机器人。

```js
// Your code here

runRobotAnimation(VillageState.random(), yourRobot, memory);
```

<details><summary>显示提示</summary>
它的主要限制goalOrientedRobot是每次只能考虑一块土地。它经常会在村庄里来回走动，因为它正在查看的土地恰好位于地图的另一侧，即使还有其他土地离得更近。

一种可能的解决方案是计算所有包裹的路线，然后选择最短的路线。如果有多条最短路线，则可以选择取包裹的路线而不是送包裹的路线，从而获得更好的结果。</details>

### 持久组

标准 JavaScript 环境中提供的大多数数据结构不太适合持久使用。数组具有 slice 和 concat 方法，可让我们轻松创建新数组而不损坏旧数组。但是 Set，例如，没有用于添加或删除项目来创建新集合的方法。

编写一个新类 PGroup，类似于[第 6 章](../../06_object/readme/) 中的 Group 类，它存储一组值。和 Group 一样，它有 add、delete、有方法。然而，它的 add 方法应该返回一个新的 PGroup 实例，其中添加了给定的成员，并保持旧的不变。同样，删除应该创建一个没有给定成员的新实例。

该类应该适用于任何类型的值，而不仅仅是字符串。当与大量值一起使用时，它不必非常高效。

构造函数不应成为类接口的一部分（尽管您肯定会想在内部使用它）。相反，有一个空实例，PGroup.empty 可用作起始值。

为什么只需要一个 PGroup.empty 值，而不是每次都有一个创建新的空映射的函数？

```js
class PGroup {
  // Your code here
}

let a = PGroup.empty.add("a");
let ab = a.add("b");
let b = ab.delete("a");

console.log(b.has("b"));
// → true
console.log(a.has("b"));
// → false
console.log(b.has("a"));
// → false
```

<details><summary>显示提示</summary>表示成员值集合最方便的方式仍然是使用数组，因为数组易于复制。

当将值添加到组中时，您可以创建一个新组，其中包含添加了值的原始数组的副本（例如，使用 concat）。当删除某个值时，您可以从数组中过滤它。

类的构造函数可以将这样的数组作为其参数，并将其存储为实例的（唯一）属性。此数组永远不会更新。

要将 empty 属性添加到构造函数，可以将其声明为静态属性。

您只需要一个 empty 实例，因为所有空组都是相同的，并且类的实例不会改变。您可以从该单个空组创建许多不同的组而不会影响它。</details>
