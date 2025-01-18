import logo from "../../assets/logo.svg";
import styles from "./Sidebar.module.css";

import AccountSection from "./AccountSection";
import FetchSection from "./FetchSection";
import Controls from "./Settings";

export default function Sidebar() {
  let collapsed = false;

  return (
    <aside>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <h1>Fedicule</h1>
      </header>

      <div class={styles.content}>
        <AccountSection />
        <FetchSection />
        <Controls />
      </div>
      <button id={styles.collapseButton}>aaa</button>
    </aside>
  );
}
