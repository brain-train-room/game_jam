export function setupCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 256;
  canvas.height = 192;
  return canvas.getContext("2d");
}
