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

const [graphHidden, setGraphHidden] = createSignal(!dataStore.processedData);
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
let layout: ForceSupervisor | FA2Layout | undefined;

/** destorys the pervious layout worker and starts a new one. */
function switchLayout(layoutName: "force" | "forceAtlas2", graph: MultiDirectedGraph) {
  if (layout) {
    // also a workaround because setState kept triggering createEffect for some reason
    const currentLayout = layout instanceof ForceSupervisor ? "force" : "forceAtlas2";
    if (currentLayout === layoutName) return;
    layout.stop();
  }

  if (layoutName === "force") {
    layout = new ForceSupervisor(graph, {
      isNodeFixed: (_, attr) => attr.highlighted || (auth.type !== "" && attr.label === auth.handle),
      shouldSkipNode: (_, attr) => attr.hidden,
      settings: { attraction: 0.00005 },
    });
  } else {
    const fa2settings = forceAtlas2.inferSettings(graph);
    // adjustSizes takes node sizes in account, but it makes the graph move awkwardly
    // i mean i could probably only enable it after a few seconds or something
    layout = new FA2Layout(graph, { settings: { ...fa2settings } });
  }

  layout.start();
}

// user filters
export function updateFilter(filter: Filter) {
  if (!graph || !renderer) return;

  const userId = auth.type === "mastoapi" ? auth.id : auth.type === "bsky" ? auth.did : undefined;
  const idAttribute = auth.type === "mastoapi" ? "label" : auth.type === "bsky" ? "bskyDid" : undefined;

  if (!userId || !idAttribute || filter === Filter.None) {
    graph.forEachNode((node) => graph.setNodeAttribute(node, "hidden", undefined));
    renderer.refresh();
    return;
  }

  const user = graph.findNode((_node, attributes) => attributes[idAttribute] === userId);

  graph.forEachNode((node) => {
    if (node === user) return;

    const followingUser = graph.findInEdge(user, node, (edge) => graph.getEdgeAttribute(edge, "follow") === true);
    const followedByUser = graph.findOutEdge(user, node, (edge) => graph.getEdgeAttribute(edge, "follow") === true);

    const nodeHidden =
      (filter === Filter.Followers && !followingUser) ||
      (filter === Filter.Following && !followedByUser) ||
      (filter === Filter.Mutuals && (!followingUser || !followedByUser));

    graph.setNodeAttribute(node, "hidden", nodeHidden ? true : undefined);
  });

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
