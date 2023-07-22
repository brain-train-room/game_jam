export function setupCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 1344;
  canvas.height = 1000;
  return canvas.getContext("2d");
}
