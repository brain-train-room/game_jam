import "./style.css";
import { setupCanvas } from "./canvas.ts";
import { runGame } from "./game.ts";
import { setupKeyboard } from "./keyboard.ts";
import { setupTiles } from "./tiles.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <canvas id="game_canvas" style="height:100%;margin-left:auto;margin-right:auto;display:flex;image-rendering:pixelated;"></canvas>
  `;

const keyboard = setupKeyboard(document.body);
const canvas = setupCanvas(
  document.querySelector<HTMLCanvasElement>("#game_canvas")!
)!;

setupTiles().then((tiles) => {
  runGame({ canvas, keyboard, tiles });
});
