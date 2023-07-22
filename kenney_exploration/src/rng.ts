export function rng(inputs: number[]) {
  let v = 13.37;
  for (const i of inputs) {
    v = Math.sin(v * i + i + v);
  }
  v = Math.sin(v) * 10000;
  v = v - Math.floor(v);
  return v;
}
