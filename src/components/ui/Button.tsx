import { JSX } from "solid-js/jsx-runtime";
import styles from "./Button.module.css";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  background?: string;
}

export default function Button(props: ButtonProps) {
  // TODO: there are probably some better way to do this but i don't care
  let background =
    props.background ||
    "linear-gradient(to bottom,rgb(233, 104, 155) 1%,rgb(146, 67, 99) 100%)";

  return (
    <button type="button" class={styles.button} {...props}>
      <span
        class={styles.buttonContent}
        style={{ "--button-background": background }}
      >
        {props.children}
      </span>
    </button>
  );
}
