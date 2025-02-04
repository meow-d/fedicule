import { onMount, createEffect, createSignal, Show } from "solid-js";

import { MultiDirectedGraph } from "graphology";
import ForceSupervisor from "graphology-layout-force/worker";
import forceAtlas2, { ForceAtlas2Settings } from "graphology-layout-forceatlas2";
import FA2Layout from "graphology-layout-forceatlas2/worker";

import Sigma from "sigma";
import { fitViewportToNodes } from "@sigma/utils";

import { data as dataStore } from "../../stores/data";
import { settings as settingsStore } from "../../stores/settings";
import { updateGraph } from "./updateGraph";
import { updateRenderer } from "./updateRenderer";

const [graph, setGraph] = createSignal<MultiDirectedGraph>();
let renderer: Sigma;
let container;

// fit community nodes in viewport
export function fitViewportToCommunity(community: string) {
  const currentGraph = graph();
  if (!renderer || !currentGraph) return;
  const nodes = currentGraph.filterNodes((_, attr) => attr.community === community);
  fitViewportToNodes(renderer, nodes);
}

// layouts
let layout: ForceSupervisor | FA2Layout;

function switchLayout(layoutName: "force" | "forceAtlas2", graph: MultiDirectedGraph) {
  if (layout) layout.stop();

  if (layoutName === "force") {
    layout = new ForceSupervisor(graph, {
      isNodeFixed: (_, attr) => attr.highlighted,
    });
  } else if (layoutName === "forceAtlas2") {
    const settings = forceAtlas2.inferSettings(graph);
    layout = new FA2Layout(graph, { settings: { ...settings } });
  }

  layout.start();
}

export function update() {
  if (!dataStore.processedData) return;
  setGraph(updateGraph(dataStore.processedData));
  const currentGraph = graph();
  if (!currentGraph) return;
  switchLayout(settingsStore.layout, currentGraph);

  if (renderer) renderer.kill();
  if (!container) return;
  renderer = updateRenderer(container, currentGraph);
}

export function Graph() {
  createEffect(() => {
    const currentGraph = graph();
    if (!currentGraph) return;
    switchLayout(settingsStore.layout, currentGraph);
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
      {/* TODO: you still need to refresh */}
      <Show when={!graph()}>
        <p>no graph data... go fetch some posts!</p>
      </Show>
    </div>
  );
}
