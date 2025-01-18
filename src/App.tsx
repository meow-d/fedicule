import type { Component } from "solid-js";

import styles from "./App.module.css";
import Sidebar from "./components/sidebar/Sidebar";
import { Graph } from "./components/graph/Graph";
import { data } from "./stores/data";
import Floating from "./components/Floating";

const App: Component = () => {
  return (
    <div class={styles.App}>
      <div class={styles.container}>
        <Sidebar />
        <main>
          <Graph />
          <Floating />
        </main>
      </div>
    </div>
  );
};

export default App;
