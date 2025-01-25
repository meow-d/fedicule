import logo from "../../assets/logo.svg";
import styles from "./Sidebar.module.css";

import DataSection from "./DataSection";
import FetchSection from "./FetchSection";
import SettingsSection from "./SettingsSection";

export default function Sidebar() {
  let collapsed = false;

  return (
    <aside>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <h1>Fedicule</h1>
      </header>

      <div class={styles.content}>
        <DataSection />
        {/* TODO: delete */}
        {/* <FetchSection /> */}
        <SettingsSection />
      </div>
      <button id={styles.collapseButton}>aaa</button>
    </aside>
  );
}
