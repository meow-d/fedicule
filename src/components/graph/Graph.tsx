import { onMount, createEffect, createSignal, Show } from "solid-js";

import { MultiDirectedGraph } from "graphology";
import ForceSupervisor from "graphology-layout-force/worker";
import forceAtlas2 from "graphology-layout-forceatlas2";
import FA2Layout from "graphology-layout-forceatlas2/worker";

import Sigma from "sigma";
import { fitViewportToNodes } from "@sigma/utils";

import { data as dataStore } from "../../stores/data";
import { settings, setSettings, Filter } from "../../stores/settings";
import { updateGraph } from "./updateGraph";
import { updateRenderer } from "./updateRenderer";
import { auth } from "../../stores/auth";

const [graphHidden, setGraphHidden] = createSignal(false);
let graph: MultiDirectedGraph;
let renderer: Sigma;
let container;

// node navigation
/** camera zooms in/out to fit all nodes from a community in viewport */
export function fitViewportToCommunity(community: string) {
  if (!renderer) return;
  if (!graph) return;
  const nodes = graph.filterNodes((_, attr) => attr.community === community);
  fitViewportToNodes(renderer, nodes);
}

export function focusNode(node: string) {
  if (!renderer) return;
  if (!graph) return;
  fitViewportToNodes(renderer, [node]);
}

// layouts
let layout: ForceSupervisor | FA2Layout;

/** destorys the pervious layout worker and starts a new one. */
function switchLayout(layoutName: "force" | "forceAtlas2", graph: MultiDirectedGraph) {
  // also a workaround because setState kept triggering createEffect for some reason
  const currentLayout = layout instanceof ForceSupervisor ? "force" : "forceAtlas2";
  if (currentLayout === layoutName) return;

  if (layout) layout.stop();

  if (layoutName === "force") {
    layout = new ForceSupervisor(graph, {
      isNodeFixed: (_, attr) => attr.highlighted || (auth.type !== "" && attr.label === auth.handle),
      shouldSkipNode: (_, attr) => attr.hidden,
      settings: { attraction: 0.00005 },
    });
  } else if (layoutName === "forceAtlas2") {
    const fa2settings = forceAtlas2.inferSettings(graph);
    layout = new FA2Layout(graph, { settings: { ...fa2settings } });
  }

  layout.start();
}

// user filters
export function updateFilter(filter: Filter) {
  if (!graph || !renderer) return;

  let user;
  if (auth.type === "mastoapi") {
    user = auth.handle;
  } else if (auth.type === "bsky") {
    // TODO: this can be a did or a handle
    user = auth.handle;
  } else {
    console.error("No auth type. Defaulting to no filters.");
  }

  if (!user || filter === Filter.None) {
    for (const node of graph.nodes()) {
      graph.setNodeAttribute(node, "hidden", undefined);
    }
    return;
  }

  for (const node of graph.nodes()) {
    if (node === user) continue;

    const followingUser = graph.findInEdge(user, node, (edge) => graph.getEdgeAttribute(edge, "follow") === true);
    const followedByUser = graph.findOutEdge(user, node, (edge) => graph.getEdgeAttribute(edge, "follow") === true);

    const nodeHidden =
      (filter === Filter.Followers && !followingUser) ||
      (filter === Filter.Following && !followedByUser) ||
      (filter === Filter.Mutuals && (!followingUser || !followedByUser));

    if (nodeHidden) {
      graph.setNodeAttribute(node, "hidden", true);
    } else {
      graph.setNodeAttribute(node, "hidden", undefined);
    }
  }

  renderer.refresh();
}

// main
/** (re)creates the graph and renderer */
export function update() {
  if (!dataStore.processedData) return;
  graph = updateGraph(dataStore.processedData);
  setGraphHidden(!graph);
  if (!graph) return;

  switchLayout(settings.layout, graph);

  // TODO: use setGraph() instead of killing it
  if (renderer) renderer.kill();
  if (!container) return;
  renderer = updateRenderer(container, graph);
  renderer.getCamera().addListener("updated", (e) => setSettings("zoomAmount", e.ratio));
}

export function Graph() {
  createEffect(() => {
    const layout = settings.layout;
    if (!graph) return;
    switchLayout(layout, graph);
  });

  createEffect(() => {
    const zoomAmount = settings.zoomAmount;
    if (!renderer) return;
    renderer.getCamera().ratio = zoomAmount;
  });

  onMount(update);

  return (
    <div
      id="sigma-container"
      style={{
        "flex-grow": 1,
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
        width: "100%",
        height: "100%",
      }}
      ref={container}
    >
      <Show when={graphHidden()}>
        <p>no graph data... go fetch some posts!</p>
      </Show>
    </div>
  );
}
