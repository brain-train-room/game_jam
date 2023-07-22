import { Keyboard } from "./keyboard";
import { rng } from "./rng";
import { Tiles } from "./tiles";

export const runGame = ({
  canvas,
  keyboard,
  tiles,
}: {
  canvas: CanvasRenderingContext2D;
  keyboard: Keyboard;
  tiles: Tiles;
}) => {
  //   const coinAudio = new Audio("./chiptone/coin.wav");
  const ctx = canvas;
  ctx.imageSmoothingEnabled = false;
  ctx.textAlign = "left";
  const player = { x: 0, y: 0 };
  function get_map_tile({ x, y }: { x: number; y: number }) {
    const r = rng([23.4, 7, x, y]);
    if (r < 0.8) {
      return 1;
    } else if (r < 0.97) {
      return 2;
    } else {
      return 3;
    }
  }
  function get_building_tile({ x, y }: { x: number; y: number }) {
    const r = rng([y, 83.2, x]);
    if (r < 0.97) {
      return undefined;
    } else if (r < 0.98) {
      return 29;
    } else if (r < 0.99) {
      return 28;
    } else {
      return 6;
    }
  }
  function redraw() {
    ctx.clearRect(0, 0, 256, 192);
    ctx.fillRect(0, 0, 256, 192);
    for (let dy = -6; dy <= 6; dy += 1) {
      for (let dx = -8; dx <= 8; dx += 1) {
        const x = player.x + dx;
        const y = player.y + dy;
        tiles.drawOn(ctx, {
          image: get_map_tile({ x, y }),
          x: dx * 16 + 128 - 8,
          y: dy * 16 + 96 - 8,
          debug: { x, y },
        });
        tiles.drawOn(ctx, {
          image: get_building_tile({ x, y }),
          x: dx * 16 + 128 - 8,
          y: dy * 16 + 96 - 8,
          debug: { x, y },
        });
      }
    }
    tiles.drawOn(ctx, {
      image: 19 * 12 + 4,
      x: 128 - 8,
      y: 96 - 8,
    });
  }
  redraw();

  function goto(dx: number, dy: number) {
    const to = { x: player.x + dx, y: player.y + dy };
    if (get_building_tile(to) !== undefined) {
      return;
    }
    player.x = to.x;
    player.y = to.y;
    redraw();
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
};
