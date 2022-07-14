import { Sprite } from "../components/sprite.js";

/**
 * Create a missile that the Turret will fire.
 */
class Missile extends Sprite {
  constructor(canvas) {
    super(canvas);

    const name = "missile";
    const size = 10;

    this.setSize(size, size).setName(name);
    this.el.style.backgroundPositionY = `-${size * 23}px`;
  }
}

export { Missile };
