import { Keyboard } from "./keyboard";
import { rng } from "./rng";
import { Tiles } from "./tiles";
import village from "../map/village.json";

function toMapKey({ x, y }: { x: number; y: number }) {
  return `${x}:${y}`;
}

const CHEST_NAMES = ["forest_hidden_chest", "castle_top_floor_chest", "dungeon_victory_chest", "maze_string", "dungeon_light_source"] as const;
type ChestName = (typeof CHEST_NAMES)[number];
type ItemName = ChestName | "flower" | "bee_hive" | "empty_cauldron" | "full_cauldron" | "mayor_permission" | "antidote" | "blacksmith_weapons";
type QuestName = "flower" | "pollinate" | "fill_water" | "explore_forest" | "cure_blacksmith";

function describeItem(item: ItemName): string {
  switch (item) {
    case "castle_top_floor_chest":
      return "Torch";
    case "dungeon_victory_chest":
      return "Teleporter";
    case "flower":
      return "Wild flowers";
    case "forest_hidden_chest":
      return "Treasure";
    case "maze_string":
      return "Golden string";
    case "dungeon_light_source":
      return "Torch";
    case "bee_hive":
      return "Bee hive";
    case "empty_cauldron":
      return "Empty cauldron";
    case "full_cauldron":
      return "Water";
    case "mayor_permission":
      return "Authorization to cross bridge";
    case "antidote":
      return "Antidote";
    case "blacksmith_weapons":
      return "Weapons and armor";
  }
}

function describeQuest(quest: QuestName): string {
  switch (quest) {
    case "flower":
      return "Find wild flowers";
    case "pollinate":
      return "TBD pollinate veggies";
    case "fill_water":
      return "Fill cauldron with water";
    case "explore_forest":
      return "Find hidden treasure in forest";
    case "cure_blacksmith":
      return "Cure the blacksmith";
  }
}
const FOREST_LEFT_X = 19;
const DUNGEON_LEFT_X = 138;
const DUNGEON_RIGHT_X = 210;
const FLOWER_GID = 3;

function loadWorld() {
  console.log("village", village);
  const tileNames = new Map<number, string>();
  const monsterNames = new Map<number, string>();
  const blockingTiles = new Set<number>();
  for (const ts of village.tilesets) {
    for (const t of ts.tiles) {
      const baseGid = ts.firstgid + t.id;
      for (const p of t.properties) {
        if (p.name === "name" && p.value !== "" && typeof p.value === "string") {
          tileNames.set(baseGid, p.value);
        }
        if (p.name === "monster_name" && p.value !== "" && typeof p.value === "string") {
          monsterNames.set(baseGid, p.value);
        }
        if (p.name === "blocking" && p.value === true) {
          blockingTiles.add(baseGid);
        }
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
        baseGid: number;
        name?: string | undefined;
        drawBeforeBuildings?: boolean;
        teleporterName?: string | undefined;
        monsterName?: string | undefined;
        chestName?: ChestName | undefined;
        blocking?: boolean;
        hidden: boolean;
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
          const blocking = blockingTiles.has(baseGid);
          let chestName: ChestName | undefined = undefined;
          let drawBeforeBuildings = false;
          let teleporterName = undefined;
          let hidden = false;
          for (const p of obj.properties ?? []) {
            if (p.name === "chest") {
              for (const cn of CHEST_NAMES) {
                if (p.value === cn) {
                  chestName = p.value;
                }
              }
              if (chestName === "forest_hidden_chest") {
                drawBeforeBuildings = true;
              }
              if (chestName === undefined) {
                alert(`Undefined chest: ${JSON.stringify(p)}`);
              }
            }
            if (p.name === "stairs" && typeof p.value === "string") {
              teleporterName = p.value;
            }
            if (p.name === "hidden" && p.value === true) {
              hidden = true;
            }
          }
          const x = obj.x / 16;
          const y = obj.y / 16 - 1;
          tiles.set(toMapKey({ x, y }), {
            x,
            y,
            gid,
            baseGid,
            name,
            drawBeforeBuildings,
            teleporterName,
            monsterName,
            chestName,
            blocking,
            hidden,
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
                const baseGid = gid % (1 << 29);
                tiles.set(toMapKey({ x, y }), { x, y, gid, baseGid, hidden: false });
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

export const runGame = ({ canvas, keyboard, tiles }: { canvas: CanvasRenderingContext2D; keyboard: Keyboard; tiles: Tiles }) => {
  const world = loadWorld();
  const player = { x: 0, y: 0, sightRadius: 4 };
  let playerInventory: ItemName[] = [];
  let playerQuests: QuestName[] = [];
  const completedQuests = new Set<QuestName>();
  let playerKey;
  for (const [key, obj] of world.items) {
    if (obj.name === "player") {
      player.x = obj.x;
      player.y = obj.y;
      playerKey = key;
    }
  }
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
  alert("Your grandpa is lonely ever since your grandma left. He said a special item in the dungeon would help, can you find it for him?");
  let foundMazeString = false;
  //   const coinAudio = new Audio("./chiptone/coin.wav");
  const ctx = canvas;
  ctx.imageSmoothingEnabled = false;
  ctx.textAlign = "left";
  let debugDrawing = false;
  let playerFacing: "left" | "right" = "right";
  function redraw(time: DOMHighResTimeStamp) {
    ctx.clearRect(0, 0, 256, 192);
    ctx.fillStyle = "white";
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
        if (item?.drawBeforeBuildings === true && !item.hidden) {
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
        if (item?.drawBeforeBuildings === false && !item.hidden) {
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
        ctx.moveTo(128 + (step.from.x - player.x) * 16, 96 + (step.from.y - player.y) * 16);
        ctx.lineTo(128 + (step.to.x - player.x) * 16, 96 + (step.to.y - player.y) * 16);
      }
      ctx.stroke();
    }

    tiles.drawOn(ctx, {
      image: 19 * 12 + 4,
      x: 128 - 8,
      y: 96 - 8,
      flipHorizontally: playerFacing === "left",
    });

    if (player.x >= DUNGEON_LEFT_X && player.x <= DUNGEON_RIGHT_X) {
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
    // ctx.fillText(`${Math.floor(time)}ms`, 5, 20);
    // ctx.fillText(`x=${player.x} y=${player.y}`, 5, 40);
    // ctx.fillText(`maze stack size ${mazeStringStack.length}`, 5, 60);
    // ctx.fillText(`inv: ${JSON.stringify(playerInventory.map(describeItem))}`, 5, 80);
    // ctx.fillText(`qst: ${JSON.stringify(playerQuests.map(describeQuest))}`, 5, 100);
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
    const background = world.map.get(toMapKey(to));
    if (background === undefined) {
      return;
    }
    const item = world.items.get(toMapKey(to));
    if (item?.monsterName !== undefined) {
      alert(`The ${item.monsterName} blocks your path!`);
      return;
    }
    if (item?.blocking === true && !item.hidden) {
      switch (item.name) {
        case "archer":
          alert("Great day for practicing!");
          break;
        case "armored_no_helm":
          alert("Hello! It's great we live so close to the forest.");
          break;
        case "sign":
          alert("KEEP OUT! My vegetables are dying.");
          break;
        case "bee_keeper":
          if (!playerQuests.includes("flower")) {
            playerQuests.push("flower");
          }
          if (!completedQuests.has("flower") && playerInventory.includes("flower")) {
            completedQuests.add("flower");
            playerInventory = playerInventory.filter((i) => i !== "flower");
            playerInventory.push("bee_hive");
            alert("Thank you! Take this bee hive as a reward.");
            for (const i of world.items.values()) {
              if (i.name == "beehive") {
                i.hidden = true;
              }
            }
          }
          if (!completedQuests.has("flower")) {
            alert("I need help with my beekeeping, can you bring me some wild flowers from the forest?");
          }
          break;
        case "vegetable_farmer":
          if (!playerQuests.includes("pollinate")) {
            playerQuests.push("pollinate");
          }
          if (!completedQuests.has("pollinate") && playerInventory.includes("bee_hive")) {
            completedQuests.add("pollinate");
            playerInventory = playerInventory.filter((i) => i !== "bee_hive");
            for (const i of world.items.values()) {
              if (i.name == "sign") {
                i.hidden = true;
              }
            }
            for (const i of world.items.values()) {
              if (i.name == "plant") {
                i.hidden = false;
              }
            }
          }
          if (!completedQuests.has("pollinate")) {
            alert("I need bees to help pollinate my crop. Can you find me a bee hive?");
          }
          break;
        case "bucket_empty":
        case "warlock":
          if (!playerQuests.includes("fill_water")) {
            playerQuests.push("fill_water");
            for (const i of world.items.values()) {
              if (i.name == "bucket_empty") {
                i.hidden = true;
              }
            }
            playerInventory.push("empty_cauldron");
          }
          if (playerInventory.includes("full_cauldron")) {
            completedQuests.add("fill_water");
            playerInventory = playerInventory.filter((i) => i !== "full_cauldron");
            for (const i of world.items.values()) {
              if (i.name == "bucket_empty") {
                i.hidden = false;
                i.gid += 1;
                i.baseGid += 1;
              }
              if (i.name === "empty_bottle") {
                i.gid += 1;
                i.baseGid += 1;
              }
            }
          }
          if (!completedQuests.has("fill_water")) {
            alert("If you bring me water I can make potions for you.");
          }
          break;
        case "empty_bottle":
          if (completedQuests.has("fill_water")) {
            playerInventory.push("antidote");
            alert("You pick up the antidote.");
            for (const i of world.items.values()) {
              if (i.name === "empty_bottle") {
                i.hidden = true;
              }
            }
          }
          break;
        case "well_bottom":
        case "well_top":
          if (playerInventory.includes("empty_cauldron")) {
            playerInventory = playerInventory.filter((i) => i !== "empty_cauldron");
            playerInventory.push("full_cauldron");
            alert("You fill the cauldron with water.");
          } else {
            alert("There's plenty of water here, but you don't need it at the moment.");
          }
          break;
        case "blacksmith":
          if (!playerQuests.includes("cure_blacksmith")) {
            playerQuests.push("cure_blacksmith");
          }
          if (playerInventory.includes("antidote")) {
            completedQuests.add("cure_blacksmith");
            playerInventory = playerInventory.filter((i) => i !== "antidote");
            playerInventory.push("blacksmith_weapons");
            alert("Thank you! I can finally get back to making arms for the soldiers in the east.");
          }
          if (!completedQuests.has("cure_blacksmith")) {
            alert("I'm sick after being bit by a spider. Can you bring me an antidote?");
          }
          break;
        case "mayor":
          if (!playerQuests.includes("explore_forest")) {
            playerQuests.push("explore_forest");
          }
          if (playerInventory.includes("forest_hidden_chest")) {
            completedQuests.add("explore_forest");
            playerInventory = playerInventory.filter((i) => i !== "forest_hidden_chest");
            playerInventory.push("mayor_permission");
            alert("Thank you! Can you help our soldiers to the east?");
          }
          if (!completedQuests.has("explore_forest")) {
            alert("Some goblins stole our treasure and hid it in the forest. Can you bring it back?");
          }
          break;
        case "fully_armored":
          if (playerInventory.includes("mayor_permission") && !item.hidden) {
            playerInventory = playerInventory.filter((i) => i !== "mayor_permission");
            for (const i of world.items.values()) {
              if (i.name == "fully_armored" && i.x === item.x) {
                i.hidden = true;
              }
            }
          } else if (playerInventory.includes("blacksmith_weapons") && !item.hidden) {
            playerInventory = playerInventory.filter((i) => i !== "blacksmith_weapons");
            for (const i of world.items.values()) {
              if (i.name == "fully_armored" && i.y === item.y) {
                i.hidden = true;
              }
            }
          }
          if (!item.hidden) {
            if (!completedQuests.has("explore_forest")) {
              alert("No one is allowed to cross the bridge! Unless the mayor says so...");
            } else {
              alert("We can't enter the dungeon at the moment! It's blocked by monsters, and we need more weapons to fight them and scare them away.");
            }
          }
          break;
        case "door":
          if (playerInventory.includes("dungeon_victory_chest")) {
            playerInventory = [];
            playerQuests = [];
            player.x = 237;
            player.y = 2;
            alert("Great! You found the teleporter grandpa was looking for. Now we can finally go visit grandma in the mountains.");
            return;
          } else {
            alert("I can't return yet, I need to find the special item in the dungeon for my grandpa!");
          }
          break;
      }
      // alert(`DEBUG: moved into ${JSON.stringify(item)}`);
      return;
    }
    if (item?.chestName !== undefined) {
      switch (item.chestName) {
        case "castle_top_floor_chest":
          playerInventory.push("castle_top_floor_chest");
          player.sightRadius *= 5;
          break;
        case "dungeon_light_source":
          playerInventory.push("dungeon_light_source");
          player.sightRadius *= 2;
          break;
        case "dungeon_victory_chest":
          playerInventory.push("dungeon_victory_chest");
          break;
        case "forest_hidden_chest":
          playerInventory.push("forest_hidden_chest");
          break;
        case "maze_string":
          playerInventory.push("maze_string");
          break;
        default:
          checkUnreachable(item.chestName);
      }
      item.gid += 2;
      item.chestName = undefined;
    }
    if (to.x >= FOREST_LEFT_X && background.baseGid === 3) {
      if (playerQuests.includes("flower") && !playerInventory.includes("flower") && !completedQuests.has("flower")) {
        world.map.set(toMapKey(to), { ...background, gid: 1, baseGid: 1 });
        playerInventory.push("flower");
      }
    }
    if (world.buildings.get(toMapKey(to)) !== undefined) {
      return;
    }
    function maybe_teleport() {
      if (item && item.teleporterName !== undefined) {
        console.log("stepped on", item);
        for (const obj of world.items.values()) {
          if (obj.teleporterName === item.teleporterName && toMapKey(obj) != toMapKey(to)) {
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

function checkUnreachable(value: never): never {
  console.error(`checkUnreachable reached with value=${value}`);
  throw new Error(`checkUnreachable reached with value=${value}`);
}
