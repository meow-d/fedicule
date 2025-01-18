import { onMount, createEffect, createSignal } from "solid-js";

import { MultiDirectedGraph } from "graphology";
import louvain from "graphology-communities-louvain";
import ForceSupervisor from "graphology-layout-force/worker";
import forceAtlas2, {
  ForceAtlas2Settings,
} from "graphology-layout-forceatlas2";
import FA2Layout from "graphology-layout-forceatlas2/worker";

import Sigma from "sigma";
import {
  EdgeCurvedArrowProgram,
  indexParallelEdgesIndex,
} from "@sigma/edge-curve";
import { createNodeCompoundProgram, EdgeArrowProgram } from "sigma/rendering";
import { createNodeBorderProgram } from "@sigma/node-border";
import { NodeImageProgram } from "@sigma/node-image";
import { EdgeDisplayData, NodeDisplayData } from "sigma/types";
import { fitViewportToNodes } from "@sigma/utils";

import iwanthue from "iwanthue";

import { data as dataStore, Node, ProcessedData } from "../../stores/data";
import { settings as settingsStore } from "../../stores/settings";

let data: ProcessedData | undefined;
let graph: MultiDirectedGraph;
let renderer: Sigma;
let container: HTMLElement;

interface State {
  hoveredNode?: string;
  searchQuery: string;
  clickedNode?: string;
  selectedNodes: Set<string>;
  suggestions?: Set<string>;
  hoveredNeighbors?: Set<string>;
}

interface SelectedNode extends Node {
  color: string;
  neighbors?: SelectedNode[];
}

// TODO having a signal that's essentially a duplicate probably isn't a good thing...
const [selectedNodes, setSelectedNodes] = createSignal<SelectedNode[]>([]);
const state: State = {
  searchQuery: "",
  selectedNodes: new Set(),
};

interface community {
  id: string;
  largestNode: string;
  color: string;
}

// let communities: community[] = [];
const [communities, setCommunities] = createSignal<community[]>([]);

function updateGraph() {
  data = dataStore.processedData;
  if (!data) return;

  graph = new MultiDirectedGraph();

  data.interaction.forEach(
    (interaction: { sender: Node; receiver: Node; type: string }) => {
      updateEdge(interaction.sender, interaction.receiver, interaction.type);
    }
  );

  function updateEdge(sender: Node, receiver: Node, type: string) {
    let score: number = 1;
    switch (type) {
      case "mention":
        score = 4;
      case "like":
        score = 1;
      case "boost":
        score = 2;
    }

    updateNode(sender, score);
    updateNode(receiver, score);

    graph.updateEdge(sender.label, receiver.label, (attr) => {
      const finalScore = (attr.score || 0) + score * 1;
      return {
        ...attr,
        score: finalScore,
        size: finalScore,
      };
    });
  }

  function updateNode(node: Node, score: number) {
    graph.updateNode(node.label, (attr) => {
      return {
        ...attr,
        label: node.label,
        mastoApiId: node.mastoApiId,
        display_name: node.display_name,
        image: node.image,
        score: (attr.score || 0) + score,
        size: 5,
        x: Math.random(),
        y: Math.random(),
      };
    });
  }

  // filter out nodes with low scores
  graph.forEachNode((node, attr) => {
    if (attr.score <= 2) {
      graph.dropNode(node);
    }
  });
  // graph.forEachEdge((edge, attr) => {
  //   if (attr.score < 2) {
  //     graph.dropEdge(edge);
  //   }
  // });

  // node size based on updated edge scores
  graph.forEachNode((node, attr) => {
    const edges = graph.edges(node);
    const score = edges.reduce(
      (acc, edge) => acc + graph.getEdgeAttribute(edge, "score"),
      0
    );
    const size = 5 + Math.log(score) * 3;
    graph.setNodeAttribute(node, "size", size);
  });

  // community detection using louvain
  louvain.assign(graph, { nodeCommunityAttribute: "community" });

  const communitiesSet = new Set<string>();
  graph.forEachNode((_, attrs) => communitiesSet.add(attrs.community));
  setCommunities(
    Array.from(communitiesSet).map((community) => ({
      id: community,
      largestNode: "",
      color: "",
    }))
  );

  // comunity colors
  const palette: Record<string, string> = iwanthue(communitiesSet.size).reduce(
    (iter, color, i) => ({
      ...iter,
      [communities()[i].id]: color,
    }),
    {}
  );
  graph.forEachNode((node, attr) =>
    graph.setNodeAttribute(node, "color", palette[attr.community])
  );

  // find largest node in each community
  const updatedCommunities = communities().map((community) => {
    const nodesInCommunity = graph.filterNodes(
      (node, attrs) => attrs.community === community.id
    );

    if (nodesInCommunity.length > 0) {
      const largestNode = nodesInCommunity.reduce((a, b) =>
        graph.getNodeAttribute(a, "size") > graph.getNodeAttribute(b, "size")
          ? a
          : b
      );
      return {
        ...community,
        largestNode,
        color: palette[community.id],
      };
    }
    return community;
  });
  setCommunities(updatedCommunities);
}

// fit community nodes in viewport
function fitViewportToCommunity(community: string) {
  if (!renderer) return;
  const nodes = graph.filterNodes((_, attr) => attr.community === community);
  fitViewportToNodes(renderer, nodes);
}

// layouts
let layout: ForceSupervisor | FA2Layout;
let settings: ForceAtlas2Settings | undefined;

function switchLayout(layoutName: "force" | "forceAtlas2") {
  if (layout) layout.stop();

  if (layoutName === "force") {
    layout = new ForceSupervisor(graph, {
      isNodeFixed: (_, attr) => attr.highlighted,
    });
  } else if (layoutName === "forceAtlas2") {
    settings = forceAtlas2.inferSettings(graph);
    layout = new FA2Layout(graph, {
      settings: {
        ...settings,
      },
    });
  }

  layout.start();
}

function updateRenderer() {
  if (!container) return;
  if (renderer) renderer.kill();

  // border
  const NodeBorderCustomProgram = createNodeBorderProgram({
    borders: [
      { size: { value: 5, mode: "pixels" }, color: { attribute: "color" } },
    ],
  });
  const NodeProgram = createNodeCompoundProgram([
    NodeImageProgram,
    NodeBorderCustomProgram,
  ]);

  // renderer
  renderer = new Sigma(graph, container, {
    allowInvalidContainer: true,
    defaultNodeType: "image",
    nodeProgramClasses: {
      image: NodeProgram,
    },

    defaultEdgeType: "straight",
    edgeProgramClasses: {
      straight: EdgeArrowProgram,
      curved: EdgeCurvedArrowProgram,
    },

    labelFont: "Ubuntu, sans-serif",
    labelColor: { color: "#888" },
    labelSize: 13,
    labelRenderedSizeThreshold: 15,
  });

  // curve parellel edges
  // TODO: the dropped edges doesn't seem to be removed here
  indexParallelEdgesIndex(graph, {
    edgeIndexAttribute: "parallelIndex",
    edgeMinIndexAttribute: "parallelMinIndex",
    edgeMaxIndexAttribute: "parallelMaxIndex",
  });
  graph.forEachEdge(
    (
      edge,
      {
        parallelIndex,
        parallelMinIndex,
        parallelMaxIndex,
      }:
        | {
            parallelIndex: number;
            parallelMinIndex?: number;
            parallelMaxIndex: number;
          }
        | {
            parallelIndex?: null;
            parallelMinIndex?: null;
            parallelMaxIndex?: null;
          }
    ) => {
      if (typeof parallelMinIndex === "number") {
        graph.mergeEdgeAttributes(edge, {
          type: parallelIndex ? "curved" : "straight",
        });
      } else if (typeof parallelIndex === "number") {
        graph.mergeEdgeAttributes(edge, {
          type: "curved",
        });
      } else {
        graph.setEdgeAttribute(edge, "type", "straight");
      }
    }
  );

  // highlight nodes on hover/drag
  function setHoveredNode(node?: string) {
    if (node) {
      state.hoveredNode = node;
      state.hoveredNeighbors = new Set(graph.neighbors(node));
    }
    if (!node) {
      state.hoveredNode = undefined;
      state.hoveredNeighbors = undefined;
    }
    renderer.refresh({ skipIndexation: true });
  }

  renderer.on("enterNode", ({ node }) => {
    if (isDragging || draggedNode) return;
    setHoveredNode(node);
  });
  renderer.on("leaveNode", () => {
    if (isDragging || draggedNode) return;
    setHoveredNode(undefined);
  });

  // ability to select nodes
  function addSelectedNode(node: string) {
    const nodeInfo = graph.getNodeAttributes(node);
    const neighbors = graph.neighbors(node);
    const neighboursInfo = neighbors.map((node) => {
      const nodeInfi = graph.getNodeAttributes(node);
      return {
        label: nodeInfi.label,
        mastoApiId: nodeInfi.mastoApiId,
        display_name: nodeInfi.display_name,
        image: nodeInfi.image,
        color: nodeInfi.color,
      };
    });
    setSelectedNodes((nodes) => [
      ...nodes,
      {
        label: nodeInfo.label,
        mastoApiId: nodeInfo.mastoApiId,
        display_name: nodeInfo.display_name,
        image: nodeInfo.image,
        color: nodeInfo.color,
        neighbours: neighboursInfo,
      },
    ]);
  }

  renderer.on("doubleClickNode", ({ node }) => {
    if (state.selectedNodes.has(node)) {
      state.selectedNodes.delete(node);
      setSelectedNodes((nodes) => nodes.filter((n) => n.label !== node));
    } else {
      state.selectedNodes.add(node);
      addSelectedNode(node);
    }
  });

  // node and edge reducers
  renderer.setSetting("nodeReducer", (node, data) => {
    const res: Partial<NodeDisplayData> = { ...data };

    if (
      state.hoveredNeighbors &&
      !state.hoveredNeighbors.has(node) &&
      state.hoveredNode !== node &&
      !state.selectedNodes.has(node)
    ) {
      res.type = "circle";
      res.color = "#e6e6e6";
      res.label = "";
    }

    if (state.clickedNode === node || state.selectedNodes.has(node)) {
      res.highlighted = true;
    } else if (state.suggestions) {
      if (state.suggestions.has(node)) {
        res.forceLabel = true;
      } else {
        res.label = "";
        res.color = "#e6e6e6";
      }
    }

    return res;
  });

  renderer.setSetting("edgeReducer", (edge, data) => {
    const res: Partial<EdgeDisplayData> = { ...data };

    if (
      state.hoveredNode &&
      !graph
        .extremities(edge)
        .every(
          (n) =>
            n === state.hoveredNode || graph.areNeighbors(n, state.hoveredNode)
        )
    ) {
      res.color = "#e6e6e6";
    }

    if (
      state.suggestions &&
      (!state.suggestions.has(graph.source(edge)) ||
        !state.suggestions.has(graph.target(edge)))
    ) {
      res.color = "#e6e6e6";
    }

    return res;
  });

  // drag and drop
  let draggedNode: string | null = null;
  let isDragging = false;

  renderer.on("downNode", ({ node }) => {
    if (!renderer) return;

    isDragging = true;
    setHoveredNode(node);
    draggedNode = node;
    graph.setNodeAttribute(draggedNode, "highlighted", true);
    if (!renderer.getCustomBBox()) renderer.setCustomBBox(renderer.getBBox());
  });

  renderer.on("moveBody", ({ event }) => {
    if (!isDragging || !draggedNode) return;

    const pos = renderer.viewportToGraph(event);
    graph.setNodeAttribute(draggedNode, "x", pos.x);
    graph.setNodeAttribute(draggedNode, "y", pos.y);

    event.preventSigmaDefault();
    event.original.preventDefault();
    event.original.stopPropagation();
  });

  const handleUp = () => {
    if (draggedNode) {
      graph.removeNodeAttribute(draggedNode, "highlighted");
    }
    isDragging = false;
    draggedNode = null;
    setHoveredNode(undefined);
  };
  renderer.on("upNode", handleUp);
  renderer.on("upStage", handleUp);
}

function update() {
  updateGraph();
  switchLayout(settingsStore.layout);
  updateRenderer();
}

function Graph() {
  updateGraph();

  if (!graph) {
    return (
      <div
        style={{
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
          height: "100%",
        }}
      >
        <p>no graph data... go fetch some posts!</p>
      </div>
    );
  }

  // layout
  createEffect(() => {
    switchLayout(settingsStore.layout);
  });
  switchLayout(settingsStore.layout);

  onMount(() => {
    container = document.getElementById("sigma-container") as HTMLElement;
    updateRenderer();
  });

  return (
    <div
      id="sigma-container"
      style="flex-grow: 1; width: 100%; height: 100%;"
    ></div>
  );
}

export {
  Graph,
  communities,
  selectedNodes,
  fitViewportToCommunity,
  updateRenderer,
  update,
};
