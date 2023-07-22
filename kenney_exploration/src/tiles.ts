import { rng } from "./rng";

export type DrawOnParams = {
  image: number | undefined;
  x: number;
  y: number;
  flipHorizontally?: boolean;
  debug?: { x: number; y: number };
};

export type Tiles = {
  drawOn: (ctx: CanvasRenderingContext2D, params: DrawOnParams) => void;
};

function flipTiles(img: HTMLImageElement, sx: number, sy: number) {
  const flipped = document.createElement("canvas");
  flipped.width = img.width;
  flipped.height = img.height;
  const ctx = flipped.getContext("2d")!;
  for (let y = 0; y < 11; y += 1) {
    for (let x = 0; x < 12; x += 1) {
      ctx.save();
      ctx.translate(x * 16 + 16, y * 16);
      ctx.scale(sx, sy);
      ctx.drawImage(img, x * 16, y * 16, 16, 16, 0, 0, 16, 16);
      ctx.restore();
    }
  }
  return flipped;
}

async function loadImage(filename: string) {
  return new Promise<{
    img: HTMLImageElement;
    flippedHorizontal: HTMLCanvasElement;
    flippedVertical: HTMLCanvasElement;
  }>(function (resolve, _reject) {
    const img = new Image();
    img.onload = function () {
      const flippedHorizontal = flipTiles(img, -1, 1);
      const flippedVertical = flipTiles(img, 1, -1);
      resolve({ img, flippedHorizontal, flippedVertical });
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
      let srcIdx = params.image;
      let flipHorizontally = params.flipHorizontally === true;
      let flipVertically = false;
      if (srcIdx & (1 << 31)) {
        flipHorizontally = true;
      }
      if (srcIdx & (1 << 30)) {
        flipVertically = true;
      }
      const idx = (srcIdx = (srcIdx % (1 << 29)) - 1);
      const sx = (idx % 12) * 16;
      const sy = (Math.floor(idx / 12) % 11) * 16;
      const imgIdx = Math.max(0, Math.min(Math.floor(idx / 12 / 11), 2));
      const imageSet = [town, dungeon, ski][imgIdx];
      let img;
      if (flipHorizontally) {
        img = imageSet.flippedHorizontal;
      } else if (flipVertically) {
        img = imageSet.flippedVertical;
      } else {
        img = imageSet.img;
      }
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
