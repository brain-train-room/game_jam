export function setupCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 250;
  canvas.height = 200;
  return canvas.getContext("2d");
}
