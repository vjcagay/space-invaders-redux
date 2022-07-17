import { Alien } from "../characters/alien.js";
import { Sprite } from "../components/sprite.js";
import {
  ALIEN_SIZE_MULTIPLIER,
  ALIEN_SPAWN_MAX_ATTEMPTS,
} from "../constants.js";
import { store } from "../store.js";

const spawnAlien = (canvas) => {
  let spawn = null;
  let attempts = 0;

  const attemptSpawn = () => {
    attempts++;

    // Min 10px, Max 100px
    const size =
      (Math.floor(Math.random() * ALIEN_SIZE_MULTIPLIER) + 1) *
      ALIEN_SIZE_MULTIPLIER;
    let xAxis = Math.floor(Math.random() * store.canvasWidth + 1) - size;

    // Enemy should not hang off the left edge of the canvas
    if (xAxis < 0) {
      xAxis = 0;
    }

    // Enemy should not hang off the right edge of the canvas
    if (xAxis + size > store.canvasWidth) {
      xAxis = store.canvasWidth - size;
    }

    let canSpawn = true;

    // Check for existing enemies for possible collisions when the new enemy spawns
    // We want to avoid that, otherwise enemies spawning can stack on top of each other and it does not look nice.
    for (const spriteInstance of Sprite.instances.values()) {
      if (canSpawn && spriteInstance.name === "alien") {
        const alien = spriteInstance;

        const alienLeftSide = alien.coords.x;
        const alienRightSide = alienLeftSide + alien.size.width;
        const alienTopSide = alien.coords.y;
        const alienBottomSide = alienTopSide + alien.size.height;

        const spawnLeftSideXAxis = xAxis;
        const spawnRightSideXAxis = xAxis + size;
        // Enemy spawns always at 0 so no need to check for the top side
        // So the bottom value will always correspond to the spawn's size
        const spawnBottomSideYAxis = size;

        if (spawnBottomSideYAxis < alienBottomSide) {
          // These conditions will guarantee a collision, so prevent spawning

          // Enemy spawn's left side rests on existing enemy's body
          if (
            spawnLeftSideXAxis >= alienLeftSide &&
            spawnLeftSideXAxis <= alienRightSide
          ) {
            canSpawn = false;
          }

          // Enemy spawn's right side rests on existing enemy's body
          if (
            spawnRightSideXAxis >= alienLeftSide &&
            spawnRightSideXAxis <= alienRightSide
          ) {
            canSpawn = false;
          }

          // Enemy spawn is bigger and its body covers existing enemy
          if (
            spawnLeftSideXAxis <= alienLeftSide &&
            spawnRightSideXAxis >= alienRightSide
          ) {
            canSpawn = false;
          }
        } else {
          canSpawn = false;
        }
      }
    }

    // If the spawning can't be done this time, then just try again on the next
    if (canSpawn) {
      spawn = new Alien(canvas, size);
      // Spawn the alien half off-canvas when it moves it will look like
      // it's entering the game
      // We use negative size value as the y-axis
      spawn.render(xAxis, -(size / 2));
    } else {
      // If spawning did not succeed, try again
      if (attempts < ALIEN_SPAWN_MAX_ATTEMPTS) {
        attemptSpawn();
      }
    }
  };

  attemptSpawn();

  return spawn;
};

export { spawnAlien };
