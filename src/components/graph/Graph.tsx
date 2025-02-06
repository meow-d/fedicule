import { onMount, createEffect, createSignal, Show } from "solid-js";

import { MultiDirectedGraph } from "graphology";
import ForceSupervisor from "graphology-layout-force/worker";
import forceAtlas2 from "graphology-layout-forceatlas2";
import FA2Layout from "graphology-layout-forceatlas2/worker";

import Sigma from "sigma";
import { fitViewportToNodes } from "@sigma/utils";

import { data as dataStore } from "../../stores/data";
import { settings, setSettings } from "../../stores/settings";
import { updateGraph } from "./updateGraph";
import { updateRenderer } from "./updateRenderer";
import { Coordinates } from "sigma/types";

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
  if (layout) layout.stop();

  if (layoutName === "force") {
    layout = new ForceSupervisor(graph, {
      isNodeFixed: (_, attr) => attr.highlighted,
    });
  } else if (layoutName === "forceAtlas2") {
    const fa2settings = forceAtlas2.inferSettings(graph);
    layout = new FA2Layout(graph, { settings: { ...fa2settings } });
  }

  layout.start();
}

// main
/** (re)creates the graph and renderer */
export function update() {
  if (!dataStore.processedData) return;
  graph = updateGraph(dataStore.processedData);
  setGraphHidden(!graph);
  if (!graph) return;

  switchLayout(settings.layout, graph);

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
