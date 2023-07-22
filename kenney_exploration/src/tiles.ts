export type DrawOnParams = {
  image: number;
  x: number;
  y: number;
  debug?: boolean;
  width?: number;
  height?: number;
  processed?: boolean;
};

export type Tiles = {
  drawOn: (ctx: CanvasRenderingContext2D, params: DrawOnParams) => void;
};

export async function setupTiles() {
  return new Promise<Tiles>(function (resolve, _reject) {
    const img = new Image();
    img.onload = function () {
      // 18 x 8 tiles, tiles are spaced on a 74x74 grid, being 64x64 images with 10px spacing
      function drawOn(ctx: CanvasRenderingContext2D, params: DrawOnParams) {
        const idx = params.image - 1;
        const sx = (idx % 12) * 16;
        const sy = Math.floor(idx / 12) * 16;
        ctx.drawImage(img, sx, sy, 16, 16, params.x, params.y, 16, 16);
        if (params.debug) {
          const mixed = Math.sin(params.x * 1.4) + Math.sin(params.y * 3.3);
          const r = Math.sin(mixed * 137);
          const g = Math.sin(mixed * 419);
          const b = Math.sin(mixed * 287);
          function m(v: number) {
            return Math.floor(((v + 2) / 4) * 255);
          }
          ctx.fillStyle = `rgba(${m(r)}, ${m(g)}, ${m(b)}, 0.5)`;
          ctx.fillRect(params.x, params.y, 16, 16);
        }
      }
      resolve({ drawOn });
    };
    img.src = "./kenney_tiny-town/Tilemap/tilemap_packed.png";
  });
}
