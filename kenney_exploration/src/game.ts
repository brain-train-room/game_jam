import { Keyboard } from "./keyboard";
import { rng } from "./rng";
import { Tiles } from "./tiles";
import village from "../map/village.json";

function toMapKey({ x, y }: { x: number; y: number }) {
  return `${x}:${y}`;
}

const FOREST_LEFT_X = 19;
const DUNGEON_LEFT_X = 138;

function loadWorld() {
  console.log("village", village);
  const tileNames = new Map<number, string>();
  const monsterNames = new Map<number, string>();
  for (const ts of village.tilesets) {
    for (const t of ts.tiles) {
      const id = ts.firstgid + t.id;
      let tileName = undefined;
      let monsterName = undefined;
      for (const p of t.properties) {
        if (p.name === "name" && p.value !== "") {
          tileName = p.value;
        }
        if (p.name === "monster_name" && p.value !== "") {
          monsterName = p.value;
        }
      }
      if (tileName !== undefined) {
        tileNames.set(id, tileName);
      }
      if (monsterName !== undefined) {
        monsterNames.set(id, monsterName);
      }
    }
  }

  function loadLayer(layerIdx: number) {
    const tiles = new Map<
      string,
      {
        x: number;
        y: number;
        gid: number;
        name?: string | undefined;
        drawBeforeBuildings?: boolean;
        teleporterName?: string | undefined;
        monsterName?: string | undefined;
        chestName?: string | undefined;
      }
    >();
    const layer = village.layers[layerIdx];
    switch (layer.type) {
      case "objectgroup":
        for (const obj of layer.objects ?? []) {
          const gid = obj.gid;
          const baseGid = gid % (1 << 29);
          const name = tileNames.get(baseGid);
          const monsterName = monsterNames.get(baseGid);
          let chestName: string | undefined = undefined;
          let drawBeforeBuildings = false;
          let teleporterName = undefined;
          for (const p of obj.properties ?? []) {
            if (p.name === "chest") {
              chestName = p.value;
              if (p.value === "forest_hidden_chest") {
                drawBeforeBuildings = true;
              }
            }
            if (p.name === "stairs") {
              teleporterName = p.value;
            }
          }
          const x = obj.x / 16;
          const y = obj.y / 16 - 1;
          tiles.set(toMapKey({ x, y }), {
            x,
            y,
            gid,
            name,
            drawBeforeBuildings,
            teleporterName,
            monsterName,
            chestName,
          });
        }
        break;
      case "tilelayer":
        for (const chunk of layer.chunks ?? []) {
          for (let h = 0; h < chunk.height; h += 1) {
            for (let w = 0; w < chunk.width; w += 1) {
              const x = chunk.x + w;
              const y = chunk.y + h;
              const gid = chunk.data[h * chunk.width + w];
              if (gid > 0) {
                tiles.set(toMapKey({ x, y }), { x, y, gid });
              }
            }
          }
        }
        break;
    }
    return tiles;
  }
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
  const openedChests = new Set<string>();
  const player = { x: 0, y: 0, sightRadius: 4 };
  let playerKey;
  for (const [key, obj] of world.items) {
    if (obj.name === "player") {
      player.x = obj.x;
      player.y = obj.y;
      playerKey = key;
    }
  }
  // TODO debug
  player.x = -2;
  player.y = 11;
  if (playerKey !== undefined) {
    world.items.delete(playerKey);
  }
  let mazeStringStack: {
    from: { x: number; y: number };
    to: { x: number; y: number };
  }[] = [];
  const mazeStringSet = new Set<string>();
  function recomputeMazeStringSet() {
    mazeStringSet.clear();
    for (const p of mazeStringStack) {
      mazeStringSet.add(toMapKey(p.to));
    }
  }
  let foundMazeString = false;
  //   const coinAudio = new Audio("./chiptone/coin.wav");
  const ctx = canvas;
  ctx.imageSmoothingEnabled = false;
  ctx.textAlign = "left";
  let debugDrawing = false;
  let playerFacing: "left" | "right" = "right";
  function redraw(time: DOMHighResTimeStamp) {
    ctx.clearRect(0, 0, 256, 192);
    ctx.fillStyle = "magenta";
    ctx.fillRect(0, 0, 256, 192);
    for (let dy = -6; dy <= 6; dy += 1) {
      for (let dx = -8; dx <= 8; dx += 1) {
        const x = player.x + dx;
        const y = player.y + dy;
        tiles.drawOn(ctx, {
          image: world.map.get(toMapKey({ x, y }))?.gid,
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
        const item = world.items.get(toMapKey({ x, y }));
        if (item?.drawBeforeBuildings === true) {
          tiles.drawOn(ctx, {
            image: item.gid,
            x: dx * 16 + 128 - 8,
            y: dy * 16 + 96 - 8,
            debug: debugDrawing ? { x, y } : undefined,
          });
        }
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
          image: world.buildings.get(toMapKey({ x, y }))?.gid,
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
        const item = world.items.get(toMapKey({ x, y }));
        if (item?.drawBeforeBuildings === false) {
          tiles.drawOn(ctx, {
            image: item.gid,
            x: dx * 16 + 128 - 8,
            y: dy * 16 + 96 - 8,
            debug: debugDrawing ? { x, y } : undefined,
          });
        }
      }
    }
    ctx.filter = "none";
    ctx.strokeStyle = "gold";
    ctx.lineWidth = 3.0;
    if (foundMazeString) {
      ctx.beginPath();
      for (const step of mazeStringStack) {
        ctx.moveTo(
          128 + (step.from.x - player.x) * 16,
          96 + (step.from.y - player.y) * 16
        );
        ctx.lineTo(
          128 + (step.to.x - player.x) * 16,
          96 + (step.to.y - player.y) * 16
        );
      }
      ctx.stroke();
    }

    tiles.drawOn(ctx, {
      image: 19 * 12 + 4,
      x: 128 - 8,
      y: 96 - 8,
      flipHorizontally: playerFacing === "left",
    });

    // 6*6 + 8*8
    // 36 + 64
    // 100

    // 4*4 ==> 16
    if (player.x >= DUNGEON_LEFT_X) {
      for (let dy = -6 * 16; dy <= 6 * 16; dy += 1) {
        for (let dx = -8 * 16; dx <= 8 * 16; dx += 1) {
          const dist = (dy * dy + dx * dx) / 16 / 16;
          if (dist >= player.sightRadius) {
            ctx.fillStyle = `rgba(0,0,0,1)`;
          } else {
            ctx.fillStyle = `rgba(0,0,0,${dist / player.sightRadius})`;
          }
          ctx.fillRect(dx + 128, dy + 96, 1, 1);
        }
      }
    }

    ctx.fillStyle = "blue";
    ctx.fillText(`${Math.floor(time)}ms`, 5, 20);
    ctx.fillText(`x=${player.x} y=${player.y}`, 5, 40);
    ctx.fillText(`maze stack size ${mazeStringStack.length}`, 5, 60);
    requestAnimationFrame(redraw);
  }
  requestAnimationFrame(redraw);

  function goto(dx: number, dy: number) {
    let to = { x: player.x + dx, y: player.y + dy };
    if (dx < 0) {
      playerFacing = "left";
    } else if (dx > 0) {
      playerFacing = "right";
    }
    if (world.map.get(toMapKey(to)) === undefined) {
      return;
    }
    const item = world.items.get(toMapKey(to));
    if (item?.monsterName !== undefined) {
      alert(`The ${item.monsterName} blocks your path!`);
      return;
    }
    if (item?.chestName !== undefined) {
      alert(`Opened chest: ${item.chestName}`);
      item.gid += 2;
      item.chestName = undefined;
    }
    if (world.buildings.get(toMapKey(to)) !== undefined) {
      return;
    }
    function maybe_teleport() {
      if (item && item.teleporterName !== undefined) {
        console.log("stepped on", item);
        for (const obj of world.items.values()) {
          if (
            obj.teleporterName === item.teleporterName &&
            toMapKey(obj) != toMapKey(to)
          ) {
            console.log("should go to", obj);
            return obj;
          }
        }
      } else {
        return undefined;
      }
      console.error("unmatched teleporter!!");
      return undefined;
    }
    const teleportTo = maybe_teleport();
    if (teleportTo) {
      to = teleportTo;
    }
    if (foundMazeString) {
      const seen = mazeStringSet.has(toMapKey(to));
      if (seen) {
        while (true) {
          const removed = mazeStringStack.pop();
          if (!removed) break;
          if (toMapKey(removed.from) === toMapKey(to)) {
            break;
          }
        }
        recomputeMazeStringSet();
      } else {
        mazeStringStack.push({
          from: { x: player.x, y: player.y },
          to: { x: to.x, y: to.y },
        });
        mazeStringSet.add(toMapKey(to));
      }
    }
    player.x = to.x;
    player.y = to.y;
    if (player.x === 178 && player.y === 12 && dx === 1) {
      foundMazeString = true;
      player.sightRadius *= 2;
      mazeStringStack = [
        {
          from: { x: player.x, y: player.y },
          to: { x: player.x, y: player.y },
        },
      ];
      recomputeMazeStringSet();
    }
    if (player.x === 177 && player.y === 12) {
      foundMazeString = false;
    }
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
