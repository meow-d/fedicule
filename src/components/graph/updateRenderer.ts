import {
  EdgeCurvedArrowProgram,
  indexParallelEdgesIndex,
} from "@sigma/edge-curve";
import { createNodeBorderProgram } from "@sigma/node-border";
import { NodeImageProgram } from "@sigma/node-image";
import { MultiDirectedGraph } from "graphology";
import Sigma from "sigma";
import { createNodeCompoundProgram, EdgeArrowProgram } from "sigma/rendering";
import { EdgeDisplayData, NodeDisplayData } from "sigma/types";
import { setState, state } from "../../stores/graph";

export function updateRenderer(container: HTMLElement, graph: MultiDirectedGraph): Sigma {
  // border
  const NodeBorderCustomProgram = createNodeBorderProgram({
    borders: [{ size: { value: 5, mode: "pixels" }, color: { attribute: "color" } }],
  });
  const NodeProgram = createNodeCompoundProgram([NodeImageProgram, NodeBorderCustomProgram]);

  // renderer
  const renderer = new Sigma(graph, container, {
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

    minCameraRatio: 0.3,
    maxCameraRatio: 4,
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
      setState({
        hoveredNode: node,
        hoveredNeighbors: new Set(graph.neighbors(node)),
      });
    }
    if (!node) {
      setState({
        hoveredNode: undefined,
        hoveredNeighbors: undefined,
      });
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

    const selectedNode = {
      label: nodeInfo.label,
      mastoApiId: nodeInfo.mastoApiId,
      display_name: nodeInfo.display_name,
      image: nodeInfo.image,
      color: nodeInfo.color,
      neighbours: neighboursInfo,
    };

    const a = new Map(state.selectedNodes);
    a.set(node, selectedNode);
    setState({ selectedNodes: a });
  }

  renderer.on("doubleClickNode", ({ node }) => {
    if (state.selectedNodes.has(node)) {
      const a = new Map(state.selectedNodes);
      a.delete(node);
      setState({ selectedNodes: a });
    } else {
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
      !graph.extremities(edge).every((n) => n === state.hoveredNode || graph.areNeighbors(n, state.hoveredNode))
    ) {
      res.color = "#e6e6e6";
    }

    if (
      state.suggestions &&
      (!state.suggestions.has(graph.source(edge)) || !state.suggestions.has(graph.target(edge)))
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

  return renderer;
}
