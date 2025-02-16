import Section from "../ui/Section";

export default function AboutSection() {
  return (
    <Section title="About">
      <div>
        <div>
          <p>
            Made with <a href="https://www.solidjs.com/">solidjs</a>,{" "}
            <a href="https://graphology.github.io/">graphology</a>, and <a href="https://www.sigmajs.org/">sigmajs</a>
          </p>
          <p>
            <a href="https://github.com/meow-d/fedicule/">Made with hate &lt;/3 by meow_d</a>
          </p>
          <p>Not affiliated with Ryan solidjs, obviously</p>
        </div>
      </div>
    </Section>
  );
}
