import { For, Show } from "solid-js";

import { fitViewportToCommunity } from "./graph/Graph";
import { communities, state } from "../stores/graph";

// TODO: split css files properly
import sidebarStyles from "./sidebar/Sidebar.module.css";
import styles from "./Floating.module.css";

import Button from "./ui/Button";
import Section from "./ui/Section";

export default function Floating() {
  return (
    <aside class={styles.container}>
      <Section title="Selected nodes (double click)" class={styles.floating}>
        <Show when={state.selectedNodes.size === 0}>
          <div>no node selected</div>
        </Show>

        <For each={Array.from(state.selectedNodes.values())}>
          {(node) => (
            <div class={styles.node}>
              <img src={node.image} alt={node.label} />
              <span>
                <div>{node.display_name}</div>
                <div>{node.label}</div>
              </span>
            </div>
          )}
        </For>
      </Section>

      <Section title="Polycules" open={true} class={styles.floating}>
        <div>
          <For each={communities()}>
            {(community) => (
              <Button background="#813975" style={{ width: "100%" }}>
                <div
                  class={styles.community}
                  style={{ color: community.color }}
                  onClick={() => fitViewportToCommunity(community.id)}
                >
                  <span>{community.id}</span>
                  <span>{community.largestNode}</span>
                </div>
              </Button>
            )}
          </For>
        </div>
      </Section>
    </aside>
  );
}
