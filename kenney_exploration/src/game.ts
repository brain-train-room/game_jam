import { Keyboard } from "./keyboard";
import { Tiles } from "./tiles";

export const runGame = ({ canvas, keyboard, tiles }: { canvas: CanvasRenderingContext2D; keyboard: Keyboard; tiles: Tiles }) => {
  //   const coinAudio = new Audio("./chiptone/coin.wav");
  const ctx = canvas;
  ctx.imageSmoothingEnabled = false;
  ctx.textAlign = "left";
  let player_x = 0;
  let player_y = 0;
  function redraw() {
    ctx.clearRect(0, 0, 250, 200);
    // for (let y = 0; y < 11; y += 1) {
    //   for (let x = 0; x < 12; x += 1) {
    //     tiles.drawOn(ctx, { image: y * 12 + x + 1, x: (x - player_x) * 16, y: (y - player_y) * 16, debug: false });
    //   }
    // }
    for (let y = 0; y < 20; y += 1) {
      for (let x = 0; x < 20; x += 1) {
        tiles.drawOn(ctx, { image: y * 12 + x + 1, x: (x - player_x) * 16 + 125, y: (y - player_y) * 16 + 100, debug: true });
      }
    }
  }
  redraw();

  function goto(dx: number, dy: number) {
    player_x += dx;
    player_y += dy;
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
