import { For } from "solid-js";

import Section from "../ui/Section";
import { update, focusNode, updateFilter } from "../graph/Graph";
import { toLogScale, toLinearScale } from "../../lib/logScale";

import { settings, setSettings, Filter } from "../../stores/settings";
import { data } from "../../stores/data";
import { nodes } from "../../stores/graph";

export default function SettingsSection() {
  function setSearch(e: Event) {
    if (!(e.target instanceof HTMLInputElement)) return;
    const query = e.target.value;
    setSettings("search", query);
    if (!query) return;

    const nodeList = nodes();
    if (!nodeList) return;

    const matches = nodeList.filter(({ label }) => label.toLowerCase().includes(query.toLowerCase()));
    const exactMatch = matches.length === 1 && matches[0].label === query;
    if (exactMatch) focusNode(matches[0].id);
  }

  function setZoomAmount(e: Event) {
    if (!(e.target instanceof HTMLInputElement)) return;
    const value = parseFloat(e.target.value);
    const finalValue = toLogScale(value);
    setSettings({ zoomAmount: finalValue });
  }

  function changeFilter(e: Event) {
    if (!(e.target instanceof HTMLSelectElement)) return;
    const value = parseInt(e.target.value) as unknown as Filter;
    setSettings({ filter: value });
    updateFilter(value);
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
        <input type="text" id="search" list="suggestions" onInput={setSearch} enterkeyhint="go" />
        <datalist id="suggestions">
          <For each={nodes()}>{(node) => <option value={node.label} />}</For>
        </datalist>
      </div>

      <div>
        <label for="zoom">Zoom</label>
        <input
          style={{ direction: "rtl" }}
          type="range"
          min={toLinearScale(0.3)}
          max={toLinearScale(4)}
          step="any"
          value={toLinearScale(settings.zoomAmount)}
          onInput={setZoomAmount}
        />
      </div>

      <div>
        <label for="filter">Filter users</label>
        <select name="filter" id="filter" onChange={changeFilter}>
          <option value={Filter.None}>Show all</option>
          <option value={Filter.Followers}>Followers only</option>
          <option value={Filter.Following}>Following only</option>
          <option value={Filter.Mutuals}>Mutuals only</option>
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
