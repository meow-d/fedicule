import logo from "../../assets/logo.svg";
import styles from "./Sidebar.module.css";

import DataSection from "./DataSection";
import SettingsSection from "./SettingsSection";
import { createSignal, onMount, Show } from "solid-js";

export default function Sidebar() {
  let [collapsed, setCollapsed] = createSignal(false);

  onMount(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    mediaQuery.addEventListener("change", (e) => setCollapsed(e.matches));
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <aside class={collapsed() ? styles.collasped : ""}>
      <button id={styles.collapseButton} onClick={toggleCollapsed}>
        &gt;&gt;
      </button>

      <Show when={!collapsed()}>
        <header class={styles.header}>
          <img src={logo} class={styles.logo} alt="logo" />
          <h1>Fedicule</h1>
        </header>

        <div class={styles.content}>
          <DataSection />
          <SettingsSection />
        </div>
      </Show>
    </aside>
  );
}
