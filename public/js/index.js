"use strict";

import {
  ALIEN_MAX_POPULATION,
  ALIEN_SIZE_MULTIPLIER,
  MISSILE_MOVE_PIXEL,
} from "./constants.js";
import { Turret } from "./characters/turret.js";
import { Sprite } from "./components/sprite.js";
import { fireMissile } from "./game/fire-missile.js";
import { moveTurretToTarget } from "./game/move-turret-to-target.js";
import { spawnAlien } from "./game/spawn-alien.js";
import { store } from "./store.js";

let canvas;
let button;
let speedDial;
let totalScore;

let alienLastUpdateTimeStamp = 0;
let missileLastUpdateTimeStamp = 0;

let alienPopulation = 0;
let missilePopulation = 0;
let turret;

let isGameOn = false;
let isGamePaused = false;

// Do what need to be done each update
const run = () => {
  if (!isGamePaused) {
    if (isGameOn) {
      const now = Date.now();

      // Move and spawn aliens
      if (now - alienLastUpdateTimeStamp >= 1000) {
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
              alien.move(0, store.speed);
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

                    updateScoreByAlienHit(alien);

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
      cleanup();
    }
  }
};

// Start the game
const start = () => {
  turret = new Turret(canvas);

  // Render the turret in the bottom center
  turret.render(
    store.canvasWidth / 2 - turret.size.width / 2,
    store.canvasHeight - turret.size.height
  );

  missileLastUpdateTimeStamp = Date.now();
  alienLastUpdateTimeStamp = Date.now();

  isGameOn = true;

  run();
};

const cleanup = () => {
  // Remove all the sprites in the canvas
  for (const spriteInstance of Sprite.instances.values()) {
    spriteInstance.destroy();
  }

  // Reset game state
  button.textContent = "Start";
  isGameOn = false;
  isGamePaused = false;
  speedDial.disabled = false;

  // Reset score
  store.totalScore = 0;
  totalScore.textContent = store.totalScore;
};

const updateScoreByAlienHit = (alien) => {
  store.totalScore = store.totalScore + 1;
  totalScore.textContent = store.totalScore;
};

window.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("canvas");
  button = document.getElementById("button");
  speedDial = document.getElementById("speed-dial");
  totalScore = document.getElementById("total-score");

  const canvasWidth = parseInt(
    window.getComputedStyle(canvas).width.replace("px", "")
  );

  const canvasHeight = parseInt(
    window.getComputedStyle(canvas).height.replace("px", "")
  );

  // Put these values in the store to be used on other parts of the game
  store.canvasWidth = canvasWidth;
  store.canvasHeight = canvasHeight;

  // Button that switches its text to "Start"/"Pause"/"Continue"
  button.addEventListener("click", () => {
    if (isGameOn) {
      if (isGamePaused) {
        isGamePaused = false;
        run();
      } else {
        isGamePaused = true;
      }
    } else {
      isGameOn = true;
      start();
    }

    if (isGameOn) {
      speedDial.disabled = true;
      button.textContent = isGamePaused ? "Resume" : "Pause";
    }
  });

  speedDial.value = store.speed;

  speedDial.addEventListener("change", (event) => {
    store.speed = parseInt(event.target.value);
  });
});
