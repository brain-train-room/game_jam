import "./style.css";
import { setupCanvas } from "./canvas.ts";
import { runGame } from "./game.ts";
import { setupKeyboard } from "./keyboard.ts";
import { setupTiles } from "./tiles.ts";
import { setupMouse } from "./mouse.ts";
import { setupImages } from "./images.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <canvas id="game_canvas" style="height:100%;margin-left: auto;margin-right:auto;"></canvas>
  `;

const keyboard = setupKeyboard(document.body);
const mouse = setupMouse(document.body);

const canvas = setupCanvas(document.querySelector<HTMLCanvasElement>("#game_canvas")!)!;

function drawOnScreen(src: HTMLCanvasElement) {
  canvas.clearRect(0, 0, 2000, 1000);
  canvas.drawImage(src, 0, 0);
}

const font_p = new FontFace("Kenney Pixel", `url("./kenney_kenney-fonts/Fonts/Kenney Pixel.ttf")`).load();
const tiles_p = setupTiles();
const images_p = setupImages();

Promise.all([font_p, tiles_p, images_p]).then(([_loadedFont, tiles, images]) => {
  runGame(canvas, drawOnScreen, keyboard, mouse, tiles, images);
});
