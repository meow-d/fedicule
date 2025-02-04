import { data } from "../../stores/data";
import { settings, setSettings, UserFilter } from "../../stores/settings";
import Button from "../ui/Button";
import Section from "../ui/Section";

export default function SettingsSection() {
  function changeFilter(e: Event) {
    if (!(e.target instanceof HTMLSelectElement)) return;
    setSettings({ userFilter: e.target.value as unknown as UserFilter });
  }

  function changeLayout(e: Event) {
    if (!(e.target instanceof HTMLSelectElement)) return;
    setSettings({
      layout: e.target.value as "force" | "forceAtlas2",
    });
  }

  return (
    <Section title="Settings" open={!!data.processedData}>
      <div>
        <label for="search">Search (wip)</label>
        <input type="text" onInput={(e) => setSettings("search", e.target.value)} />
      </div>

      <div>
        <label for="zoom">Zoom</label>
        <input
          type="range"
          min="0.1"
          max="4"
          step="0.1"
          value={settings.zoomAmount}
          onInput={(e) => setSettings("zoomAmount", parseFloat(e.target.value))}
        />
      </div>

      <div>
        <label for="filter">Filter users (wip)</label>
        <select name="filter" id="filter" onChange={changeFilter}>
          <option value={UserFilter.None}>None</option>
          <option value={UserFilter.FollowersOnly}>Followers only</option>
          <option value={UserFilter.MutualsOnly}>Mutuals only</option>
        </select>
      </div>

      <div>
        <label for="layout">Layout algorithm</label>
        <select name="layout" id="layout" onChange={changeLayout} value={settings.layout}>
          <option value="force">force</option>
          <option value="forceAtlas2">ForceAtlas2 (not draggable)</option>
        </select>
      </div>
    </Section>
  );
}
