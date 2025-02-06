// no idea what should i really do here, but it works well enough
export function toLogScale(value: number) {
  return Math.pow(Math.E, value);
}

export function toLinearScale(value: number) {
  return Math.log(value) / Math.log(Math.E);
}
