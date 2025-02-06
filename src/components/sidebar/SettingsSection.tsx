import { data } from "../../stores/data";
import { settings, setSettings, UserFilter } from "../../stores/settings";
import { toLogScale, toLinearScale } from "../../lib/logScale";
import Button from "../ui/Button";
import Section from "../ui/Section";

export default function SettingsSection() {
  function changeFilter(e: Event) {
    if (!(e.target instanceof HTMLSelectElement)) return;
    setSettings({ userFilter: e.target.value as unknown as UserFilter });
  }

  function setZoomAmount(e: Event) {
    if (!(e.target instanceof HTMLInputElement)) return;
    const value = parseFloat(e.target.value);
    const finalValue = toLogScale(value);
    setSettings({ zoomAmount: finalValue });
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
