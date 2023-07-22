import { rng } from "./rng";

export type DrawOnParams = {
  image: number | undefined;
  x: number;
  y: number;
  debug?: { x: number; y: number };
  width?: number;
  height?: number;
  processed?: boolean;
};

export type Tiles = {
  drawOn: (ctx: CanvasRenderingContext2D, params: DrawOnParams) => void;
};

async function loadImage(filename: string) {
  return new Promise<HTMLImageElement>(function (resolve, _reject) {
    const img = new Image();
    img.onload = function () {
      resolve(img);
    };
    img.src = filename;
  });
}

export async function setupTiles() {
  const [town, dungeon, ski] = await Promise.all([
    loadImage("./kenney_tiny-town/Tilemap/tilemap_packed.png"),
    loadImage("./kenney_tiny-dungeon/Tilemap/tilemap_packed.png"),
    loadImage("./kenney_tiny-ski/Tilemap/tilemap_packed.png"),
  ]);
  return {
    drawOn(ctx: CanvasRenderingContext2D, params: DrawOnParams) {
      if (params.image === undefined) {
        return;
      }
      const idx = params.image - 1;
      const sx = (idx % 12) * 16;
      const sy = (Math.floor(idx / 12) % 11) * 16;
      const imgIdx = Math.max(0, Math.min(Math.floor(idx / 12 / 11), 2));
      const img = [town, dungeon, ski][imgIdx];
      ctx.drawImage(img, sx, sy, 16, 16, params.x, params.y, 16, 16);
      if (params.debug) {
        const r = rng([1, 5, 3, params.debug.x, params.debug.y]);
        const g = rng([0.4, params.debug.y, 57, 2, params.debug.x]);
        const b = rng([params.debug.x, 2.3, params.debug.y, 6, 3]);
        function m(v: number) {
          return Math.floor(v * 255);
        }
        ctx.fillStyle = `rgba(${m(r)}, ${m(g)}, ${m(b)}, 0.1)`;
        ctx.fillRect(params.x, params.y, 16, 16);
      }
    },
  };
}
