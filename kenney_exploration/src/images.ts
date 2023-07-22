export type DrawOnParams = {
  image: number; // TODO
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Images = {
  drawOn: (ctx: CanvasRenderingContext2D, params: DrawOnParams) => void;
};

async function loadImage(
  filename: string,
  setup: {
    width: number;
    height: number;
    cutout?: { sx: number; sy: number; sw: number; sh: number };
    filter?: string;
    transform?: { m11: number; m12: number; m21: number; m22: number; dx: number; dy: number };
  }
) {
  return new Promise<Images>(function (resolve, _reject) {
    if (!setup) {
      setup = { width: 111, height: 222 };
    }
    const img = new Image();
    const presized = document.createElement("canvas");
    const presizedCtx = presized.getContext("2d")!;
    presized.width = setup.width;
    presized.height = setup.height;
    if (setup.transform) {
      presizedCtx.setTransform(setup.transform.m11, setup.transform.m12, setup.transform.m21, setup.transform.m22, setup.transform.dx, setup.transform.dy);
    }
    if (setup.filter) {
      presizedCtx.filter = setup.filter;
    }

    img.onload = function () {
      if (setup.cutout) {
        presizedCtx.drawImage(img, setup.cutout.sx, setup.cutout.sy, setup.cutout.sw, setup.cutout.sh, 0, 0, setup.width, setup.height);
      } else {
        presizedCtx.drawImage(img, 0, 0, setup.width, setup.height);
      }
      function drawOn(ctx: CanvasRenderingContext2D, params: DrawOnParams) {
        if (setup.width !== params.width || setup.height !== params.height) {
          console.warn(`OH NOES`, { filename, params });
        }
        ctx.drawImage(presized, params.x, params.y);
      }
      resolve({ drawOn });
    };
    img.src = filename;
  });
}

export async function setupImages() {
  return new Promise<Images>(async function (resolve, _reject) {
    const spring_p = loadImage("./freesvg.org/1278212857.svg", { width: 384, height: 384 });
    const summer_p = loadImage("./freesvg.org/1519987843.svg", { width: 384, height: 291, cutout: { sx: 30, sy: 40, sw: 370, sh: 280 } });
    const autumn_p = loadImage("./freesvg.org/fir-forest-horizontaly-seamless-pattern.svg", { width: 384, height: 377, filter: "hue-rotate(-30deg)" });
    const winter_p = loadImage("./freesvg.org/Winter-Wonderland.svg", { width: 384, height: 192 });
    const money_p = loadImage("./freesvg.org/1515077575.svg", { width: 73, height: 64 });
    const calendar_p = loadImage("./freesvg.org/1550309244.svg", { width: 54, height: 64 });
    const calendar_small_p = loadImage("./freesvg.org/1550309244.svg", { width: 34, height: 40 });
    const binoculars_p = loadImage("./svgrepo.com/binoculars-eye-svgrepo-com.svg", { width: 48, height: 48 });
    const map_p = loadImage("./svgrepo.com/map-svgrepo-com.svg", { width: 48, height: 48 });
    const diamond_p = loadImage("./svgrepo.com/diamond-svgrepo-com.svg", { width: 48, height: 48 });
    const magnet_p = loadImage("./svgrepo.com/magnet-magnet-svgrepo-com.svg", { width: 48, height: 48 });
    const home0_p = loadImage("./freesvg.org/home0.svg", { width: 160, height: 160 });
    const village_house_p = loadImage("./freesvg.org/village-house.svg", { width: 176, height: 176 });
    const house_with_fence_p = loadImage("./freesvg.org/house-with-fence-publicdomainvectors.svg", { width: 203, height: 128 });
    const little_house_p = loadImage("./freesvg.org/1526893083.svg", { width: 128, height: 174 });
    const crooked_house_p = loadImage("./freesvg.org/Crooked-house-07.svg", { width: 125, height: 176 });
    const home0_gray_p = loadImage("./freesvg.org/home0.svg", { width: 160, height: 160, filter: "grayscale(100%) brightness(50%)" });
    const village_house_gray_p = loadImage("./freesvg.org/village-house.svg", { width: 176, height: 176, filter: "grayscale(100%) brightness(50%)" });
    const house_with_fence_gray_p = loadImage("./freesvg.org/house-with-fence-publicdomainvectors.svg", { width: 203, height: 128, filter: "grayscale(100%) brightness(50%)" });
    const little_house_gray_p = loadImage("./freesvg.org/1526893083.svg", { width: 128, height: 174, filter: "grayscale(100%) brightness(50%)" });
    const crooked_house_gray_p = loadImage("./freesvg.org/Crooked-house-07.svg", { width: 125, height: 176, filter: "grayscale(100%) brightness(50%)" });
    const miner_right_p = loadImage("./freesvg.org/GlitchMiner.svg", { width: 32, height: 64, cutout: { sx: 0, sy: 0, sw: 165, sh: 336 } });
    const miner_left_p = loadImage("./freesvg.org/GlitchMiner.svg", {
      width: 32,
      height: 64,
      cutout: { sx: 0, sy: 0, sw: 165, sh: 336 },
      transform: { m11: -1, m12: 0, m21: 0, m22: 1, dx: 32, dy: 0 },
    });
    const christmas_congrats_p = loadImage("./freesvg.org/1545411824.svg", { width: 256, height: 256 });
    const christmas_presents_p = loadImage("./freesvg.org/1545414954.svg", { width: 283, height: 256 });
    const christmas_thanks_p = loadImage("./freesvg.org/Christmas-Elf.svg", { width: 252, height: 256 });
    const santa_p = loadImage("./freesvg.org/1545414729.svg", { width: 235, height: 128, transform: { m11: -1, m12: 0, m21: 0, m22: 1, dx: 235, dy: 0 } });
    const gift1_p = loadImage("./freesvg.org/1280652084.svg", { width: 63, height: 64 });
    const gift2_p = loadImage("./freesvg.org/misc-bag-gift-box-wrapped.svg", { width: 67, height: 64 });
    const gift3_p = loadImage("./freesvg.org/misc-glitchmas-present.svg", { width: 68, height: 64 });
    const dreaming_p = loadImage("./freesvg.org/SRD_comic_clouds_8.svg", { width: 292, height: 277 });
    const alarm_p = loadImage("./freesvg.org/1529962213.svg", { width: 241, height: 221 });
    const [
      spring,
      summer,
      autumn,
      winter,
      money,
      calendar,
      calendar_small,
      binoculars,
      map,
      diamond,
      magnet,
      home0,
      village_house,
      house_with_fence,
      little_house,
      crooked_house,
      home0_gray,
      village_house_gray,
      house_with_fence_gray,
      little_house_gray,
      crooked_house_gray,
      miner_right,
      miner_left,
      christmas_congrats,
      christmas_presents,
      christmas_thanks,
      santa,
      gift1,
      gift2,
      gift3,
      dreaming,
      alarm,
    ] = await Promise.all([
      spring_p,
      summer_p,
      autumn_p,
      winter_p,
      money_p,
      calendar_p,
      calendar_small_p,
      binoculars_p,
      map_p,
      diamond_p,
      magnet_p,
      home0_p,
      village_house_p,
      house_with_fence_p,
      little_house_p,
      crooked_house_p,
      home0_gray_p,
      village_house_gray_p,
      house_with_fence_gray_p,
      little_house_gray_p,
      crooked_house_gray_p,
      miner_right_p,
      miner_left_p,
      christmas_congrats_p,
      christmas_presents_p,
      christmas_thanks_p,
      santa_p,
      gift1_p,
      gift2_p,
      gift3_p,
      dreaming_p,
      alarm_p,
    ]);

    function drawOn(ctx: CanvasRenderingContext2D, params: DrawOnParams) {
      // if (3 > 2) return;
      switch (params.image) {
        case 0:
          spring.drawOn(ctx, params);
          break;
        case 1:
          summer.drawOn(ctx, params);
          break;
        case 2:
          autumn.drawOn(ctx, params);
          break;
        case 3:
          winter.drawOn(ctx, params);
          break;
        case 4:
          money.drawOn(ctx, params);
          break;
        case 5:
          calendar.drawOn(ctx, params);
          break;
        case 6:
          binoculars.drawOn(ctx, params);
          break;
        case 7:
          map.drawOn(ctx, params);
          break;
        case 8:
          diamond.drawOn(ctx, params);
          break;
        case 9:
          magnet.drawOn(ctx, params);
          break;
        case 10:
          calendar_small.drawOn(ctx, params);
          break;
        case 11:
          home0.drawOn(ctx, params);
          break;
        case 12:
          village_house.drawOn(ctx, params);
          break;
        case 13:
          house_with_fence.drawOn(ctx, params);
          break;
        case 14:
          little_house.drawOn(ctx, params);
          break;
        case 15:
          crooked_house.drawOn(ctx, params);
          break;
        case 16:
          home0_gray.drawOn(ctx, params);
          break;
        case 17:
          village_house_gray.drawOn(ctx, params);
          break;
        case 18:
          house_with_fence_gray.drawOn(ctx, params);
          break;
        case 19:
          little_house_gray.drawOn(ctx, params);
          break;
        case 20:
          crooked_house_gray.drawOn(ctx, params);
          break;
        case 21:
          miner_right.drawOn(ctx, params);
          break;
        case 22:
          miner_left.drawOn(ctx, params);
          break;
        case 23:
          christmas_congrats.drawOn(ctx, params);
          break;
        case 24:
          christmas_presents.drawOn(ctx, params);
          break;
        case 25:
          christmas_thanks.drawOn(ctx, params);
          break;
        case 26:
          santa.drawOn(ctx, params);
          break;
        case 27:
          gift1.drawOn(ctx, params);
          break;
        case 28:
          gift2.drawOn(ctx, params);
          break;
        case 29:
          gift3.drawOn(ctx, params);
          break;
        case 30:
          dreaming.drawOn(ctx, params);
          break;
        case 31:
          alarm.drawOn(ctx, params);
          break;
      }
    }
    resolve({ drawOn });
  });
}
