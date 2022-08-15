import { Sprite } from "./sprite.js";

let canvasWidth = 0;
let canvasHeight = 0;

let lastUpdateTimestamp = Date.now();
let animationFrameId = 0;

const MAX_ENEMIES = 10;
const ENEMY_MOVE_PIXEL = 10;
const ENEMY_SIZE_MULTIPLIER = 10;

const run = () => {
  // Objects move downwards

  const now = Date.now();
  if (now - lastUpdateTimestamp >= 1000) {
    lastUpdateTimestamp = now;

    // Generate an enemy per tick until max number
    if (!Sprite.instances.size || Sprite.instances.size < MAX_ENEMIES) {
      const spawnEnemy = () => {
        // Min 10px, Max 100px
        const size =
          (Math.floor(Math.random() * 10) + 1) * ENEMY_SIZE_MULTIPLIER;
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
        for (const [_, instance] of Sprite.instances.entries()) {
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
          new Sprite(canvas)
            .setSize(size, size)
            .render(xAxis < 0 ? 0 : xAxis, 0);
        }
      };

      spawnEnemy();
    }

    // Move all enemies
    for (const [_, instance] of Sprite.instances.entries()) {
      instance.move(0, ENEMY_MOVE_PIXEL);
    }

    // Check for colliions. If an enemy passes threshold, game over.
    for (const [_, instance] of Sprite.instances.entries()) {
      if (instance.coords.y + instance.size.height >= canvasHeight) {
        alert("Game Over!");
        instance.destroy();
        window.cancelAnimationFrame(animationFrameId);
        return;
      }
    }
  }

  animationFrameId = window.requestAnimationFrame(run);
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
    animationFrameId = window.requestAnimationFrame(run);
  });
});
