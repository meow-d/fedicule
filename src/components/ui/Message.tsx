import styles from "./Message.module.css"

interface MessageProps {
  message: string;
  isError: boolean;
}

export default function Message(props: MessageProps) {
  return (
    <p class={styles.message + " " + (props.isError ? styles.error : styles.success)}>
      {props.message}
    </p>
  )
}
