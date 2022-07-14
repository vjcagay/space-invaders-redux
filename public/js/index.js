import { Alien } from "./characters/alien.js";
import { Missile } from "./characters/missile.js";
import { Turret } from "./characters/turret.js";
import { Sprite } from "./components/sprite.js";

let canvasWidth = 0;
let canvasHeight = 0;

let animationFrameId = 0;

const ALIEN_MAX_POPULATION = 10;
const ALIEN_MOVE_PIXEL = 10;
const ALIEN_SIZE_MULTIPLIER = 10;
const MISSILE_MOVE_PIXEL = -10;

let alienLastUpdateTimeStamp = 0;
let missileLastUpdateTimeStamp = 0;

let alienPopulation = 0;
let missilePopulation = 0;

let turret;

const run = () => {
  const now = Date.now();

  // Spawn and move aliens
  if (now - alienLastUpdateTimeStamp >= 1000) {
    if (alienPopulation < ALIEN_MAX_POPULATION) {
      spawnAlien();
    }

    for (const [_, instance] of Sprite.instances.entries()) {
      if (instance.name === "alien") {
        // Aliens move downwards
        instance.move(0, ALIEN_MOVE_PIXEL);

        // Check if alien reaches the bottom of the canvas.
        // And if it is, game over.
        if (instance.coords.y + instance.size.height >= canvasHeight) {
          instance.explode();
          turret.explode();
          alert("Game Over!");
          window.cancelAnimationFrame(animationFrameId);
          return;
        }
      }
    }

    alienLastUpdateTimeStamp = now;
  }

  // Move the missiles
  if (now - missileLastUpdateTimeStamp >= 50) {
    for (const [_, instance] of Sprite.instances.entries()) {
      if (instance.name === "missile") {
        // Missiles move upwards
        instance.move(0, MISSILE_MOVE_PIXEL);

        // If missile goes out of bounds, destroy it
        if (instance.coords.y < 0) {
          instance.destroy();
          missilePopulation--;
        }
      }
    }

    missileLastUpdateTimeStamp = now;
  }

  animationFrameId = window.requestAnimationFrame(run);
};

const spawnAlien = () => {
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
  for (const [_, instance] of Alien.instances.entries()) {
    if (canSpawn) {
      const instanceLeftSideXAxis = instance.coords.x;
      const instanceRightSideXAxis =
        instanceLeftSideXAxis + instance.size.width;
      const spawnLeftSideXAxis = xAxis;
      const spawnRightSideXAxis = xAxis + size;

      const instanceTopSideYAxis = instance.coords.y;
      const instanceBottomSideYAxis =
        instanceTopSideYAxis + instance.size.height;
      // Enemy spawns always at 0 so no need to check for the top side
      // So the bottom value will always correspond to the spawn's size
      const spawnBottomSideYAxis = size;

      if (spawnBottomSideYAxis < instanceBottomSideYAxis) {
        // These conditions will guarantee a collision, so prevent spawning

        // Enemy spawn's left side rests on existing enemy's body
        if (
          spawnLeftSideXAxis >= instanceLeftSideXAxis &&
          spawnLeftSideXAxis <= instanceRightSideXAxis
        ) {
          canSpawn = false;
        }

        // Enemy spawn's right side rests on existing enemy's body
        if (
          spawnRightSideXAxis >= instanceLeftSideXAxis &&
          spawnRightSideXAxis <= instanceRightSideXAxis
        ) {
          canSpawn = false;
        }

        // Enemy spawn is bigger and its body covers existing enemy
        if (
          spawnLeftSideXAxis <= instanceLeftSideXAxis &&
          spawnRightSideXAxis >= instanceRightSideXAxis
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

    run();
  });
});
