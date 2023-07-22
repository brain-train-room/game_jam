import { Keyboard } from "./keyboard";
import { rng } from "./rng";
import { Tiles } from "./tiles";
import village from "../map/village.json";

function toMapKey({ x, y }: { x: number; y: number }) {
  return `${x}:x${y}`;
}

function loadLayer(layerIdx: number) {
  const tiles = new Map<string, number>();
  for (const chunk of village.layers[layerIdx].chunks) {
    for (let h = 0; h < chunk.height; h += 1) {
      for (let w = 0; w < chunk.width; w += 1) {
        const x = chunk.x + w;
        const y = chunk.y + h;
        const tile = chunk.data[h * chunk.width + w];
        if (tile > 0) {
          tiles.set(toMapKey({ x, y }), tile);
        }
      }
    }
  }
  return tiles;
}

function loadWorld() {
  const map = loadLayer(0);
  const buildings = loadLayer(1);
  const items = loadLayer(2);
  return { map, buildings, items };
}

export const runGame = ({
  canvas,
  keyboard,
  tiles,
}: {
  canvas: CanvasRenderingContext2D;
  keyboard: Keyboard;
  tiles: Tiles;
}) => {
  const world = loadWorld();
  //   const coinAudio = new Audio("./chiptone/coin.wav");
  const ctx = canvas;
  ctx.imageSmoothingEnabled = false;
  ctx.textAlign = "left";
  const player = { x: -13, y: -6 };
  let debugDrawing = false;
  function redraw(time: DOMHighResTimeStamp) {
    ctx.clearRect(0, 0, 256, 192);
    ctx.fillStyle = "magenta";
    ctx.fillRect(0, 0, 256, 192);
    for (let dy = -6; dy <= 6; dy += 1) {
      for (let dx = -8; dx <= 8; dx += 1) {
        const x = player.x + dx;
        const y = player.y + dy;
        tiles.drawOn(ctx, {
          image: world.map.get(toMapKey({ x, y })),
          x: dx * 16 + 128 - 8,
          y: dy * 16 + 96 - 8,
          debug: debugDrawing ? { x, y } : undefined,
        });
      }
    }
    if (debugDrawing) {
      ctx.filter = `blur(1px)`;
    }
    for (let dy = -6; dy <= 6; dy += 1) {
      for (let dx = -8; dx <= 8; dx += 1) {
        const x = player.x + dx;
        const y = player.y + dy;
        tiles.drawOn(ctx, {
          image: world.buildings.get(toMapKey({ x, y })),
          x: dx * 16 + 128 - 8,
          y: dy * 16 + 96 - 8,
          debug: debugDrawing ? { x, y } : undefined,
        });
      }
    }
    if (debugDrawing) {
      ctx.filter = `brightness(500%)`;
    }
    for (let dy = -6; dy <= 6; dy += 1) {
      for (let dx = -8; dx <= 8; dx += 1) {
        const x = player.x + dx;
        const y = player.y + dy;
        tiles.drawOn(ctx, {
          image: world.items.get(toMapKey({ x, y })),
          x: dx * 16 + 128 - 8,
          y: dy * 16 + 96 - 8,
          debug: debugDrawing ? { x, y } : undefined,
        });
      }
    }
    ctx.filter = "none";
    tiles.drawOn(ctx, {
      image: 19 * 12 + 4,
      x: 128 - 8,
      y: 96 - 8,
    });
    ctx.fillText(`${Math.floor(time)}ms`, 5, 20);
    requestAnimationFrame(redraw);
  }
  requestAnimationFrame(redraw);

  function goto(dx: number, dy: number) {
    const to = { x: player.x + dx, y: player.y + dy };
    if (world.buildings.get(toMapKey(to)) !== undefined) {
      return;
    }
    player.x = to.x;
    player.y = to.y;
    // redraw();
  }
  keyboard.onKeyDown("ArrowLeft", () => {
    goto(-1, 0);
  });
  keyboard.onKeyDown("ArrowRight", () => {
    goto(+1, 0);
  });
  keyboard.onKeyDown("ArrowUp", () => {
    goto(0, -1);
  });
  keyboard.onKeyDown("ArrowDown", () => {
    goto(0, +1);
  });

  keyboard.onKeyDown("a", () => {
    goto(-1, 0);
  });
  keyboard.onKeyDown("d", () => {
    goto(+1, 0);
  });
  keyboard.onKeyDown("w", () => {
    goto(0, -1);
  });
  keyboard.onKeyDown("s", () => {
    goto(0, +1);
  });
  keyboard.onKeyDown("A", () => {
    goto(-1, 0);
  });
  keyboard.onKeyDown("D", () => {
    goto(+1, 0);
  });
  keyboard.onKeyDown("W", () => {
    goto(0, -1);
  });
  keyboard.onKeyDown("S", () => {
    goto(0, +1);
  });

  keyboard.onKeyDown("h", () => {
    goto(-1, 0);
  });
  keyboard.onKeyDown("l", () => {
    goto(+1, 0);
  });
  keyboard.onKeyDown("k", () => {
    goto(0, -1);
  });
  keyboard.onKeyDown("j", () => {
    goto(0, +1);
  });
  keyboard.onKeyDown("H", () => {
    goto(-1, 0);
  });
  keyboard.onKeyDown("L", () => {
    goto(+1, 0);
  });
  keyboard.onKeyDown("K", () => {
    goto(0, -1);
  });
  keyboard.onKeyDown("J", () => {
    goto(0, +1);
  });

  keyboard.onKeyDown("q", () => {
    debugDrawing = true;
  });
  keyboard.onKeyUp("q", () => {
    debugDrawing = false;
  });
};
