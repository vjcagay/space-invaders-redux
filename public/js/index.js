import { Alien } from "./characters/alien.js";
import { Missile } from "./characters/missile.js";
import { Turret } from "./characters/turret.js";
import { Sprite } from "./components/sprite.js";

let canvasWidth = 0;
let canvasHeight = 0;

const ALIEN_MAX_POPULATION = 10;
const ALIEN_MOVE_PIXEL = 10;
const ALIEN_SIZE_MULTIPLIER = 10;
const MISSILE_MOVE_PIXEL = -10;

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
        attemptToSpawn();
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
          if (alien.coords.y + alien.size.height >= canvasHeight) {
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

const attemptToSpawn = () => {
  // Min 10px, Max 100px
  const size =
    (Math.floor(Math.random() * ALIEN_SIZE_MULTIPLIER) + 1) *
    ALIEN_SIZE_MULTIPLIER;
  let xAxis = Math.floor(Math.random() * canvasWidth + 1) - size;

  // Enemy should not hang off the left edge of the canvas
  if (xAxis < 0) {
    xAxis = 0;
  }

  // Enemy should not hang off the right edge of the canvas
  if (xAxis + size > canvasWidth) {
    xAxis = canvasWidth - size;
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
    new Alien(canvas, size).render(xAxis).onPress(moveTurretAndFireToTarget);
    alienPopulation++;
  }
};

const moveTurretAndFireToTarget = (target) => {
  const targetXAxis = target.coords.x;
  const targetWidth = target.size.width;

  const turretXAxis = turret.coords.x;
  const turretWidth = turret.size.width;

  /**
   *    _______
   *  @| ALIEN |@
   *   |_______|
   *
   *       *
   *      _|_  <-- Turret must move to the alien's center
   */
  const xAxisValueToMoveInto = targetWidth / 2 - turretWidth / 2 + targetXAxis;

  // Turret move sideways
  turret.move(xAxisValueToMoveInto - turretXAxis, 0);

  // Let's load the missile
  const missile = new Missile(canvas);

  // We want the missile to show in the middle of the turret
  const missileXAxis =
    turret.coords.x + (turretWidth / 2 - missile.size.width / 2);

  // Let's add some 10px so that the missile will render above the turret
  const missileYAxis = canvasHeight - turret.size.height - 10;

  // Fire away
  missile.render(missileXAxis, missileYAxis);

  missilePopulation++;
};

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const button = document.getElementById("button");

  canvasWidth = parseInt(
    window.getComputedStyle(canvas).width.replace("px", "")
  );
  canvasHeight = parseInt(
    window.getComputedStyle(canvas).height.replace("px", "")
  );

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
