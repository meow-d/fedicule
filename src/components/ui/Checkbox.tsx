import { JSX } from "solid-js/jsx-runtime";
import style from "./Checkbox.module.css";

interface CheckboxProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  displayName?: string;
  tooltip?: string;
  showTooltip?: boolean;
}

export default function Checkbox(props: CheckboxProps) {
  return (
    <div class={style.checkbox}>
      <input
        type="checkbox"
        name={props.name}
        id={props.name}
        checked={props.checked}
        onChange={props.onChange}
        ref={props.ref}
      />
      <label
        for={props.name}
        class={style.label + (props.showTooltip ? " " + style.tooltip : "")}
        title={props.showTooltip ? props.tooltip : ""}
      >
        {props.displayName ? props.displayName : props.name}
      </label>
    </div>
  );
}
