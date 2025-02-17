import { JSX } from "solid-js/jsx-runtime";
import styles from "./Section.module.css";

interface SectionProps extends JSX.HTMLAttributes<HTMLElement> {
  title: string;
  open?: boolean;
}

export default function Section(props: SectionProps) {
  return (
    <section {...props} class={styles.section}>
      <details open={props.open ?? false}>
        <summary>
          <h2>{props.title}</h2>
        </summary>

        {props.children}
      </details>
    </section>
  );
}
