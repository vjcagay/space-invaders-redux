import {
  ALIEN_MAX_POPULATION,
  ALIEN_MOVE_PIXEL,
  MISSILE_MOVE_PIXEL,
} from "./constants.js";
import { Turret } from "./characters/turret.js";
import { Sprite } from "./components/sprite.js";
import { fireMissile } from "./game/fire-missile.js";
import { moveTurretToTarget } from "./game/move-turret-to-target.js";
import { spawnAlien } from "./game/spawn-alien.js";
import { store } from "./store.js";

let alienLastUpdateTimeStamp = 0;
let missileLastUpdateTimeStamp = 0;

let alienPopulation = 0;
let missilePopulation = 0;
let turret;

let isGameOn = false;

const run = () => {
  if (isGameOn) {
    const now = Date.now();

    // Spawn and move aliens
    if (now - alienLastUpdateTimeStamp >= 1000) {
      // Try spawning until the max population is reached
      if (alienPopulation < ALIEN_MAX_POPULATION) {
        const alien = spawnAlien(canvas);
        if (alien) {
          alien.onPress((thisAlien) => {
            moveTurretToTarget(turret, thisAlien);
            fireMissile(canvas, turret);
            missilePopulation++;
          });
          alienPopulation++;
        }
      }

      // For each alien;
      // 1. Check any dead aliens and remove them from the canvas
      // 2. Living aliens will keep on moving until they reach the bottom of the canvas
      for (const spriteInstance of Sprite.instances.values()) {
        if (spriteInstance.name === "alien") {
          const alien = spriteInstance;

          if (alien.dead) {
            alien.destroy();
          } else {
            // Aliens move downwards
            alien.move(0, ALIEN_MOVE_PIXEL);
          }

          // Keep the game running until an alien reaches the bottom of the canvas.
          if (alien.coords.y + alien.size.height >= store.canvasHeight) {
            alien.explode();
            turret.explode();

            // Game over!
            isGameOn = false;

            // Stop the loop
            break;
          }
        }
      }

      alienLastUpdateTimeStamp = now;
    }

    // Move the missiles
    if (now - missileLastUpdateTimeStamp >= 50) {
      for (const spriteInstance of Sprite.instances.values()) {
        if (spriteInstance.name === "missile") {
          const missile = spriteInstance;

          // Missiles move upwards
          missile.move(0, MISSILE_MOVE_PIXEL);

          // If missile goes out of the canvas, destroy it
          if (missile.coords.y < 0) {
            missile.destroy();
            missilePopulation--;
          } else {
            // Check if an alien hits the missile
            for (const anotherSpriteInstance of Sprite.instances.values()) {
              if (anotherSpriteInstance.name === "alien") {
                const alien = anotherSpriteInstance;

                const alienBottomSide = alien.coords.y + alien.size.height;
                const alienLeftSide = alien.coords.x;
                const alienRightSide = alienLeftSide + alien.size.width;

                // If an alien hits the missile
                // 1. Make the alien explode. It will be destroyed on the next frame update
                // 2. Destroy the missile.
                if (
                  missile.coords.y <= alienBottomSide &&
                  missile.coords.x >= alienLeftSide &&
                  missile.coords.x <= alienRightSide
                ) {
                  alien.explode();
                  missile.destroy();

                  alienPopulation--;
                  missilePopulation--;
                }
              }
            }
          }
        }
      }

      missileLastUpdateTimeStamp = now;
    }

    window.requestAnimationFrame(run);
  } else {
    alert("Game Over!");
  }
};

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const button = document.getElementById("button");

  const canvasWidth = parseInt(
    window.getComputedStyle(canvas).width.replace("px", "")
  );

  const canvasHeight = parseInt(
    window.getComputedStyle(canvas).height.replace("px", "")
  );

  store.canvasWidth = canvasWidth;
  store.canvasHeight = canvasHeight;

  button.addEventListener("click", () => {
    turret = new Turret(canvas);

    // Render the turret in the bottom center
    turret.render(
      canvasWidth / 2 - turret.size.width / 2,
      canvasHeight - turret.size.height
    );

    missileLastUpdateTimeStamp = Date.now();
    alienLastUpdateTimeStamp = Date.now();

    isGameOn = true;

    run();
  });
});
