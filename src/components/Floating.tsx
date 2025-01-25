import { For, Show } from "solid-js";
// TODO: split css files properly
import sidebarStyles from "./sidebar/Sidebar.module.css";
import styles from "./Floating.module.css";
import {
  communities,
  fitViewportToCommunity,
  selectedNodes,
} from "./graph/Graph";
import Button from "./ui/Button";
import Section from "./ui/Section";

export default function Floating() {
  return (
    <aside class={styles.container}>
      <Section title="Selected nodes (double click)" class={styles.floating}>
        <Show when={selectedNodes().length === 0}>
          <div>no node selected</div>
        </Show>
        <For each={selectedNodes()}>
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
      </Section>
    </aside>
  );
}
