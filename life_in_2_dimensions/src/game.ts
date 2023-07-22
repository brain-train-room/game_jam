import { Images } from "./images";
import { Keyboard } from "./keyboard";
import { Mouse } from "./mouse";
import { Tiles } from "./tiles";

type Material = {
  dirt?: number;
  rock?: number;
  stone?: number;
  iron?: number;
  granite?: number;
  gold?: number;
  emerald?: number;
  diamond?: number;
};

type Tile = {
  image: number;
  hardness: number;
  background: string;
  material?: Material;
  gate?: { which: string; after_gate_hardness: number };
};

function maybeSum(a: number | undefined, b: number | undefined) {
  if (b === undefined) {
    return a;
  } else {
    return (a ?? 0) + b;
  }
}

function determine_material_lines(mat: Material) {
  const lines: { amt: number; str: string; icon: number; processed?: boolean }[] = [];
  function add_line(what: { amt: number | undefined; str: string; icon: number; processed?: boolean }) {
    if (what.amt !== undefined) {
      lines.push({ amt: what.amt, str: what.str, icon: what.icon, processed: what.processed });
    }
  }
  add_line({ amt: mat.rock, str: "Rock", icon: 79, processed: true });
  add_line({ amt: mat.iron, str: "Iron", icon: 97 });
  add_line({ amt: mat.gold, str: "Gold", icon: 132 });
  add_line({ amt: mat.emerald, str: "Emerald", icon: 133 });
  add_line({ amt: mat.diamond, str: "Diamond", icon: 115 });
  return lines;
}

function determine_upgrade_text(values: Record<string, boolean>) {
  const arr = [];
  for (const [key, value] of Object.entries(values)) {
    if (value) {
      arr.push(upgrade_display_map[key]);
    }
    // if (value) {
    //   arr.push(key);
    // }
  }
  return arr;
}

function addMaterial(from: Material, to: Material) {
  return {
    dirt: maybeSum(from.dirt, to.dirt),
    rock: maybeSum(from.rock, to.rock),
    stone: maybeSum(from.stone, to.stone),
    iron: maybeSum(from.iron, to.iron),
    granite: maybeSum(from.granite, to.granite),
    gold: maybeSum(from.gold, to.gold),
    emerald: maybeSum(from.emerald, to.emerald),
    diamond: maybeSum(from.diamond, to.diamond),
  };
}

function subtractMaterial(from: Material, take: Material) {
  let ok = true;
  const trySub = (a: number | undefined, b: number | undefined) => {
    if (b === undefined) {
      return;
    } else {
      const left = (a ?? 0) - b;
      if (left >= 0) {
        return left;
      } else {
        ok = false;
      }
    }
  };
  const out = {
    dirt: trySub(from.dirt, take.dirt),
    rock: trySub(from.rock, take.rock),
    stone: trySub(from.stone, take.stone),
    iron: trySub(from.iron, take.iron),
    granite: trySub(from.granite, take.granite),
    gold: trySub(from.gold, take.gold),
    emerald: trySub(from.emerald, take.emerald),
    diamond: trySub(from.diamond, take.diamond),
  };
  if (ok) {
    return out;
  } else {
    return undefined;
  }
}

const ___AIR: Tile = { image: 0, hardness: 0, background: "lightcyan" };
const _GRASS: Tile = { image: 141, hardness: 0, background: "lightcyan" };
const __BUSH: Tile = { image: 119, hardness: 0, background: "lightcyan" };
const GROUND: Tile = { image: 26, hardness: 1, background: "rgba(187, 128, 68, 1.0)" };
const _____D: Tile = { image: 62, hardness: 1, background: "rgba(187, 128, 68, 1.0)" };
const __ROCK: Tile = { image: 66, hardness: 1, background: "rgba(187, 128, 68, 1.0)", material: { rock: 1 } };
const D_TO_S: Tile = { image: 64, hardness: 2, background: "rgba(137, 164, 166, 1.0)" };
const _____S: Tile = { image: 63, hardness: 2, background: "rgba(137, 164, 166, 1.0)" };
const IRON_1: Tile = { image: 83, hardness: 2, background: "rgba(137, 164, 166, 1.0)", material: { iron: 1 } };
const IRON_2: Tile = { image: 101, hardness: 2, background: "rgba(137, 164, 166, 1.0)", material: { iron: 1 } };
const _BRICK: Tile = { image: 52, hardness: 3, background: "rgba(137, 164, 166, 1.0)", gate: { which: "brick", after_gate_hardness: 2 } };
const GOLD_1: Tile = { image: 84, hardness: 3, background: "rgba(137, 164, 166, 1.0)", material: { gold: 1 } };
const GOLD_2: Tile = { image: 102, hardness: 3, background: "rgba(137, 164, 166, 1.0)", material: { gold: 1 } };
const S_TO_G: Tile = { image: 105, hardness: Infinity, background: "rgba(95, 115, 115, 1.0)", gate: { which: "mine_granite", after_gate_hardness: 4 } };
const _____G: Tile = { image: 106, hardness: Infinity, background: "rgba(95, 115, 115, 1.0)", gate: { which: "mine_granite", after_gate_hardness: 4 } };
const DMND_1: Tile = { image: 85, hardness: 5, background: "rgba(137, 164, 166, 1.0)", material: { diamond: 1 } };
const DMND_2: Tile = { image: 103, hardness: 5, background: "rgba(137, 164, 166, 1.0)", material: { diamond: 1 } };
const DBLOCK: Tile = { image: 62, hardness: Infinity, background: "rgba(187, 128, 68, 1.0)", gate: { which: "mine_boulder", after_gate_hardness: 1 } };
const D_GATE: Tile = { image: 62, hardness: Infinity, background: "rgba(187, 128, 68, 1.0)", gate: { which: "boulder", after_gate_hardness: 1 } };
const SBLOCK: Tile = { image: 65, hardness: Infinity, background: "rgba(137, 164, 166, 1.0)", gate: { which: "mine_boulder", after_gate_hardness: 2 } };
const S_GATE: Tile = { image: 65, hardness: Infinity, background: "rgba(137, 164, 166, 1.0)", gate: { which: "boulder", after_gate_hardness: 2 } };
const GBLOCK: Tile = { image: 106, hardness: Infinity, background: "rgba(95, 115, 115, 1.0)", gate: { which: "mine_boulder", after_gate_hardness: 4 } };
const DMND_G: Tile = { image: 106, hardness: 5, background: "rgba(95, 115, 115, 1.0)", material: { diamond: 1 } };
const EMERLD: Tile = { image: 106, hardness: 4, background: "rgba(95, 115, 115, 1.0)", material: { emerald: 1 } };
const MRLD_S: Tile = { image: 63, hardness: 4, background: "rgba(137, 164, 166, 1.0)", material: { emerald: 1 } };

const debugDrawTiles = (ctx: CanvasRenderingContext2D, tiles: Tiles) => {
  let image = 1;
  ctx.font = "24px serif";
  for (const y of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    for (const x of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
      ctx.fillStyle = "magenta";
      ctx.fillRect(x * 64 - 64, y * 64 - 64, 64, 64);
      tiles.drawOn(ctx, { image: image, x: x * 64 - 64, y: y * 64 - 64 });
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.strokeText(`${image}`, x * 64 - 64, y * 64);
      ctx.fillStyle = "rgba(128, 0, 128, 1.0)";
      ctx.fillText(`${image}`, x * 64 - 64, y * 64);
      image += 1;
    }
  }
};

const xspace = 64;
const yspace = 64;
// const xspace = 96;
// const yspace = 96;

const gameMap = [
  [___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR],
  [___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR],
  [___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR],
  [___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR],
  [___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR],
  [___AIR, _GRASS, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, ___AIR, __BUSH, ___AIR, ___AIR, ___AIR, ___AIR],
  [GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND],
  [_____D, D_GATE, _____D, _____D, DBLOCK, _____D, _____D, _____D, _____D, __ROCK, _____D, _____D, _____D, DBLOCK, _____D],
  [_____D, _____D, _____D, _____D, _____D, __ROCK, _____D, _____D, _____D, _____D, D_GATE, _____D, DBLOCK, _____D, _____D],
  [_____D, _____D, __ROCK, _____D, _____D, D_GATE, _____D, _____D, _____D, _____D, _____D, _____D, __ROCK, _____D, _____D],
  [_____D, __ROCK, DBLOCK, _____D, __ROCK, _____D, _____D, _____D, __ROCK, __ROCK, _____D, _____D, _____D, __ROCK, _____D],
  [D_TO_S, D_TO_S, D_TO_S, D_TO_S, D_TO_S, D_TO_S, D_TO_S, D_TO_S, D_TO_S, D_TO_S, D_TO_S, D_TO_S, D_TO_S, D_TO_S, D_TO_S],
  [_____S, _____S, _____S, _____S, IRON_2, _____S, _____S, SBLOCK, _____S, _____S, _____S, S_GATE, _____S, SBLOCK, _____S],
  [_____S, IRON_1, _____S, _____S, _____S, _____S, _____S, IRON_2, _____S, _____S, _____S, _____S, S_GATE, _____S, _____S],
  [_____S, _____S, SBLOCK, _____S, _____S, _____S, S_GATE, _____S, _____S, SBLOCK, SBLOCK, _____S, _____S, IRON_1, _____S],
  [_____S, _____S, _____S, S_GATE, _____S, SBLOCK, _____S, _____S, _____S, _____S, _____S, _____S, _____S, _____S, _____S],
  [S_GATE, _____S, _____S, _____S, IRON_2, _____S, _____S, S_GATE, _____S, _____S, IRON_1, _____S, _____S, S_GATE, _____S],
  [_____S, _____S, _____S, SBLOCK, SBLOCK, _____S, _____S, _____S, SBLOCK, _____S, _____S, S_GATE, _____S, _____S, S_GATE],
  [_____S, IRON_1, _____S, _____S, _____S, S_GATE, _____S, IRON_2, _____S, S_GATE, _____S, _____S, _____S, _____S, _____S],
  [S_GATE, _____S, _____S, _____S, _____S, _____S, _____S, _____S, S_GATE, _____S, _____S, _____S, IRON_2, _____S, _____S],
  [_____S, S_GATE, _____S, IRON_2, S_GATE, _____S, SBLOCK, _____S, _____S, IRON_1, _____S, _____S, _____S, SBLOCK, SBLOCK],
  [_____S, _____S, _____S, _____S, IRON_1, S_GATE, _____S, _____S, _____S, _____S, SBLOCK, SBLOCK, _____S, SBLOCK, _____S],
  [_BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK],
  [_BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK],
  [_BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK, _BRICK],
  [S_GATE, _____S, SBLOCK, _____S, S_GATE, _____S, _____S, _____S, SBLOCK, _____S, _____S, _____S, _____S, _____S, _____S],
  [_____S, _____S, S_GATE, S_GATE, GOLD_2, S_GATE, SBLOCK, SBLOCK, _____S, _____S, _____S, SBLOCK, _____S, _____S, _____S],
  [_____S, SBLOCK, _____S, _____S, _____S, _____S, S_GATE, _____S, _____S, _____S, S_GATE, _____S, SBLOCK, SBLOCK, S_GATE],
  [_____S, GOLD_1, SBLOCK, _____S, _____S, _____S, _____S, GOLD_2, S_GATE, _____S, _____S, _____S, _____S, _____S, _____S],
  [S_GATE, _____S, SBLOCK, _____S, S_GATE, _____S, _____S, S_GATE, _____S, _____S, _____S, S_GATE, _____S, _____S, _____S],
  [SBLOCK, S_GATE, _____S, _____S, S_GATE, _____S, _____S, S_GATE, _____S, S_GATE, _____S, _____S, _____S, GOLD_1, _____S],
  [DMND_1, SBLOCK, _____S, _____S, _____S, S_GATE, S_GATE, S_GATE, _____S, _____S, _____S, _____S, _____S, _____S, _____S],
  [_____S, SBLOCK, _____S, _____S, _____S, _____S, _____S, _____S, SBLOCK, SBLOCK, SBLOCK, SBLOCK, SBLOCK, SBLOCK, _____S],
  [_____S, SBLOCK, _____S, S_GATE, _____S, _____S, _____S, _____S, _____S, S_GATE, S_GATE, SBLOCK, SBLOCK, SBLOCK, SBLOCK],
  [_____S, SBLOCK, _____S, SBLOCK, GOLD_2, _____S, S_GATE, _____S, _____S, _____S, GOLD_1, S_GATE, SBLOCK, SBLOCK, DMND_2],
  [_____S, _____S, SBLOCK, SBLOCK, SBLOCK, _____S, _____S, _____S, _____S, _____S, _____S, _____S, SBLOCK, SBLOCK, MRLD_S],
  [SBLOCK, _____S, SBLOCK, GOLD_1, _____S, _____S, _____S, S_GATE, S_GATE, _____S, _____S, _____S, _____S, SBLOCK, SBLOCK],
  [_____S, GOLD_2, _____S, _____S, _____S, S_GATE, SBLOCK, SBLOCK, S_GATE, _____S, S_GATE, S_GATE, _____S, SBLOCK, SBLOCK],
  [_____S, GOLD_1, S_GATE, S_GATE, S_GATE, _____S, _____S, GOLD_2, SBLOCK, SBLOCK, S_GATE, S_GATE, S_GATE, _____S, SBLOCK],
  [S_GATE, _____S, _____S, _____S, _____S, _____S, _____S, _____S, _____S, _____S, SBLOCK, SBLOCK, SBLOCK, _____S, SBLOCK],
  [S_GATE, _____S, _____S, _____S, _____S, S_GATE, _____S, _____S, _____S, _____S, _____S, _____S, GOLD_2, _____S, SBLOCK],
  [S_GATE, S_GATE, SBLOCK, GOLD_1, _____S, _____S, _____S, S_GATE, _____S, S_GATE, _____S, _____S, _____S, _____S, S_GATE],
  [_____S, S_GATE, SBLOCK, GOLD_2, _____S, _____S, SBLOCK, SBLOCK, _____S, GOLD_1, S_GATE, S_GATE, _____S, _____S, _____S],
  [_____S, GOLD_1, SBLOCK, SBLOCK, S_GATE, _____S, SBLOCK, S_GATE, _____S, _____S, _____S, _____S, S_GATE, S_GATE, S_GATE],
  [SBLOCK, SBLOCK, S_GATE, S_GATE, _____S, SBLOCK, _____S, _____S, GOLD_1, _____S, _____S, _____S, _____S, _____S, SBLOCK],
  [S_TO_G, S_TO_G, S_TO_G, S_TO_G, S_TO_G, S_TO_G, S_TO_G, S_TO_G, S_TO_G, S_TO_G, S_TO_G, S_TO_G, S_TO_G, S_TO_G, S_TO_G],
  [GBLOCK, _____G, _____G, _____G, _____G, _____G, _____G, _____G, _____G, _____G, _____G, _____G, _____G, _____G, _____G],
  [_____G, EMERLD, GBLOCK, _____G, GBLOCK, _____G, _____G, _____G, _____G, DMND_G, GBLOCK, _____G, _____G, _____G, EMERLD],
  [_____G, _____G, _____G, EMERLD, _____G, EMERLD, EMERLD, GBLOCK, GBLOCK, _____G, _____G, _____G, EMERLD, _____G, _____G],
  [_____G, DMND_G, _____G, _____G, EMERLD, GBLOCK, _____G, _____G, _____G, EMERLD, DMND_G, EMERLD, GBLOCK, DMND_G, _____G],
  [EMERLD, _____G, GBLOCK, DMND_G, EMERLD, _____G, EMERLD, _____G, EMERLD, _____G, _____G, EMERLD, EMERLD, _____G, GBLOCK],
  [EMERLD, DMND_G, _____G, _____G, _____G, _____G, _____G, EMERLD, _____G, EMERLD, _____G, _____G, _____G, _____G, _____G],
  [GBLOCK, _____G, _____G, _____G, _____G, EMERLD, DMND_G, _____G, _____G, GBLOCK, GBLOCK, _____G, DMND_G, EMERLD, GBLOCK],
  [GBLOCK, _____G, _____G, DMND_G, GBLOCK, _____G, _____G, _____G, DMND_G, _____G, EMERLD, EMERLD, DMND_G, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, _____G, _____G, GBLOCK, GBLOCK, _____G, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, EMERLD, GBLOCK, GBLOCK, _____G, DMND_G, GBLOCK, GBLOCK],
  [_____G, GBLOCK, GBLOCK, _____G, _____G, _____G, _____G, EMERLD, EMERLD, GBLOCK, GBLOCK, GBLOCK, _____G, _____G, GBLOCK],
  [_____G, _____G, GBLOCK, GBLOCK, _____G, DMND_G, _____G, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, _____G, GBLOCK, GBLOCK],
  [DMND_G, _____G, GBLOCK, GBLOCK, GBLOCK, _____G, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [_____G, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, _____G],
  [GBLOCK, GBLOCK, _____G, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, _____G, EMERLD, _____G, GBLOCK, GBLOCK, GBLOCK, _____G],
  [GBLOCK, _____G, DMND_G, EMERLD, GBLOCK, GBLOCK, GBLOCK, _____G, _____G, _____G, _____G, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, _____G, _____G, GBLOCK, GBLOCK, GBLOCK, _____G, DMND_G, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, _____G, EMERLD, _____G, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, _____G, _____G, _____G, _____G, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, _____G, DMND_G, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
  [GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK, GBLOCK],
];

// year 1: £143 | £142 (brick wall unbroken, boulders unbroken)
// year 2: £1932 (brick wall broken, boulders broken)
// year 3: £7943 (brick wall broken, boulders broken, longer days)

// upgrades (10k total):
//   £10	build ladders instantly
//   £10	brick wall broken
//   £10	see further
//   £20	iron worth 2x
//   £50	some boulders broken
//  £100	gold worth 2x
//  £100	reveal all resources on map
//  £200	can mine boulders
//  £500	reveal entire map
// £1000	longer days
// £1000	can mine through granite
// £2000	mine 3x resources
// £5000	auto-collect nearby materials

let visited = gameMap.map((row) => row.map((cell) => cell.hardness === 0));
let laddered = gameMap.map((row) => row.map((_cell) => false));
const seen = gameMap.map((row) => row.map((cell) => cell.hardness === 0 || cell === GROUND));

const upgrades = {
  build_ladders_instantly: false,
  brick_wall_broken: false,
  see_further: false,
  iron_worth_double: false,
  boulders_broken: false,
  gold_worth_double: false,
  reveal_all_resources_on_map: false,
  can_mine_boulders: false,
  reveal_entire_map: false,
  longer_days: false,
  can_mine_granite: false,
  mine_triple_resources: false,
  auto_collect_materials: false,
};

const upgrade_display_map: Record<string, string> = {
  build_ladders_instantly: "A",
  brick_wall_broken: "B",
  see_further: "C",
  iron_worth_double: "D",
  boulders_broken: "E",
  gold_worth_double: "F",
  reveal_all_resources_on_map: "G",
  can_mine_boulders: "H",
  reveal_entire_map: "I",
  longer_days: "J",
  can_mine_granite: "K",
  mine_triple_resources: "L",
  auto_collect_materials: "M",
};

let show_cell_coords = false;

const mapCanvas = document.createElement("canvas");
const mapCanvasCtx = mapCanvas.getContext("2d")!;
mapCanvas.width = 25 * xspace;
mapCanvas.height = 100 * yspace;

function pseudorandomColumn(year: number) {
  return Math.floor(Math.abs(Math.sin(year * year) * 135) + 6) % 15;
}

function formatMoney(amount: number) {
  if (amount >= 1000000) {
    return "∞";
  } else if (amount >= 1000) {
    const rest = `${amount % 1000}`.padStart(3, "0");
    return `${Math.floor(amount / 1000)},${rest}`;
  } else {
    return `${amount}`;
  }
}

function determineBackgroundColor(date: Date) {
  switch (date.getMonth()) {
    case 10:
    case 11:
    case 0:
      return "#9ed4dc";
    case 1:
    case 2:
    case 3:
      return "#77cfe4";
    case 4:
    case 5:
    case 6:
      return "#aee4f4";
    case 7:
    case 8:
    case 9:
      return "#f5d28d";
    default:
      return "#ffffff";
  }
}

let gameDate = new Date();
let lastMoveDate = new Date();
function redrawGameMapTile(tiles: Tiles, x: number, y: number) {
  const ctx = mapCanvasCtx;
  const cell = gameMap[y][x];
  ctx.fillStyle = cell.background;
  if (cell.hardness === 0) {
    ctx.fillStyle = determineBackgroundColor(gameDate);
  }
  ctx.fillRect(x * xspace, y * yspace, 64, 64);
  // if (cell.gate !== undefined) {
  //   ctx.globalAlpha = 0.25;
  // }
  if (seen[y][x] || upgrades.reveal_entire_map || (upgrades.reveal_all_resources_on_map && cell.material !== undefined)) {
    if (upgrades.brick_wall_broken && cell.gate?.which === "brick") {
      tiles.drawOn(ctx, { image: _____S.image, x: x * xspace, y: y * yspace });
      ctx.globalAlpha = 0.4 + Math.sin(x * y) / 4;
      tiles.drawOn(ctx, { image: 100, x: x * xspace, y: y * yspace });
      ctx.globalAlpha = 1.0;
    } else if (upgrades.boulders_broken && cell.gate?.which === "boulder") {
      tiles.drawOn(ctx, { image: cell.image, x: x * xspace, y: y * yspace });
      if (cell === D_GATE) {
        tiles.drawOn(ctx, { image: 66, x: x * xspace, y: y * yspace });
      } else {
        ctx.globalAlpha = 0.2 + Math.sin(x * y) / 8;
        tiles.drawOn(ctx, { image: 98, x: x * xspace, y: y * yspace });
        ctx.globalAlpha = 1.0;
      }
    } else {
      tiles.drawOn(ctx, { image: cell.image, x: x * xspace, y: y * yspace });
      if (cell === GROUND && (gameDate.getMonth() >= 10 || gameDate.getMonth() === 0)) {
        tiles.drawOn(ctx, { image: 28, x: x * xspace, y: y * yspace });
      }
      if (cell === __ROCK) {
        tiles.drawOn(ctx, { image: 79, x: x * xspace, y: y * yspace, processed: true });
      } else if (cell === DMND_G) {
        tiles.drawOn(ctx, { image: 115, x: x * xspace, y: y * yspace });
      } else if (cell === EMERLD || cell === MRLD_S) {
        tiles.drawOn(ctx, { image: 133, x: x * xspace, y: y * yspace });
      } else if (cell.gate?.which === "boulder" || cell.gate?.which === "mine_boulder") {
        tiles.drawOn(ctx, { image: 78, x: x * xspace - 32, y: y * yspace - 28, width: 128, height: 128 });
      }
    }
    // if (cell.material !== undefined) {
    // ctx.beginPath();
    // ctx.fillStyle = "rgba(255, 215, 0, 0.05)";
    // ctx.fillRect(x * xspace, y * xspace, 64, 64);
    // }
    if (visited[y][x] && cell.hardness > 0) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(x * xspace, y * xspace, 64, 64);
    }
    if (laddered[y][x]) {
      tiles.drawOn(ctx, { image: 139, x: x * xspace + 8, y: y * yspace - 11, width: 48, height: 48 });
      tiles.drawOn(ctx, { image: 139, x: x * xspace + 8, y: y * yspace + 16, width: 48, height: 48 });
    }
  } else {
    ctx.font = "48px Kenney Pixel";
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillText("?", x * 64 + 20, y * 64 + 44);
  }
  // ctx.globalAlpha = 1.0;
  if (show_cell_coords) {
    ctx.font = "24px Kenney Pixel";
    ctx.fillStyle = "rgba(128, 0, 128, 1.0)";
    ctx.fillText(`${y}:${cell.image}`, x * 64, y * 64 + 64);
  }
}

const pickaxe_upgrades = new Map([
  [1, { rock: 2 }],
  [2, { iron: 5 }],
  [3, { gold: 3 }],
  [4, { diamond: 2 }],
]);

export const runGame = (canvas: CanvasRenderingContext2D, _drawOnScreen: (src: HTMLCanvasElement) => void, keyboard: Keyboard, mouse: Mouse, tiles: Tiles, images: Images) => {
  const coinAudio = new Audio("./chiptone/coin.wav");
  let sound_enabled = true;
  function play_coin_sound() {
    if (sound_enabled) {
      (coinAudio.cloneNode() as HTMLAudioElement).play();
    }
  }
  const ctx = canvas;
  ctx.textAlign = "left";
  // ctx.scale(2, 2);
  // while (gameDate < new Date("2023-06-07")) {
  //   gameDate.setDate(gameDate.getDate() + 1);
  // }
  // while (gameDate < new Date("2023-12-20")) {
  //   gameDate.setDate(gameDate.getDate() + 1);
  // }
  // while (gameDate < new Date("2024-01-20")) {
  //   gameDate.setDate(gameDate.getDate() + 1);
  // }
  const startDate = new Date(gameDate);
  let player_x = pseudorandomColumn(gameDate.getUTCFullYear());
  let player_y = 5;
  let show_debug_tiles = false;
  let mouse_x = 0;
  let mouse_y = 0;
  // let pickaxe_level = 1;
  let pickaxe_level = 10;
  // let player_material: Material = {
  //   rock: 23,
  //   iron: 1,
  //   gold: 45,
  //   emerald: 7,
  //   diamond: 67,
  // };
  let player_material: Material = {};
  let player_is_falling = false;
  let falling_player_stop_at = 0;
  let player_started_falling_timestamp = performance.now();
  let playing_christmas_game = false;
  let started_playing_christmas_game_timestamp = performance.now();
  let christmas_buying_gifts = false;
  let started_buying_christmas_gifts_timestamp = performance.now();
  let player_money = 0;
  let showing_go_to_north_pole_button = false;
  let showing_shopping_screen = false;
  let showing_gift_delivery = false;
  let started_showing_gift_delivery_timestamp = performance.now();
  let show_you_win_screen = false;
  let started_showing_you_win_screen_timestamp = performance.now();
  let started_showing_intro_screen_timestamp = performance.now();
  let sum_from_selling_ore = 0;
  let player_facing_right = true;
  // playing_christmas_game = true;
  // showing_shopping_screen = true;
  // player_money = 29000;
  let spent_money = 0;
  let spent_days = 0;
  let money_earned = 0;
  function spendDays(amt: number) {
    spent_days += amt;
    lastMoveDate = new Date(gameDate);
    gameDate.setDate(gameDate.getDate() + amt);
  }
  function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    // ctx.beginPath();
    // ctx.lineWidth = 5;
    // ctx.roundRect(x, y, 64, 64, 15);
    // ctx.save();
    // ctx.clip();
    // ctx.lineWidth *= 2;
    // ctx.strokeStyle = color;
    // ctx.stroke();
    // ctx.restore();
    if (player_facing_right) {
      images.drawOn(ctx, { image: 21, x: x + 16, y, width: 65, height: 64 });
    } else {
      images.drawOn(ctx, { image: 22, x: x + 16, y, width: 65, height: 64 });
    }
  }
  function mark_seen(x: number, y: number) {
    function mark(x: number, y: number) {
      if (x >= 0 && x < gameMap[0].length && y >= 0 && y < gameMap.length) {
        if (!seen[y][x]) {
          seen[y][x] = true;
          redrawGameMapTile(tiles, x, y);
        }
      }
    }
    mark(x - 1, y - 1);
    mark(x + 0, y - 1);
    mark(x + 1, y - 1);
    mark(x - 2, y + 0);
    mark(x - 1, y + 0);
    mark(x + 0, y + 0);
    mark(x + 1, y + 0);
    mark(x + 2, y + 0);
    mark(x - 1, y + 1);
    mark(x + 0, y + 1);
    mark(x + 1, y + 1);
    if (upgrades.see_further) {
      mark(x - 2, y - 2);
      mark(x - 1, y - 2);
      mark(x - 0, y - 2);
      mark(x + 1, y - 2);
      mark(x + 2, y - 2);
      mark(x - 3, y - 1);
      mark(x - 2, y - 1);
      mark(x + 2, y - 1);
      mark(x + 3, y - 1);
      mark(x - 4, y + 0);
      mark(x - 3, y + 0);
      mark(x + 3, y + 0);
      mark(x + 4, y + 0);
      mark(x - 3, y + 1);
      mark(x - 2, y + 1);
      mark(x + 2, y + 1);
      mark(x + 3, y + 1);
      mark(x - 2, y + 2);
      mark(x - 1, y + 2);
      mark(x - 0, y + 2);
      mark(x + 1, y + 2);
      mark(x + 2, y + 2);
    }
  }
  mark_seen(player_x, player_y);
  function refresh_entire_map() {
    for (const [y, row] of gameMap.entries()) {
      for (const [x, col] of row.entries()) {
        redrawGameMapTile(tiles, x, y);
      }
    }
  }
  refresh_entire_map();
  const fallen_to_y = () => {
    const dt = performance.now() - player_started_falling_timestamp;
    return player_y + (dt * dt) / 10000;
  };
  let last_busted = 0;
  function restart_mining_game() {
    showing_go_to_north_pole_button = false;
    playing_christmas_game = false;
    christmas_buying_gifts = false;
    showing_shopping_screen = false;
    showing_gift_delivery = false;
    while (gameDate.getMonth() === 11) {
      spendDays(1);
    }
    visited = gameMap.map((row) => row.map((cell) => cell.hardness === 0));
    laddered = gameMap.map((row) => row.map((_cell) => false));
    refresh_entire_map();
    player_x = pseudorandomColumn(gameDate.getUTCFullYear());
    player_y = 3;
    check_and_maybe_start_falling();
  }
  function switch_to_shopping_screen() {
    showing_go_to_north_pole_button = false;
    player_money += sum_from_selling_ore;
    money_earned += sum_from_selling_ore;
    player_material = {};
    showing_shopping_screen = true;
    requestAnimationFrame(redraw);
  }
  const draw_christmas_buying = (y_off: number) => {
    // console.log("draw_christmas_buying()");
    // player_material.rock = 7;
    // player_material.iron = 11;
    // player_material.gold = 22;
    // player_material.diamond = 33;

    const dt = performance.now() - started_buying_christmas_gifts_timestamp;
    // ctx.clearRect(0, 0, 2000, 1000);
    // ctx.fillText(`Buying! dt=${Math.floor(dt)} yoff=${y_off}`, 1000, 550);
    let yidx = 150 + y_off;
    let sum = 0;
    let numtypes = 0;
    function handle_material(name: string, amount: number | undefined, value: number) {
      if (amount === undefined) {
        return;
      }
      ctx.font = "48px Kenney Pixel";
      ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
      if (amount === 1) {
        ctx.fillText(`${amount}x ${name} sold for £${value}`, 200, yidx);
      } else {
        ctx.fillText(`${amount}x ${name} sold for £${value} each = £${amount * value}`, 200, yidx);
      }
      sum += amount * value;
      numtypes += 1;
      yidx += 80;
    }
    handle_material("ROCK", player_material.rock, 1);
    handle_material("IRON", player_material.iron, upgrades.iron_worth_double ? 20 : 10);
    handle_material("GOLD", player_material.gold, upgrades.gold_worth_double ? 200 : 100);
    handle_material("EMERALD", player_material.emerald, 500);
    handle_material("DIAMOND", player_material.diamond, 1000);
    if (numtypes >= 2) {
      ctx.font = "48px Kenney Pixel";
      ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
      yidx += 100;
      ctx.fillText(`TOTAL = £${sum}`, 200, yidx);
    }
    if (dt >= 750 && christmas_buying_gifts) {
      showing_go_to_north_pole_button = true;
      sum_from_selling_ore = sum;
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(0, 0, 0, 1.0)";
      ctx.beginPath();
      ctx.roundRect(200, 750, 650, 80, 50);
      ctx.stroke();
      ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
      ctx.fillText("[PRESS ANY KEY]: GO TO NORTH POLE", 280, 800);
    }
    //   restart_mining_game();
    // }
  };
  const draw_christmas_ascending = () => {
    // console.log("draw_christmas_ascending()");
    const dt = performance.now() - started_playing_christmas_game_timestamp;
    const draw_player_y = Math.max(player_y - (dt * dt) / 10000, -250);
    while (draw_player_y > 1 && draw_player_y < last_busted) {
      last_busted -= 1;
      laddered[last_busted][player_x] = false;
      mine_tile(player_x, last_busted);
    }
    const y_off = -draw_player_y * 55 + 250;
    // ctx.clearRect(0, 0, 2000, 1000);

    ctx.fillStyle = determineBackgroundColor(gameDate);
    ctx.fillRect(0, 0, 960, y_off);
    ctx.fillStyle = "#000000";

    ctx.drawImage(mapCanvas, 0, y_off);
    drawPlayer(ctx, player_x * xspace, draw_player_y * yspace + y_off, "rgba(0, 0, 255, 1.0)");
    // ctx.fillText(`Ascending! dpy=${Math.floor(draw_player_y)} yoff=${y_off}`, 1000, 450);
    draw_christmas_buying(y_off - (250 * 55 + 250));
    if (draw_player_y === -250 && !christmas_buying_gifts) {
      christmas_buying_gifts = true;
      started_buying_christmas_gifts_timestamp = performance.now();
    }
    if (!showing_go_to_north_pole_button) {
      requestAnimationFrame(redraw);
    }
  };
  function tryToUpgrade() {
    if (playing_christmas_game) {
      return;
    }
    const to_upgrade = pickaxe_upgrades.get(pickaxe_level);
    if (to_upgrade) {
      const newm = subtractMaterial(player_material, to_upgrade);
      if (newm) {
        player_material = newm;
        pickaxe_level += 1;
      }
    }
  }
  function placeLadder(x: number, y: number) {
    if (laddered[y][x] === false && !upgrades.build_ladders_instantly) {
      spendDays(1);
    }
    laddered[y][x] = true;
    redrawGameMapTile(tiles, x, y);
    if (visited[y + 1][x] && !laddered[y + 1][x]) {
      placeLadder(x, y + 1);
    }
  }

  function drawUpgrade(idx: number, x: number, y: number) {
    // tiles.drawOn(ctx, { image: 72, x, y, width: 48, height: 48 });
    switch (idx) {
      case 0:
        // £10 build ladders instantly
        tiles.drawOn(ctx, { image: 139, x: x + 6, y: y - 8, width: 36, height: 36 });
        tiles.drawOn(ctx, { image: 139, x: x + 6, y: y + 12, width: 36, height: 36 });
        break;
      case 1:
        // £10 brick wall broken
        tiles.drawOn(ctx, { image: 52, x, y, width: 48, height: 48 });
        break;
      case 2:
        // £10 see further
        images.drawOn(ctx, { image: 6, x, y, width: 48, height: 48 });
        break;
      case 3:
        // £20 iron worth 2x
        tiles.drawOn(ctx, { image: 97, x: x - 6, y: y - 5, width: 48, height: 48 });
        tiles.drawOn(ctx, { image: 97, x: x + 4, y: y + 3, width: 48, height: 48 });
        ctx.font = "32px Kenney Pixel";
        ctx.fillStyle = "rgb(0,128,0)";
        ctx.fillText("2x", x + 14, y + 30);
        break;
      case 4:
        // £50 some boulders broken
        tiles.drawOn(ctx, { image: 78, x: x - 24, y: y - 21, width: 96, height: 96 });
        ctx.font = "48px Kenney Pixel";
        ctx.fillStyle = "rgb(224,80,60)";
        ctx.fillText("-", x + 18, y + 35);
        break;
      case 5:
        // £100 gold worth 2x
        tiles.drawOn(ctx, { image: 132, x: x - 6, y: y - 5, width: 48, height: 48 });
        tiles.drawOn(ctx, { image: 132, x: x + 4, y: y + 3, width: 48, height: 48 });
        ctx.font = "32px Kenney Pixel";
        ctx.fillStyle = "rgb(0,128,0)";
        ctx.fillText("2x", x + 14, y + 30);
        break;
      case 6:
        // £100 reveal all resources on map
        images.drawOn(ctx, { image: 8, x, y, width: 48, height: 48 });
        break;
      case 7:
        // £200 can mine boulders
        tiles.drawOn(ctx, { image: 78, x: x - 24, y: y - 21, width: 96, height: 96 });
        tiles.drawOn(ctx, { image: 3, x, y: y + 15, width: 32, height: 32 });
        break;
      case 8:
        // £500 reveal entire map
        images.drawOn(ctx, { image: 7, x, y, width: 48, height: 48 });
        break;
      case 9:
        // £1000 longer days
        images.drawOn(ctx, { image: 10, x: x + 6, y, width: 34, height: 40 });
        ctx.font = "64px Kenney Pixel";
        ctx.fillStyle = "rgb(0,128,0)";
        ctx.fillText("+", x + 25, y + 50);
        break;
      case 10:
        // £1000 can mine through granite
        tiles.drawOn(ctx, { image: 106, x, y, width: 48, height: 48 });
        tiles.drawOn(ctx, { image: 3, x, y: y + 15, width: 32, height: 32 });
        break;
      case 11:
        // £2000 mine 3x resources
        tiles.drawOn(ctx, { image: 115, x: x - 10, y: y, width: 48, height: 48 });
        tiles.drawOn(ctx, { image: 115, x: x + 5, y: y + 10, width: 48, height: 48 });
        tiles.drawOn(ctx, { image: 115, x: x + 8, y: y - 8, width: 48, height: 48 });
        ctx.font = "32px Kenney Pixel";
        ctx.fillStyle = "rgb(0,128,0)";
        ctx.fillText("3x", x + 14, y + 30);
        break;
      case 12:
        // £5000 auto-collect nearby materials
        images.drawOn(ctx, { image: 9, x, y, width: 48, height: 48 });
        break;
    }
  }

  function draw_shopping_screen() {
    ctx.fillStyle = determineBackgroundColor(gameDate);
    ctx.fillRect(0, 0, 960, 1000);

    let yidx = 20;
    function showUpgrade(idx: number, cost: number, got_it: boolean, key: string, desc: string, bonus: string) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0, 0, 0, 1.0)";
      ctx.beginPath();
      ctx.roundRect(20, yidx, 900, 60, 50);
      ctx.stroke();
      if (got_it) {
        ctx.fillStyle = "rgba(255, 255, 128, 1.0)";
        ctx.fill();
        ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
        ctx.font = "32px Kenney Pixel";
        ctx.fillText(`${desc}: ${bonus}`, 270, yidx + 37);
        drawUpgrade(idx, 190, yidx + 5);
      } else {
        ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
        ctx.font = "32px Kenney Pixel";
        ctx.fillText(`[${key}]: Spend ${cost} to make gift: ${desc.toLowerCase()} - ${bonus}`, 40, yidx + 37);
      }
      yidx += 68;
    }

    showUpgrade(0, 10, upgrades.build_ladders_instantly, "A", "Wooden toys", "Build ladders instantly in the mine");
    showUpgrade(1, 10, upgrades.brick_wall_broken, "B", "Construction set", "Remove brick wall from mine");
    showUpgrade(2, 10, upgrades.see_further, "C", "Binoculars", "See further away when mining");
    showUpgrade(3, 20, upgrades.iron_worth_double, "D", "Tin soldiers", "Mined iron sells for twice as much");
    showUpgrade(4, 50, upgrades.boulders_broken, "E", "Pet rock", "Remove some boulders from the mine");
    showUpgrade(5, 100, upgrades.gold_worth_double, "F", "Chocolate coins", "Mined gold sells for twice as much");
    showUpgrade(6, 100, upgrades.reveal_all_resources_on_map, "G", "Magnifying glass", "Can see distant resources while mining");
    showUpgrade(7, 200, upgrades.can_mine_boulders, "H", "Chemistry kit", "Can move past boulders in the mine");
    showUpgrade(8, 500, upgrades.reveal_entire_map, "I", "World map", "Reveal the entire map of the mine");
    showUpgrade(9, 1000, upgrades.longer_days, "J", "Alarm clock", "Get more done in the mine each day");
    showUpgrade(10, 1000, upgrades.can_mine_granite, "K", "Novelty treasure chest", "Can mine granite");
    showUpgrade(11, 2000, upgrades.mine_triple_resources, "L", "Handcrafted jewelry", "Find triple resources when mining");
    showUpgrade(12, 5000, upgrades.auto_collect_materials, "M", "Robot arm", "Automatically mine nearby resources");

    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0, 0, 0, 1.0)";
    ctx.beginPath();
    ctx.roundRect(100, yidx + 20, 750, 60, 50);
    ctx.stroke();
    ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
    ctx.font = "32px Kenney Pixel";
    // TODO make sure we show the correct year!
    ctx.fillText(`[SPACE]: DELIVER GIFTS FOR ${lastMoveDate.getUTCFullYear()}`, 320, yidx + 57);
  }

  function redraw_side() {
    ctx.fillStyle = determineBackgroundColor(gameDate);
    ctx.fillRect(960, 0, 384, 1000);
    switch (gameDate.getMonth()) {
      case 10:
      case 11:
      case 0:
        images.drawOn(ctx, { image: 3, x: 960, y: 1000 - 191, width: 384, height: 192 });
        break;
      case 1:
      case 2:
      case 3:
        images.drawOn(ctx, { image: 0, x: 960, y: 1000 - 384, width: 384, height: 384 });
        break;
      case 4:
      case 5:
      case 6:
        images.drawOn(ctx, { image: 1, x: 960, y: 1000 - 291, width: 384, height: 291 });
        break;
      case 7:
      case 8:
      case 9:
        images.drawOn(ctx, { image: 2, x: 960, y: 1000 - 377, width: 384, height: 377 });
        break;
      default:
    }

    ctx.fillStyle = "#000000";

    let drawDate = new Date(gameDate);
    if (playing_christmas_game) {
      drawDate = new Date(lastMoveDate);
      drawDate.setDate(1);
      drawDate.setMonth(11);
      drawDate.setDate(24);
    }
    ctx.font = "48px Kenney Pixel";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    const adjY = -90;
    // ctx.fillText(`x:${mouse_x} y:${mouse_y}`, 1000, 50);
    const month = drawDate.toLocaleString("en-GB", { month: "long" });
    // ctx.fillText(`Date: ${date.getDate()} ${month} ${date.getUTCFullYear()}`, 1000, 150);
    images.drawOn(ctx, { image: 5, x: 1050, y: 105 + adjY, width: 54, height: 64 });
    ctx.fillText(`${drawDate.getDate()} ${month}`, 1120, 135 + adjY);
    ctx.fillText(`${drawDate.getUTCFullYear()}`, 1120, 165 + adjY);
    // ctx.fillText(`Money: ${player_money} now + ${spent_money} spent = ${player_money + spent_money}`, 1000, 600);
    if (player_money > 0) {
      images.drawOn(ctx, { image: 4, x: 1045, y: 190 + adjY, width: 73, height: 64 });
      ctx.fillText(`${formatMoney(player_money)}`, 1130, 225 + adjY);
    }
    // const to_upgrade = pickaxe_upgrades.get(pickaxe_level);
    // ctx.fillText(`Pickaxe: ${pickaxe_level}, to upgrade: ${JSON.stringify(to_upgrade)}`, 1000, 250);
    // ctx.fillText(`Material: ${JSON.stringify(player_material)}`, 1000, 50);
    const mat_lines = determine_material_lines(player_material);
    for (const [i, line] of mat_lines.entries()) {
      tiles.drawOn(ctx, {
        image: line.icon,
        x: 1100,
        y: 300 + i * 50 - 42 + adjY,
        width: 64,
        height: 64,
        processed: line.processed,
      });
      ctx.textAlign = "right";
      ctx.fillText(`${line.amt} x`, 1110, 300 + i * 50 + adjY);
      ctx.textAlign = "left";
      ctx.fillText(`${line.str}`, 1155, 300 + i * 50 + adjY);
    }
    // ctx.fillText(`${Math.random()}`, 1000, 25);
    // const show_upgrades = determine_upgrade_text(upgrades);
    // if (show_upgrades.length > 0) {
    //   ctx.font = "32px Kenney Pixel";
    //   ctx.fillText(`Upgrades:`, 1000, 650);
    //   let yupg = 670;
    //   for (const u of show_upgrades) {
    //     ctx.fillText(`${u}`, 1050, yupg);
    //     yupg += 20;
    //   }
    // }

    let upgdNum = 0;
    function maybeDrawUpgrade(idx: number, got_id: boolean) {
      if (got_id) {
        const x = 985 + (upgdNum % 5) * 70;
        const y = 580 + Math.floor(upgdNum / 5) * 55 + adjY;
        drawUpgrade(idx, x, y);
        upgdNum += 1;
      }
    }
    maybeDrawUpgrade(0, upgrades.build_ladders_instantly);
    maybeDrawUpgrade(1, upgrades.brick_wall_broken);
    maybeDrawUpgrade(2, upgrades.see_further);
    maybeDrawUpgrade(3, upgrades.iron_worth_double);
    maybeDrawUpgrade(4, upgrades.boulders_broken);
    maybeDrawUpgrade(5, upgrades.gold_worth_double);
    maybeDrawUpgrade(6, upgrades.reveal_all_resources_on_map);
    maybeDrawUpgrade(7, upgrades.can_mine_boulders);
    maybeDrawUpgrade(8, upgrades.reveal_entire_map);
    maybeDrawUpgrade(9, upgrades.longer_days);
    maybeDrawUpgrade(10, upgrades.can_mine_granite);
    maybeDrawUpgrade(11, upgrades.mine_triple_resources);
    maybeDrawUpgrade(12, upgrades.auto_collect_materials);
    if (upgdNum > 0) {
      ctx.font = "48px Kenney Pixel";
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillText(`Upgrades:`, 1000, 560 + adjY);
    }
  }

  function draw_intro_screen(tnow: number) {
    ctx.clearRect(0, 0, 2000, 1000);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 2000, 1000);
    const dt = tnow - started_showing_intro_screen_timestamp;
    ctx.font = "48px Kenney Pixel";
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    if (dt < 1500) {
      ctx.globalAlpha = 1.0;
    } else {
      ctx.globalAlpha = 0.3;
    }
    images.drawOn(ctx, { image: 30, x: 30, y: 50, width: 292, height: 277 });
    ctx.fillText("I wish...", 130, 150);
    ctx.globalAlpha = 1.0;
    if (dt >= 1500) {
      images.drawOn(ctx, { image: 31, x: 30, y: 400, width: 241, height: 221 });
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
    }
    if (dt >= 2500) {
      ctx.fillText("Oh well,", 330, 500);
    }
    if (dt >= 3500) {
      ctx.fillText("Time to get to work!", 330, 550);
    }
    if (dt < 6000) {
      requestAnimationFrame(draw_intro_screen);
    } else {
      redraw();
    }
  }

  function draw_you_win_screen(tnow: number) {
    ctx.clearRect(0, 0, 2000, 1000);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 2000, 1000);
    const dt = tnow - started_showing_you_win_screen_timestamp;
    ctx.font = "48px Kenney Pixel";
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    images.drawOn(ctx, { image: 23, x: 30, y: 50, width: 256, height: 256 });
    ctx.fillText("Congratulations, you achieved your dream!", 330, 200);
    if (dt >= 1000) {
      images.drawOn(ctx, { image: 24, x: 1030, y: 250, width: 283, height: 256 });
      ctx.fillText("All the children got their Christmas presents.", 330, 400);
    }
    if (dt >= 2000) {
      images.drawOn(ctx, { image: 25, x: 50, y: 450, width: 252, height: 256 });
      ctx.fillText("Thank you Santa!", 330, 600);
    }
    if (dt >= 3000) {
      if (spent_days < 1000) {
        ctx.fillText(`Days played: ${spent_days}   Great job!`, 500, 800);
      } else {
        ctx.fillText(`Days played: ${spent_days}`, 500, 800);
      }
      ctx.fillText(`Money earned: ${money_earned}`, 500, 850);
    }
    // ctx.fillText(`${dt}`, 500, 950);
    if (dt < 4000) {
      requestAnimationFrame(draw_you_win_screen);
    }
  }

  function draw_gift_delivery(tnow: number) {
    ctx.clearRect(0, 0, 2000, 1000);
    ctx.fillStyle = "#223355";
    ctx.fillRect(0, 0, 2000, 1000);
    const dt = tnow - started_showing_gift_delivery_timestamp;
    const santax = Math.min(1000, dt);
    const dx = dt < 1000 ? 0 : -(dt - 1000);
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    // ctx.fillText(`${dt}`, 1000, 100);
    let missing = false;
    let giftidx = 0;
    function drawHouse(idx: number, x: number, has_gift: boolean) {
      // has_gift = true;
      let gift_fallen: boolean;
      if (has_gift && x < 550) {
        // ctx.fillStyle = "rgba(255, 255, 0, 1)";
        gift_fallen = true;
      } else {
        // ctx.fillStyle = "rgba(128, 128, 128, 1)";
        gift_fallen = false;
      }
      if (has_gift) {
        if (x < 800 && x > 500) {
          const giftY = 1200 - x;
          // ctx.fillRect(x + 50, giftY, 64, 64);
          images.drawOn(ctx, { image: 27 + (giftidx % 3), x: x + 40, y: giftY, width: 63, height: 64 });
        }
        giftidx += 1;
      } else {
        missing = true;
      }
      // x + W < 1344
      // W < 1344 - x;
      // ctx.fillRect(x, 700, Math.min(200, Math.max(0, 1344 - x)), 200);
      const house_img = idx % 5;
      let addcolor: 0 | 5;
      if (has_gift && gift_fallen) {
        addcolor = 0;
      } else {
        addcolor = 5;
      }
      switch (house_img) {
        case 0:
          images.drawOn(ctx, { image: 13 + addcolor, x, y: 700, width: 203, height: 128 });
          break;
        case 1:
          images.drawOn(ctx, { image: 14 + addcolor, x, y: 700 - 174 + 128, width: 128, height: 174 });
          break;
        case 2:
          images.drawOn(ctx, { image: 12 + addcolor, x, y: 700 - 44, width: 176, height: 176 });
          break;
        case 3:
          images.drawOn(ctx, { image: 15 + addcolor, x, y: 700 - 32, width: 125, height: 176 });
          break;
        case 4:
          images.drawOn(ctx, { image: 11 + addcolor, x, y: 700 - 32 + 20, width: 160, height: 160 });
          break;
      }
    }
    for (let idx = 0; idx < 150; idx += 1) {
      const x = idx * 64 + dx;
      if (x > -64 && x < 1500) {
        tiles.drawOn(ctx, { image: 28, x, y: 820 });
        tiles.drawOn(ctx, { image: 62, x, y: 820 + 64 });
        tiles.drawOn(ctx, { image: 62, x, y: 820 + 64 + 64 });
      }
    }
    drawHouse(0, 1000 + dx + 0 * 400 + Math.sin(0) * 100, upgrades.build_ladders_instantly);
    drawHouse(1, 1000 + dx + 1 * 400 + Math.sin(1) * 100, upgrades.brick_wall_broken);
    drawHouse(2, 1000 + dx + 2 * 400 + Math.sin(2) * 100, upgrades.see_further);
    drawHouse(3, 1000 + dx + 3 * 400 + Math.sin(3) * 100, upgrades.iron_worth_double);
    drawHouse(4, 1000 + dx + 4 * 400 + Math.sin(4) * 100, upgrades.boulders_broken);
    drawHouse(5, 1000 + dx + 5 * 400 + Math.sin(5) * 100, upgrades.gold_worth_double);
    drawHouse(6, 1000 + dx + 6 * 400 + Math.sin(6) * 100, upgrades.reveal_all_resources_on_map);
    drawHouse(7, 1000 + dx + 7 * 400 + Math.sin(7) * 100, upgrades.can_mine_boulders);
    drawHouse(8, 1000 + dx + 8 * 400 + Math.sin(8) * 100, upgrades.reveal_entire_map);
    drawHouse(9, 1000 + dx + 9 * 400 + Math.sin(9) * 100, upgrades.longer_days);
    drawHouse(10, 1000 + dx + 10 * 400 + Math.sin(10) * 100, upgrades.can_mine_granite);
    drawHouse(11, 1000 + dx + 11 * 400 + Math.sin(11) * 100, upgrades.mine_triple_resources);
    drawHouse(12, 1000 + dx + 12 * 400 + Math.sin(12) * 100, upgrades.auto_collect_materials);

    // ctx.fillStyle = "rgba(255, 0, 0, 1)";
    // ctx.fillRect(santax, 200, 200, 200);
    images.drawOn(ctx, { image: 26, x: santax - 200, y: 300, width: 235, height: 128 });

    if (dt < 7800) {
      requestAnimationFrame(draw_gift_delivery);
    } else if (!missing) {
      started_showing_you_win_screen_timestamp = performance.now();
      show_you_win_screen = true;
      requestAnimationFrame(draw_you_win_screen);
    } else {
      restart_mining_game();
    }
  }

  const redraw = () => {
    ctx.clearRect(0, 0, 2000, 1000);
    redraw_side();

    if (showing_shopping_screen) {
      draw_shopping_screen();
      return;
    }
    // console.log("redraw()");
    if (playing_christmas_game) {
      draw_christmas_ascending();
      return;
    }
    const draw_player_y = player_is_falling ? fallen_to_y() : player_y;
    const y_off = -draw_player_y * 55 + 250;
    ctx.drawImage(mapCanvas, 0, y_off);

    if (show_debug_tiles) {
      ctx.clearRect(0, 0, 2000, 1000);
      debugDrawTiles(ctx, tiles);
    }

    if (player_is_falling) {
      drawPlayer(ctx, player_x * xspace, draw_player_y * yspace + y_off, "rgba(255, 255, 0, 1.0)");
    } else {
      drawPlayer(ctx, player_x * xspace, draw_player_y * yspace + y_off, "rgba(255, 0, 255, 1.0)");
    }
  };
  requestAnimationFrame(draw_intro_screen);
  // redraw();
  // show_you_win_screen = true;
  // requestAnimationFrame(draw_you_win_screen);
  // requestAnimationFrame(draw_gift_delivery);

  const process_falling = (timestamp: DOMHighResTimeStamp) => {
    if (fallen_to_y() >= falling_player_stop_at) {
      player_y = falling_player_stop_at;
      player_is_falling = false;
      mine_tile(player_x, player_y);
      check_and_maybe_start_falling();
    }
    redraw();
    // ctx.fillText(`Falling! ${elapsed}`, 1000, 450);
    if (player_is_falling) {
      requestAnimationFrame(process_falling);
    }
  };
  function has_material(x: number, y: number) {
    if (x >= 0 && x < gameMap[0].length && y >= 0 && y < gameMap.length) {
      if (!visited[y][x] && gameMap[y][x].material !== undefined) {
        return true;
      }
    }
    return false;
  }
  function mine_tile(x: number, y: number, recursed_check = false) {
    if (recursed_check && !has_material(x, y)) {
      return;
    }
    if (!visited[y][x]) {
      visited[y][x] = true;
      const tile = gameMap[y][x];
      player_material = addMaterial(player_material, tile.material ?? {});
      if (upgrades.mine_triple_resources) {
        player_material = addMaterial(player_material, tile.material ?? {});
        player_material = addMaterial(player_material, tile.material ?? {});
      }
      if (tile.material !== undefined) {
        play_coin_sound();
      }
      redrawGameMapTile(tiles, x, y);
    }
    if (!recursed_check) {
      mark_seen(x, y);
    }
    if (upgrades.auto_collect_materials && !recursed_check) {
      mine_tile(x - 1, y - 1, true);
      mine_tile(x, y - 1, true);
      mine_tile(x + 1, y - 1, true);
      mine_tile(x - 1, y, true);
      mine_tile(x + 1, y, true);
      mine_tile(x - 1, y + 1, true);
      mine_tile(x, y + 1, true);
      mine_tile(x + 1, y + 1, true);
    }
  }
  const check_and_maybe_start_falling = () => {
    if (visited[player_y + 1][player_x] && !laddered[player_y + 1][player_x]) {
      falling_player_stop_at = player_y;
      while (visited[falling_player_stop_at + 1][player_x] && !laddered[falling_player_stop_at + 1][player_x]) {
        falling_player_stop_at += 1;
      }
      player_is_falling = true;
      player_started_falling_timestamp = performance.now();
      requestAnimationFrame(process_falling);
    }
  };
  function get_hardness(x: number, y: number) {
    const tile = gameMap[y][x];
    let hardness = tile.hardness;
    if (upgrades.brick_wall_broken && tile.gate?.which === "brick") {
      hardness = tile.gate.after_gate_hardness;
    }
    if (upgrades.boulders_broken && tile.gate?.which === "boulder") {
      hardness = tile.gate.after_gate_hardness;
    }
    if (upgrades.can_mine_boulders && tile.gate?.which === "mine_boulder") {
      hardness = tile.gate.after_gate_hardness;
    }
    if (upgrades.can_mine_granite && tile.gate?.which === "mine_granite") {
      hardness = tile.gate.after_gate_hardness;
    }
    return hardness;
  }
  const goto = (dx: number, dy: number) => {
    const npx = player_x + dx;
    const npy = player_y + dy;
    if (playing_christmas_game || player_is_falling || npx < 0 || npx >= gameMap[0].length || npy < 5 || npy >= gameMap.length - 5) {
      return;
    }
    const hardness = get_hardness(player_x + dx, player_y + dy);
    if (hardness > pickaxe_level) {
      //   alert("Too weak pickaxe!");
      return;
    }
    if (dy === -1) {
      placeLadder(player_x, player_y);
    }
    if (dx > 0) {
      player_facing_right = true;
    } else if (dx < 0) {
      player_facing_right = false;
    }
    player_x += dx;
    player_y += dy;
    let spend_days = 0;
    switch (hardness) {
      case 0:
        spend_days = 1;
        break;
      case 1:
        spend_days = 3;
        break;
      case 2:
        spend_days = 7;
        break;
      case 3:
        spend_days = 14;
        break;
      case 4:
        spend_days = 21;
        break;
      case 5:
        spend_days = 28;
        break;
      default:
        spend_days = 35;
        break;
    }
    if (upgrades.longer_days && spend_days > 1) {
      spend_days = Math.ceil(spend_days / 2);
    }
    if (visited[player_y][player_x]) {
      spend_days = 1;
    }
    const oldMonth = gameDate.getMonth();
    const oldDate = new Date(gameDate);
    spendDays(spend_days);
    mine_tile(player_x, player_y);
    tryToUpgrade();
    if (gameDate.getMonth() !== oldMonth) {
      for (const [y, row] of gameMap.entries()) {
        for (const [x, col] of row.entries()) {
          if (col === GROUND || col.hardness === 0) {
            redrawGameMapTile(tiles, x, y);
          }
        }
      }
    }
    if (laddered[player_y - 1][player_x]) {
      placeLadder(player_x, player_y);
    }
    const isBeforeChristmas = (d: Date) => d.getMonth() < 11 || d.getDate() < 24;
    if (isBeforeChristmas(oldDate) && (!isBeforeChristmas(gameDate) || gameDate.getFullYear() > oldDate.getFullYear())) {
      christmas_buying_gifts = false;
      playing_christmas_game = true;
      started_playing_christmas_game_timestamp = performance.now();
      last_busted = player_y + 1;
    } else {
      check_and_maybe_start_falling();
    }
    redraw();
  };
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
  // keyboard.onKeyDown("d", () => {
  //   show_debug_tiles = true;
  //   redraw();
  // });
  // keyboard.onKeyUp("d", () => {
  //   show_debug_tiles = false;
  //   redraw();
  // });
  // keyboard.onKeyDown("z", () => {
  //   tryToUpgrade();
  //   redraw();
  // });
  // keyboard.onKeyDown("x", () => {
  //   gameDate.setDate(1);
  //   gameDate.setMonth(0);
  //   upgrades.build_ladders_instantly = true;
  //   upgrades.brick_wall_broken = true;
  //   upgrades.see_further = true;
  //   upgrades.iron_worth_double = true;
  //   upgrades.boulders_broken = true;
  //   upgrades.gold_worth_double = true;
  //   upgrades.reveal_all_resources_on_map = true;
  //   upgrades.can_mine_boulders = true;
  //   upgrades.reveal_entire_map = true;
  //   upgrades.longer_days = true;
  //   upgrades.can_mine_granite = true;
  //   upgrades.mine_triple_resources = true;
  //   upgrades.auto_collect_materials = true;
  //   show_cell_coords = true;
  //   refresh_entire_map();
  //   redraw();
  // });
  // keyboard.onKeyDown("y", () => {
  //   upgrades.reveal_entire_map = false;
  //   upgrades.longer_days = false;
  //   upgrades.can_mine_granite = false;
  //   show_cell_coords = false;
  //   refresh_entire_map();
  //   redraw();
  // });
  // mouse.onMove((coords: { x: number; y: number }) => {
  //   mouse_x = coords.x;
  //   mouse_y = coords.y;
  //   redraw();
  // });
  keyboard.onAnyKeyDown((key: string) => {
    if (show_you_win_screen) {
      return;
    } else if (showing_gift_delivery) {
      return;
    } else if (showing_go_to_north_pole_button) {
      switch_to_shopping_screen();
    } else if (showing_shopping_screen) {
      function try_spend_money(amt: number) {
        if (player_money >= amt) {
          player_money -= amt;
          spent_money += amt;
          return true;
        } else {
          return false;
        }
      }
      if (key.toLowerCase() === "a" && !upgrades.build_ladders_instantly && try_spend_money(10)) {
        upgrades.build_ladders_instantly = true;
      }
      if (key.toLowerCase() === "b" && !upgrades.brick_wall_broken && try_spend_money(10)) {
        upgrades.brick_wall_broken = true;
      }
      if (key.toLowerCase() === "c" && !upgrades.see_further && try_spend_money(10)) {
        upgrades.see_further = true;
      }
      if (key.toLowerCase() === "d" && !upgrades.iron_worth_double && try_spend_money(20)) {
        upgrades.iron_worth_double = true;
      }
      if (key.toLowerCase() === "e" && !upgrades.boulders_broken && try_spend_money(50)) {
        upgrades.boulders_broken = true;
      }
      if (key.toLowerCase() === "f" && !upgrades.gold_worth_double && try_spend_money(100)) {
        upgrades.gold_worth_double = true;
      }
      if (key.toLowerCase() === "g" && !upgrades.reveal_all_resources_on_map && try_spend_money(100)) {
        upgrades.reveal_all_resources_on_map = true;
      }
      if (key.toLowerCase() === "h" && !upgrades.can_mine_boulders && try_spend_money(200)) {
        upgrades.can_mine_boulders = true;
      }
      if (key.toLowerCase() === "i" && !upgrades.reveal_entire_map && try_spend_money(500)) {
        upgrades.reveal_entire_map = true;
      }
      if (key.toLowerCase() === "j" && !upgrades.longer_days && try_spend_money(1000)) {
        upgrades.longer_days = true;
      }
      if (key.toLowerCase() === "k" && !upgrades.can_mine_granite && try_spend_money(1000)) {
        upgrades.can_mine_granite = true;
      }
      if (key.toLowerCase() === "l" && !upgrades.mine_triple_resources && try_spend_money(2000)) {
        upgrades.mine_triple_resources = true;
      }
      if (key.toLowerCase() === "m" && !upgrades.auto_collect_materials && try_spend_money(5000)) {
        upgrades.auto_collect_materials = true;
      }
      if (key === " ") {
        // restart_mining_game();
        started_showing_gift_delivery_timestamp = performance.now();
        showing_gift_delivery = true;
        requestAnimationFrame(draw_gift_delivery);
      }
    }
    redraw();
  });
  mouse.onClick((coords: { x: number; y: number }) => {
    // if (showing_go_to_north_pole_button) {
    //   if (coords.x >= 214 && coords.x <= 542 && coords.y >= 540 && coords.y <= 600) {
    //     switch_to_shopping_screen();
    //   }
    // }
  });
};
