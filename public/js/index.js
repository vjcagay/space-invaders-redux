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
let topScore;

let initialMessageOverlay;
let pauseMessageOverlay;
let gameOverMessageOverlay;

let alienLastUpdateTimeStamp = 0;
let missileLastUpdateTimeStamp = 0;

let alienPopulation = 0;
let missilePopulation = 0;
let turret = null;

let isGameOn = false;
let isGamePaused = false;

// This function:
// 1. Updates the position of aliens and missiles
// 2. Spawns aliens
// 3. Checks for collisions
// 4. Removes dead aliens from view
// 5. Removes missiles if they go out of the canvas or hit an alien
// 6. Reruns itself every frame
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
                    missile.coords.x <= alienRightSide &&
                    // Already dead aliens not counted!
                    !alien.dead
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
      stop();
    }
  }
};

// Start the game
const start = () => {
  // Hide the initial message overlay
  initialMessageOverlay.style.display = "none";

  // Change button text
  button.textContent = "Pause";

  // Disable adjusting the speed of the aliens
  speedDial.disabled = true;

  // Render the turret in the bottom center
  turret = new Turret(canvas);
  turret.render(
    store.canvasWidth / 2 - turret.size.width / 2,
    store.canvasHeight - turret.size.height
  );

  missileLastUpdateTimeStamp = Date.now();
  alienLastUpdateTimeStamp = Date.now();

  isGameOn = true;

  run();
};

const pause = () => {
  // Show the pause message overlay
  pauseMessageOverlay.style.display = "flex";

  // Change button text
  button.textContent = "Resume";

  isGamePaused = true;
};

const resume = () => {
  // Hide the pause message overlay
  pauseMessageOverlay.style.display = "none";

  // Change button text
  button.textContent = "Pause";

  isGamePaused = false;

  run();
};

const stop = () => {
  // Show the game over message overlay
  gameOverMessageOverlay.style.display = "flex";

  // Change button text
  button.textContent = "Reset";
};

const cleanup = () => {
  // Remove all the sprites in the canvas
  for (const spriteInstance of Sprite.instances.values()) {
    spriteInstance.destroy();
  }

  alienLastUpdateTimeStamp = 0;
  missileLastUpdateTimeStamp = 0;

  alienPopulation = 0;
  missilePopulation = 0;

  turret = null;

  // Reset game state
  button.textContent = "Start";
  isGameOn = false;
  isGamePaused = false;
  speedDial.disabled = false;

  // Hide the game over message overlay
  gameOverMessageOverlay.style.display = "none";

  // Show the initial message overlay
  initialMessageOverlay.style.display = "flex";

  // Update the top score
  store.topScore = parseInt(localStorage.getItem("TOP_SCORE")) || 0;
  if (store.topScore < store.totalScore) {
    store.topScore = store.totalScore;
    localStorage.setItem("TOP_SCORE", store.topScore);
  }
  topScore.textContent = store.topScore;

  // Reset score
  store.totalScore = 0;
  totalScore.textContent = store.totalScore;
};

const updateScoreByAlienHit = (alien) => {
  // ALIEN_SIZE_MULTIPLIER * 10
  const maxAlienSize = 100;

  // The bigger the alien, the smaller the score
  // On the slowest speed, the biggest alien will be 1 point, while the smallest will be 10
  let points =
    (maxAlienSize - alien.size.width + ALIEN_SIZE_MULTIPLIER) /
    ALIEN_SIZE_MULTIPLIER;

  // The faster the alien, the bigger points the player earns
  points *= store.speed / ALIEN_SIZE_MULTIPLIER;

  store.totalScore += points;
  totalScore.textContent = store.totalScore;
};

window.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("canvas");
  button = document.getElementById("button");
  speedDial = document.getElementById("speed-dial");
  totalScore = document.getElementById("total-score");
  topScore = document.getElementById("top-score");
  initialMessageOverlay = document.getElementById("initial-message");
  pauseMessageOverlay = document.getElementById("pause-message");
  gameOverMessageOverlay = document.getElementById("game-over-message");

  const canvasWidth = parseInt(
    window.getComputedStyle(canvas).width.replace("px", "")
  );

  const canvasHeight = parseInt(
    window.getComputedStyle(canvas).height.replace("px", "")
  );

  // Put these values in the store to be used on other parts of the game
  store.canvasWidth = canvasWidth;
  store.canvasHeight = canvasHeight;

  // Alien will move by the value of the speed dial
  speedDial.value = store.speed;
  speedDial.addEventListener("change", (event) => {
    store.speed = parseInt(event.target.value);
  });

  // Button that toggles to Start/Pause/Resume/Reset
  button.addEventListener("click", () => {
    // If game is on, toggle pause/resume
    if (isGameOn) {
      isGamePaused ? resume() : pause();
      return;
    }

    // If game is not on but there are sprites in the canvas
    // then it's game over and player should reset game
    if (!isGameOn && Sprite.instances.size) {
      cleanup();
      return;
    }

    // Otherwise start the game!
    start();
  });

  // Do initial cleanup
  cleanup();
});
