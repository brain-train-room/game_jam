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
      const processed = document.createElement("canvas");
      const processedCtx = processed.getContext("2d")!;
      processed.width = 74 * 18;
      processed.height = 74 * 8;

      processedCtx.filter = "grayscale(100%)";
      processedCtx.drawImage(img, 0, 0);

      // 18 x 8 tiles, tiles are spaced on a 74x74 grid, being 64x64 images with 10px spacing
      function drawOn(ctx: CanvasRenderingContext2D, params: DrawOnParams) {
        // if (3 > 2) return;
        const idx = params.image - 1;
        const sx = (idx % 18) * 74 + 10;
        const sy = Math.floor(idx / 18) * 74 + 10;
        if (params.processed) {
          ctx.drawImage(processed, sx, sy, 64, 64, params.x, params.y, params.width ?? 64, params.height ?? 64);
        } else {
          ctx.drawImage(img, sx, sy, 64, 64, params.x, params.y, params.width ?? 64, params.height ?? 64);
        }
        if (params.debug) {
          ctx.beginPath();
          ctx.roundRect(params.x, params.y, 64, 64, 15);
          ctx.fillStyle = "rgba(255, 0, 255, 0.5)";
          ctx.fill();
          ctx.save();
          ctx.clip();
          ctx.lineWidth *= 2;
          ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
          ctx.stroke();
          ctx.restore();
        }
      }
      resolve({ drawOn });
    };
    img.src = "./kenney_voxel-pack/Vector/vector_tiles_items.svg";
  });
}
